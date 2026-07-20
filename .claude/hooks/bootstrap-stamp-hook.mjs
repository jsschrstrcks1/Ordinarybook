// bootstrap-stamp-hook.mjs — PostToolUse (Read|Bash): machine evidence of bootstrap.
// Records which Layer 0/1 canonical files were actually read this session (R1) and
// observes memory-recall by command execution (spec §4.1 observation table).
// The model never writes stamps; this hook does. Always exits 0 — observation must
// never block a tool (the guard is the blocking half).
// Spec: docs/HOUSEHOLD-LOUD-BOOTSTRAP-REQUIREMENT.md v1.1.0. HLS: loud-bootstrap-impl-claude-code.
import {
  LAYER_SUFFIXES, RECALL_CMD_RE, newStamp, saveStamp, verifyStamp,
  missingLayers, appendEvent, readStdinJson, ALL_LAYERS,
} from "./bootstrap-lib.mjs";

try {
  const input = readStdinJson();
  if (!input) process.exit(0);
  const sessionId = input.session_id || "unknown";
  const tool = input.tool_name || "";
  const now = new Date().toISOString();

  let layerHit = null;
  if (tool === "Read") {
    const fp = String(input.tool_input?.file_path || "");
    for (const [key, suffix] of Object.entries(LAYER_SUFFIXES)) {
      if (fp.endsWith(suffix)) { layerHit = key; break; }
    }
  } else if (tool === "Bash") {
    if (RECALL_CMD_RE.test(String(input.tool_input?.command || ""))) layerHit = "memory-recall";
  }
  if (!layerHit) process.exit(0);

  // Rebuild rather than trust a stamp that fails HMAC (forged/corrupt → start clean).
  let stamp = verifyStamp(sessionId);
  if (stamp === null || stamp === "forged") stamp = newStamp(sessionId);
  if (!stamp.layers_read[layerHit]) stamp.layers_read[layerHit] = now;

  const missing = missingLayers(stamp);
  if (missing.length === 0 && !stamp.ledgered) {
    stamp.ledgered = true;
    appendEvent({
      type: "bootstrap", patron: stamp.patron, session_id: sessionId,
      layers_read: ALL_LAYERS.length, layers_total: ALL_LAYERS.length, enforcement: "guard",
    });
  }
  saveStamp(stamp);
} catch (e) {
  // Fail-open with a loud note: a stamp-hook bug must not break tool calls.
  console.error(`bootstrap-stamp-hook: internal error (observation lost this call): ${e?.message || e}`);
}
process.exit(0);
