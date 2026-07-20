#!/usr/bin/env node
// A.B.O.R.T. destructive-command guard — Claude Code PreToolUse hook for the Bash tool.
//
// Reads the hook event JSON on stdin, extracts tool_input.command, and BLOCKS (exit 2) if the command
// matches a catastrophic, irreversible pattern (see cluster/lib/dangerous-command.mjs — the shared
// detector). Exit 2 is the Claude Code contract for "deny this tool call"; stderr is shown to the agent.
//
// This fires for the MAIN agent AND for sub-agents spawned via the Task tool (PreToolUse hooks apply to
// subagent tool calls) — which is the whole point: on 2026-07-13 a sub-agent nearly ran `rm -rf /`
// hidden in a process substitution.
//
// Fail-open on INTERNAL error only (detector unavailable / unparseable event) — never brick every Bash
// call over a guard bug; but a POSITIVE catastrophic match always blocks. Referencing a dangerous string
// in a FILE (Write) is fine — this only inspects live Bash commands.

let scanCommand, explain;
try {
  // Canonical location first (open-claw-stuff), then the repo-local synced copy that
  // admin/onboard-loud-bootstrap.mjs ships to every other household repo.
  const candidates = ["../../cluster/lib/dangerous-command.mjs", "./lib/dangerous-command.mjs"];
  let lastErr;
  for (const rel of candidates) {
    try { ({ scanCommand, explain } = await import(new URL(rel, import.meta.url))); break; }
    catch (e) { lastErr = e; }
  }
  if (!scanCommand) throw lastErr;
} catch (e) {
  process.stderr.write(`⚠ dangerous-command-guard: detector unavailable, allowing — ${e?.message || e}\n`);
  process.exit(0);
}

let input = "";
try { for await (const chunk of process.stdin) input += chunk; } catch { /* no stdin */ }

let command = "";
try {
  const evt = JSON.parse(input || "{}");
  if (evt.tool_name && evt.tool_name !== "Bash") process.exit(0);   // only inspect Bash
  command = evt?.tool_input?.command || "";
} catch {
  process.exit(0);   // unparseable event → not our danger, don't block
}
if (!command.trim()) process.exit(0);

const result = scanCommand(command);
if (result.blocked) {
  process.stderr.write("⛔ A.B.O.R.T. destructive-command guard\n" + explain(result) + "\n");
  process.exit(2);   // 2 = block the tool call
}
process.exit(0);
