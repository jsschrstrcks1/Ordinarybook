// bootstrap-lib.mjs — shared logic for the loud-bootstrap stamp hook + guard.
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md v1.1.0 (R1–R3).
// HLS: loud-bootstrap-impl-claude-code.
//
// Tamper-evidence grade: FRICTION, not proof (named limit, spec §4.1). Stamps live
// outside the repo tree and carry an HMAC keyed by a hook-held secret; a model with
// unrestricted shell could read the secret and forge — this defeats drift and
// laziness (the decay mode the requirement targets), not a deliberate adversary.
// Proof-grade attestation requires gateway-side/remote enforcement.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const REPO_NAME = path.basename(REPO_ROOT);

// Layer keys → canonical file suffix (read-observed). memory-recall is
// command-observed (spec §4.1 per-layer observation table).
export const LAYER_SUFFIXES = {
  "soli-deo-gloria": "skills/soli-deo-gloria/SKILL.md",
  "careful-not-clever": "skills/careful-not-clever/SKILL.md",
  "sophos-os": "docs/SOPHOS-OPERATING-SYSTEM.md",
  "household-rulebook": "docs/HOUSEHOLD-AGENT-RULEBOOK.md",
  "household-library": "skills/household-library/SKILL.md",
};
export const RECALL_CMD_RE = /(memory_ops\.py\s+recall|recall-memory\.mjs)/;
export const ALL_LAYERS = [...Object.keys(LAYER_SUFFIXES), "memory-recall"];

// Stamp root is HOUSEHOLD-SHARED, not per-repo (v1.2.0, A4/A5): the six-layer read
// order is household-global and a session is one session across every repo it
// touches — per-repo buckets would demand the same canonical reads once per repo,
// and a multi-repo session bootstrapped in one repo would be denied in the next.
// One session, one stamp, N onboarded repos consulting it. (Env override unchanged.)
export function stampRoot() {
  return process.env.HOUSEHOLD_BOOTSTRAP_ROOT
    || path.join(os.homedir(), ".claude", "household-bootstrap", "household");
}

export function eventsPath() {
  return process.env.HOUSEHOLD_BOOTSTRAP_EVENTS
    || path.join(REPO_ROOT, ".household-library", "events.jsonl");
}

function secretPath() { return path.join(stampRoot(), ".secret"); }

export function getSecret() {
  const p = secretPath();
  try { return fs.readFileSync(p, "utf8").trim(); } catch {}
  fs.mkdirSync(stampRoot(), { recursive: true });
  const s = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(p, s, { mode: 0o600 });
  return s;
}

export function hmacOf(stamp, secret) {
  const { hmac, ...body } = stamp;
  const canon = JSON.stringify(body, Object.keys(body).sort());
  return crypto.createHmac("sha256", secret).update(canon).digest("hex");
}

// A session_id is only a valid bootstrap KEY if it uniquely names ONE session. A missing/blank id —
// or the literal "unknown" fallback — is shared by every id-less session, so the first such session
// to complete its reads leaves a complete `unknown.json` that EVERY later id-less session inherits
// without reading a thing (the guard's allow-fast-path then passes them). That silently disables the
// whole loud-bootstrap requirement — the exact decay mode it exists to make loud. So an invalid id can
// stamp (within-process forensics) but must NEVER satisfy the gate. (loud-bootstrap-sessionid-contract)
export function sessionIdValid(raw) {
  const s = String(raw ?? "").trim();
  return s !== "" && s.toLowerCase() !== "unknown";
}

export function stampPath(sessionId) {
  const safe = String(sessionId || "unknown").replace(/[^A-Za-z0-9_.-]/g, "_");
  return path.join(stampRoot(), `${safe}.json`);
}

export function loadStamp(sessionId) {
  try { return JSON.parse(fs.readFileSync(stampPath(sessionId), "utf8")); }
  catch { return null; }
}

export function newStamp(sessionId) {
  const layers = {};
  for (const k of ALL_LAYERS) layers[k] = null;
  return {
    session_id: String(sessionId || "unknown"),
    runtime: "claude-code",
    repo: REPO_NAME,
    patron: process.env.HOUSEHOLD_PATRON || "claude-code",
    started_at: new Date().toISOString(),
    layers_read: layers,
    grade: "friction",
    written_by: "bootstrap-stamp-hook.mjs",
    ledgered: false,
    denials: 0,
  };
}

export function saveStamp(stamp) {
  fs.mkdirSync(stampRoot(), { recursive: true });
  stamp.hmac = hmacOf(stamp, getSecret());
  fs.writeFileSync(stampPath(stamp.session_id), JSON.stringify(stamp, null, 2) + "\n");
}

// null = missing; "forged" = HMAC mismatch; otherwise the verified stamp object.
export function verifyStamp(sessionId) {
  const stamp = loadStamp(sessionId);
  if (!stamp) return null;
  if (!stamp.hmac || stamp.hmac !== hmacOf(stamp, getSecret())) return "forged";
  return stamp;
}

export function missingLayers(stamp) {
  if (!stamp || stamp === "forged") return [...ALL_LAYERS];
  return ALL_LAYERS.filter((k) => !stamp.layers_read?.[k]);
}

export function appendEvent(ev) {
  try {
    const line = JSON.stringify({ at: new Date().toISOString(), runtime: "claude-code", repo: REPO_NAME, ...ev });
    fs.appendFileSync(eventsPath(), line + "\n");
  } catch { /* ledger append is best-effort; never break the hook over it */ }
}

export function readStdinJson() {
  try { return JSON.parse(fs.readFileSync(0, "utf8")); } catch { return null; }
}
