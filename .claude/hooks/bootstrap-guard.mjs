// bootstrap-guard.mjs — PreToolUse (Edit|Write|NotebookEdit|Bash): the loud half.
// Denies repo mutations when the session lacks a complete, HMAC-valid bootstrap
// stamp (R2). Forged stamps (HMAC mismatch) are denied harder than missing ones.
// Escape hatch: HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 → warn-only (spec: fail-closed
// but overridable). Internal guard errors fail OPEN with a loud note — a guard bug
// must not brick every sibling session (named implementation limit).
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md v1.1.0. HLS: loud-bootstrap-impl-claude-code.
import path from "node:path";
import {
  REPO_ROOT, verifyStamp, loadStamp, newStamp, saveStamp, missingLayers, appendEvent, readStdinJson,
  sessionIdValid,
} from "./bootstrap-lib.mjs";

const MUTATING_BASH_RE = new RegExp(
  [
    // Flags may sit between the binary and the verb (git -C <path> commit,
    // git --no-pager merge) — hostile-R2 found the plain \s+ form bypassable.
    // [^|&;]* keeps the match inside one shell command; the false-positive cost
    // (e.g. `git log --grep=commit` pre-bootstrap) is accepted — the remedy is
    // reading the layers, and warn-mode remains the escape hatch.
    String.raw`\bgit\b[^|&;]*?\b(commit|push|merge|rebase|reset)\b`,
    String.raw`(^|[;&|]\s*)rm\s`,
    String.raw`(^|[;&|]\s*)mv\s`,
    String.raw`\bsed\s+-i\b`,
    String.raw`library\.mjs['"]?\s+(register|checkout|release|complete|verify|reassign)\b`,
  ].join("|"),
);

function isRepoMutation(input) {
  const tool = input.tool_name || "";
  if (tool === "Edit" || tool === "Write" || tool === "NotebookEdit") {
    const fp = String(input.tool_input?.file_path || input.tool_input?.notebook_path || "");
    return fp && path.resolve(fp).startsWith(REPO_ROOT + path.sep);
  }
  if (tool === "Bash") return MUTATING_BASH_RE.test(String(input.tool_input?.command || ""));
  return false;
}

try {
  const input = readStdinJson();
  if (!input || !isRepoMutation(input)) process.exit(0);

  const idValid = sessionIdValid(input.session_id);
  const sessionId = idValid ? input.session_id : "unknown";
  const stamp = verifyStamp(sessionId);
  const missing = missingLayers(stamp);
  // Allow ONLY a uniquely-identified session with a complete, HMAC-valid stamp. An invalid id
  // (missing/blank/"unknown") is refused here even if a complete `unknown.json` exists, because that
  // stamp cannot be attributed to THIS session — honoring it is the cross-session inheritance bypass
  // (loud-bootstrap-sessionid-contract). Such a session falls into the loud path below.
  if (idValid && stamp && stamp !== "forged" && missing.length === 0) process.exit(0); // bootstrapped — allow

  const blocking = process.env.HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK !== "0";
  const forged = stamp === "forged";
  const toolDesc = input.tool_name === "Bash"
    ? `Bash: ${String(input.tool_input?.command || "").slice(0, 120)}`
    : `${input.tool_name}: ${input.tool_input?.file_path || ""}`;

  // Ledger the denial (capped per session so a retry loop can't flood the bus).
  let counter = loadStamp(sessionId);
  if (!counter || typeof counter !== "object") counter = newStamp(sessionId);
  if (forged) { counter = newStamp(sessionId); counter.forge_detected = true; }
  counter.denials = (counter.denials || 0) + 1;
  if (counter.denials <= 3) {
    appendEvent({
      type: "bootstrap_guard_denial", patron: counter.patron, session_id: sessionId,
      denied_tool: input.tool_name, missing_layers: missing, forged, blocked: blocking,
      sessionid_invalid: !idValid,
    });
  }
  saveStamp(counter);

  const msg = [
    forged
      ? "BOOTSTRAP GUARD: stamp failed HMAC verification — a hand-written stamp is testimony, not evidence (spec R1/R5). Forgery is itself a governance finding."
      : !idValid
        ? "BOOTSTRAP GUARD: this session has no stable session_id, so its bootstrap cannot be attributed — a shared `unknown` stamp would let any un-read session inherit another's reads. Refusing (loud-bootstrap-sessionid-contract). The runtime must supply session_id, or use the escape hatch."
        : `BOOTSTRAP GUARD: this session has not completed the Layer 0/1 read order (missing: ${missing.join(", ")}).`,
    `Denied: ${toolDesc}`,
    "Read the layers in CLAUDE.md §Read order (SDG → careful-not-clever → Sophos OS → memory recall → rulebook → household-library); the stamp hook records reads automatically.",
    "Operator escape hatch: HOUSEHOLD_BOOTSTRAP_GUARD_BLOCK=0 (warn-only). Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md",
  ].join("\n");

  console.error(msg);
  process.exit(blocking ? 2 : 0);
} catch (e) {
  console.error(`bootstrap-guard: internal error, failing OPEN (named limit — guard bugs must not brick sessions): ${e?.message || e}`);
  process.exit(0);
}
