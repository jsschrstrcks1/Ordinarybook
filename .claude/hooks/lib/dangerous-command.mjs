// A.B.O.R.T. destructive-command detector — the SINGLE SOURCE OF TRUTH for "this shell command could
// cause catastrophic, irreversible harm and must never run." Pure (no I/O), so every layer imports it:
// the Claude Code PreToolUse hook (.claude/hooks/dangerous-command-guard.js), the git pre-commit/pre-push
// hooks (.githooks/), and the CLI (cluster/scripts/scan-command.mjs).
//
// WHY THIS EXISTS: during a 2026-07-13 verification pass a sub-agent executed a command containing
// `<(ssh atlas rm -rf /)` to "prove" a guard bypass — it only failed to wipe a host because `atlas`
// didn't resolve. Never again. This blocks the class outright, INCLUDING danger hidden inside command
// substitution `$()`, process substitution `<()`/`>()`, backticks, `eval`, `sh -c`, `ssh <host> …`,
// `xargs`, and `find -exec` — the exact wrapping that slipped past the narrow preflight guard.
//
// DESIGN (careful, not clever): a real shell parser is where bypasses hide. Instead we match a small set
// of CATASTROPHIC patterns and only ever treat a dangerous verb as real when it sits at a COMMAND
// boundary (string start, after a separator/opener, or unwrapped by eval/xargs/-exec/sh -c/ssh/sudo) —
// so `grep "rm -rf /"` (danger inside a quoted arg) does not trip, but `a && rm -rf /`, `$(rm -rf ~)`,
// and `<(ssh h rm -rf /)` do. We bias toward BLOCKING: a false block is a minor annoyance; a false pass
// is a wiped disk. If you must reference these strings, put them in a file (Write), not a Bash command.

// A dangerous verb only counts at a command position: the start, after a shell separator/opener, or
// unwrapped by a command-runner. This is the crux that catches nested danger without a full parser.
// PREFIX COMMAND-RUNNERS: verbs that sit in front of the REAL command and run it, so a dangerous
// verb after them is still at a command position. `sudo`/`env`/`xargs`/`ssh` were covered; this
// adds the rest of the class — `command`/`builtin`/`exec` (bypass aliases & functions),
// `nohup`/`setsid`/`nice`/`ionice`/`stdbuf`/`time`/`timeout` (job wrappers people actually type).
// They optionally consume flags (`ionice -c3`) and bare numbers (`timeout 5`) before the verb.
// Found by spensa's 2026-07-15 adversarial pass: `nohup rm -rf /`, `exec rm -rf /`, `command rm
// -rf /`, `timeout 5 rm -rf /` all PASSED the "hardened" detector — the same sieve class C4 named.
//
// 4TH-ROUND ADDITIONS (Lift/Jasnah-lane hostile pass 2026-07-16): spensa's list ALSO missed the
// privilege/isolation runners `doas` (BSD sudo), `su -c` (universal), `runuser`, `watch`, `unshare`,
// `flock <lock>`, `chroot <dir>` — `su -c 'rm -rf /'` and `doas rm -rf /` both PASSED. That FOUR
// hostile rounds still leave common runners open is the whole argument for dangerous-command-deny-
// by-default: a prefix-runner allow-set is unwinnable by enumeration. These close the common ones;
// `flock`/`chroot` consume a bare arg before the verb; `su`/`runuser` carry the command after -c/--.
const PREFIX_RUNNERS = "\\b(?:command|builtin|exec|nohup|setsid|nice|ionice|stdbuf|time|timeout|doas|watch|unshare)\\s+(?:-\\S+\\s+|\\d+\\s+)*";
const ARG_RUNNERS = "\\b(?:flock|chroot)\\s+(?:-\\S+\\s+)*\\S+\\s+";           // consume one bare arg (lockfile / newroot)
const CMDSTR_RUNNERS = "\\b(?:sh|bash|zsh|dash|ksh|su)\\s+-[A-Za-z]*c\\s+|\\brunuser\\b[^\\n;&|]*?--\\s+";  // `-c 'cmd'` / `runuser … -- cmd`
const BOUNDARY =
  "(?:^|[\\n;&|(){}]|&&|\\|\\||\\$\\(|[<>]\\(|`|\\beval\\s+|\\bxargs\\s+(?:-\\S+\\s+)*|\\bsudo\\s+|\\benv\\s+(?:-\\S+\\s+|\\w+=\\S*\\s+)*|" + PREFIX_RUNNERS + "|" + ARG_RUNNERS + "|" + CMDSTR_RUNNERS + "|\\bssh\\s+\\S+\\s+|-exec\\s+)\\s*['\"]?\\s*";
//                                                                                                        ^`env [-flags|VAR=val]* rm`       ^combined interpreter flags (`bash -lc`, not just `-c`)

function normalize(raw) {
  // The shell expands ${IFS}/$IFS to whitespace (the classic word-split obfuscation that turns
  // `rm${IFS}-rf${IFS}/` into `rm -rf /`), so we treat those tokens as whitespace BEFORE matching —
  // otherwise a dangerous verb hides behind ${IFS} at what looks like a non-boundary position.
  // Backslashes before a letter are shell alias-escapes (`\rm` runs the real `rm`, skipping any alias);
  // drop the WHOLE run so the verb canonicalizes to `rm` no matter how many are stacked. A single
  // `\\(?=letter)` stripped only ONE per position in one pass, so `\\rm` / `\\\rm` survived as `\rm`
  // and slipped past the command-boundary check (audit C4 — reproduced). `\\+` strips the full run.
  // Stripping escapes can only REVEAL a hidden verb, never hide one — safe for a scan-only detector.
  //
  // RESIDUAL LIMIT (a static regex cannot canonicalize this — documented, not silently ignored):
  //   • variable indirection: `X=rm; $X -rf /` — resolving $X needs a live shell. Out of reach for
  //     pattern matching; the audit-C4 recommendation is a deny-by-default redesign (own follow-up
  //     task). Write-then-run (`bash ./script.sh` where the unseen script holds the danger) is the
  //     same class. These are why the guard is defense-in-depth behind the agent's P0 posture + human
  //     review, not a sandbox — truly untrusted execution needs OS-level isolation, not regex.
  return String(raw == null ? "" : raw)
    .replace(/\$\{IFS\}|\$IFS\b/g, " ")
    // Strip shell-escape backslash runs before a verb OR a target char. A run before a LETTER
    // canonicalizes the verb (`\rm`→`rm`); a run before a target char (`/ ~ $ . *` and digits)
    // canonicalizes the OPERAND — `rm -rf \/`, `\~`, `\$HOME`, `/\*` are real root/home wipes the
    // shell un-escapes, and stripping only-before-letters left that whole family open (found by
    // the 2026-07-15 hostile pass; the original C4 fix closed the verb side only).
    .replace(/\\+(?=[A-Za-z0-9/~.$*])/g, "")
    .replace(/[ \t]+/g, " ");
}

// Collapse a path to its canonical form so the many SPELLINGS of the filesystem root all reduce to
// "/": `//`, `/.`, `/./`, `/..`, `/../`, `/.//`. A blocklist that enumerates root literally misses
// these (hostile pass 2026-07-15 reproduced `rm -rf //` and `rm -rf /.` as PASSes). Absolute paths
// resolve `.`/`..` segments; a leading-slash path that empties out IS root. Non-absolute inputs are
// returned trimmed of duplicate slashes only (cwd-relative canonicalization would over-reach).
function canonicalizePath(p) {
  if (!p.startsWith("/")) return p.replace(/\/{2,}/g, "/");
  const segs = [];
  for (const s of p.split("/")) {
    if (s === "" || s === ".") continue;
    if (s === "..") { segs.pop(); continue; }   // parent-of-root is still root
    segs.push(s);
  }
  return "/" + segs.join("/");
}

// Is an `rm` operand a whole-filesystem / home / cwd / system-root wipe (vs a specific safe subdir)?
function isCatastrophicTarget(tok) {
  const t = tok.trim();
  const rawBare = t.replace(/^['"]|['"]$/g, "");       // strip surrounding quotes
  // Canonicalize absolute paths so every root spelling (// /. /./ /.. …) collapses to "/" before the
  // literal/system-root checks below. Non-absolute forms (~, $HOME, ., *) keep their original shape.
  const bare = rawBare.startsWith("/") ? canonicalizePath(rawBare) : rawBare;
  const noSlash = bare.replace(/\/+$/, "") || "/";      // drop trailing slashes; keep bare "/"
  const LITERAL = new Set(["/", "~", "$HOME", "${HOME}", ".", "..", "*"]);
  if (LITERAL.has(bare)) return true;
  if (/^\/\*+$/.test(bare)) return true;                // /*  /**
  if (/^~\/?\*?$/.test(bare)) return true;              // ~  ~/  ~/*
  if (/^\$\{?HOME\}?\/?\*?$/.test(bare)) return true;   // $HOME  ${HOME}  $HOME/  $HOME/*
  if (/^\.\/?\*?$/.test(bare)) return true;             // .  ./  ./*   (cwd wipe)
  // PARENT-CLIMB THROUGH HOME — `~/../..`, `$HOME/../../..`, `${HOME}/..` (Lift hostile pass
  // 2026-07-16, a live P0 bypass). These are NEITHER absolute (canonicalizePath never touches
  // them) NOR pure-relative (the `../..` rule above requires the WHOLE target be dots), so both
  // prior fixes missed them — yet the shell expands them to a home ANCESTOR: `~/..` → /home or
  // /Users (a system root), `~/../..` → /. The rule is depth-independent: there is no legitimate
  // `rm -rf` target reached by climbing AT OR ABOVE your home directory (home's only ancestors
  // are the system roots and /). Strip the home prefix and simulate the remainder from home-root
  // depth 0; if any `..` pops to or below 0, the target lands on home itself or an ancestor.
  {
    const homePrefix = /^(?:~|\$\{?HOME\}?)(?:\/|$)/;
    if (homePrefix.test(bare) && /\.\./.test(bare)) {
      const remainder = bare.replace(/^(?:~|\$\{?HOME\}?)/, "").replace(/\*$/, "");
      let depth = 0, minDepth = 0;
      for (const s of remainder.split("/")) {
        if (s === "" || s === ".") continue;
        depth += (s === "..") ? -1 : 1;
        if (depth < minDepth) minDepth = depth;
      }
      // Block if it ever climbs strictly ABOVE home (minDepth < 0 — an ancestor of home),
      // or NET-resolves to home itself (final depth <= 0). A transient dip to home-root that
      // then descends back INTO home (`~/a/../b` → depth 1,0,1) is a real in-home target and
      // must still pass — so this checks net/min, never a transient touch of 0.
      if (minDepth < 0 || depth <= 0) return true;
    }
  }
  // A target that is NOTHING but traversal segments — `../..`, `../../*`, `.././../../` — resolves to a
  // pure ANCESTOR of cwd, and a recursive force-delete of a bare ancestor is never legitimate (a real
  // sibling target NAMES a dir: `../dist`, `../repo/build`). canonicalizePath is absolute-only by
  // design, so the sibling hostile-pass that closed absolute root spellings left this relative
  // parent-climb open — `rm -rf ../../../../../..` reaches / from any depth (spensa cross-review
  // 2026-07-16). Requires a `..` so this never double-covers the `.`/`./` cwd case just above.
  if (/\.\./.test(bare) && /^(?:\.{1,2}\/?)+\*?$/.test(bare)) return true;
  // MIXED traversal that RESOLVES to cwd or a bare ancestor — `x/../../../../..`, `foo/..`,
  // `a/b/../../../..`. A named segment cancelled by a following `..` that then keeps climbing lands
  // on cwd or an ANCESTOR of cwd exactly as pure `../..` does — but the pure-traversal rule just
  // above (whole target must be dots) passes it, because a real name appears first (jasnah hostile
  // pass 2026-07-16, finding 7). Canonicalize the RELATIVE path against a symbolic cwd: a `..` pops a
  // standing named segment, else records a climb above cwd. If NO named segment survives, the target
  // is cwd itself (empty, no leaf) or a bare ancestor (only climbs) — the same catastrophic class.
  // A surviving name (`src/../dist` → dist, `../build` → build) is a real target and passes.
  // Relative-only: absolute paths are canonicalizePath'd into the SYS/LITERAL checks, and a
  // home-prefixed climb was already caught by the parent-climb-through-home block above.
  if (!bare.startsWith("/") && !/^(?:~|\$)/.test(bare) && /\.\./.test(bare)) {
    const stack = [];
    for (const s of bare.replace(/\*$/, "").split("/")) {
      if (s === "" || s === ".") continue;
      if (s === "..") { if (stack.length) stack.pop(); /* else: climb above cwd */ }
      else stack.push(s);
    }
    if (stack.length === 0) return true;   // resolves to cwd or an ancestor of cwd — no named leaf
  }
  // A SINGLE segment under /home or /Users is an entire user home directory (e.g. /home/user — this
  // container's $HOME, /Users/kenbaker — the operator's Mac home). Wiping it is catastrophic even
  // though the literal path isn't `~`/`$HOME`. Two+ segments (/home/user/project) is a subdir → safe.
  if (/^\/(?:home|Users)\/[^/*]+\/?\*?$/.test(bare)) return true;
  const SYS = ["/bin", "/sbin", "/usr", "/etc", "/var", "/lib", "/lib64", "/boot", "/dev", "/proc",
    "/sys", "/root", "/opt", "/System", "/Library", "/Applications", "/Users", "/private", "/Volumes",
    "/cores", "/home"];
  if (SYS.includes(noSlash)) return true;               // exactly a system root (not a subdir under it)
  if (SYS.some((d) => bare === d + "/*")) return true;  // /usr/*  etc.
  return false;
}

// DENY-BY-DEFAULT for the UNRESOLVABLE target class (task dangerous-command-deny-by-default). The
// isCatastrophicTarget blocklist above can only judge a LITERAL operand — it is structurally BLIND to a
// target whose value is decided at runtime, and passes it. That blind spot is the residual the audit
// named "a blocklist cannot enumerate its way to safety". We close the two shapes that are BOTH genuinely
// catastrophic AND have zero legitimate-script exposure (measured across the repo before shipping):
//   1. command substitution — `rm -rf $(…)` / the value could be `/`; a static scan cannot prove it isn't;
//   2. a variable running STRAIGHT into a root-reaching glob — `$X/*`, `$X*`: an unset or `/`-valued var
//      expands to `/*` or `*` (the Steam bug that deleted users' home directories). The safe form guards
//      the var (`${X:?}`) or deletes the directory itself, not its glob.
// Deliberately NARROW so the shared git-content scan does not cry wolf on careful scripts: a variable with
// a FIXED leaf (`$HOME/.cache`, a bare `$D` from mktemp, `$X/build`) is LEFT to the literal blocklist and
// passes here. Only the glob-to-root and command-substitution shapes are denied by default. (The broader
// "a live rm must name a concrete target, not a bare $VAR" posture needs a live-vs-content strictness mode
// — an API change across all callers — tracked as a follow-up, not folded into this shared detector.)
function isUnprovableRecursiveTarget(tok) {
  const u = tok.replace(/['"]/g, "");          // a shell quote can't make an unprovable value provable
  if (/\$\(/.test(u)) return true;             // command substitution: $(…)
  if (/\$\{?\w+\}?\/?\*/.test(u)) return true; // variable directly into a glob: $X* , $X/* , ${X}/*
  return false;
}

// rm at a command boundary → parse its flags+targets, block on recursive+force of a catastrophic
// target, or on --no-preserve-root (a flag whose only purpose is to allow wiping /).
function matchRm(cmd) {
  const re = new RegExp(BOUNDARY + "rm\\b([^\\n;&|`)]*)", "gi");
  let m;
  while ((m = re.exec(cmd))) {
    const tail = m[1] || "";
    if (/--no-preserve-root/.test(tail)) return { sample: ("rm" + tail).trim().slice(0, 120), detail: "--no-preserve-root only exists to wipe /" };
    const flagText = (tail.match(/(?:^|\s)(-{1,2}[A-Za-z-]+)/g) || []).join(" ");
    const recursive = /--recursive/.test(tail) || /-[A-Za-z]*[rR]/.test(flagText);
    const force = /--force/.test(tail) || /-[A-Za-z]*f/.test(flagText);
    if (!(recursive && force)) continue;
    const targets = tail.trim().split(/\s+/).filter((t) => t && !t.startsWith("-"));
    for (const t of targets) if (isCatastrophicTarget(t)) return { sample: ("rm " + tail).trim().slice(0, 120), detail: `recursive force-delete of ${t}` };
    for (const t of targets) if (isUnprovableRecursiveTarget(t)) return { sample: ("rm " + tail).trim().slice(0, 120), detail: `recursive force-delete of an unresolvable target ${t} (deny-by-default: resolve to a literal path, or guard the variable with \${var:?})` };
  }
  return null;
}

function matchChmodChownRoot(cmd) {
  const re = new RegExp(BOUNDARY + "(chmod|chown)\\b([^\\n;&|`)]*)", "gi");
  let m;
  while ((m = re.exec(cmd))) {
    const tail = m[2] || "";
    const recursive = /--recursive/.test(tail) || /(?:^|\s)-[A-Za-z]*R/.test(tail);
    if (!recursive) continue;
    const targets = tail.trim().split(/\s+/).filter((t) => t && !t.startsWith("-"));
    for (const t of targets) if (isCatastrophicTarget(t)) return { sample: (m[1] + tail).trim().slice(0, 120), detail: `recursive ${m[1]} of ${t}` };
    for (const t of targets) if (isUnprovableRecursiveTarget(t)) return { sample: (m[1] + tail).trim().slice(0, 120), detail: `recursive ${m[1]} of an unresolvable target ${t} (deny-by-default: resolve to a literal path, or guard the variable with \${var:?})` };
  }
  return null;
}

// `git clean -f` deletes untracked files git cannot recover; adding -x/-X ALSO removes git-IGNORED
// files (build outputs, local .env, caches) — irreversible loss of state git deliberately keeps out of
// history. Block the forced form that reaches ignored files. Plain `git clean` (no -f) is a no-op git
// refuses, and `git clean -fd` (untracked only) is left allowed to avoid crying wolf on routine cleanup.
function matchGitClean(cmd) {
  const re = /\bgit\s+clean\b([^\n;|&]*)/gi;
  let m;
  while ((m = re.exec(cmd))) {
    const tail = m[1] || "";
    const flags = (tail.match(/(?:^|\s)(-{1,2}[A-Za-z-]+)/g) || []).join(" ");
    const force = /--force/.test(tail) || /-[A-Za-z]*f/.test(flags);
    const ignored = /-[A-Za-z]*[xX]/.test(flags);           // -x / -X → also delete ignored files
    if (force && ignored) return { sample: ("git clean" + tail).trim().slice(0, 120), detail: "force-clean removing git-ignored files (irreversible)" };
  }
  return null;
}

function matchForcePushProtected(cmd) {
  // Block a FORCE-push whose DESTINATION ref is protected. Force is either a global flag
  // (--force, -f; NOT --force-with-lease, the sanctioned safe form) or a leading `+` on a refspec.
  // The protected check is on the DESTINATION (after `:` in `src:dst`), not the source — so
  // `+HEAD:main` and `-f origin topic:production` block, while `+main:feature` (force TO a
  // non-protected ref) and a normal non-force push to main do not. The prior version only matched
  // `+main`/`--force … main` in the same segment and missed every `+src:dst` colon refspec.
  const PROT = /^(?:main|master|prod|production|release)$/;
  // Allow git's global options between `git` and `push` — `git -C <dir> push …`, `git -c k=v push …`
  // (spensa 2026-07-15: `git -C /repo push --force origin main` evaded the old `git\s+push` anchor).
  const re = /\bgit\s+(?:-[A-Za-z]\S*\s+\S+\s+|-[A-Za-z]\S*\s+)*push\b([^\n;|]*)/gi;
  let m;
  while ((m = re.exec(cmd))) {
    const seg = m[0], args = m[1] || "";
    const globalForce = /(?:^|\s)(?:--force(?!-with-lease)|-f)\b/.test(seg);
    const toks = args.trim().split(/\s+/).filter((t) => t && !t.startsWith("-"));  // remote + refspecs, no flags
    for (const t of toks) {
      const plus = t.startsWith("+");
      const body = plus ? t.slice(1) : t;
      const dst = (body.includes(":") ? body.split(":").pop() : body)
        .replace(/^refs\/heads\//, "").replace(/[\^~].*$/, "");   // strip refs/heads/ and ^{}/~N suffixes
      if ((plus || globalForce) && PROT.test(dst)) {
        return { sample: seg.trim().slice(0, 120), detail: "force-push to a protected branch" };
      }
    }
  }
  return null;
}

// severity is "block" for every rule here — all are catastrophic + irreversible.
const RULES = [
  { id: "rm-recursive-root", reason: "recursive force-delete of a filesystem root / home / system dir", test: matchRm },
  { id: "chmod-chown-root", reason: "recursive permission/ownership change on a filesystem root", test: matchChmodChownRoot },
  { id: "no-preserve-root", reason: "--no-preserve-root (only used to erase /)", test: (c) => (/--no-preserve-root/.test(c) ? { sample: "--no-preserve-root" } : null) },
  { id: "disk-dd", reason: "dd writing to a raw device (disk wipe)", test: (c) => { const m = c.match(new RegExp(BOUNDARY + "dd\\b[^\\n;&|]*\\bof=\\/dev\\/\\w", "i")); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
  { id: "device-redirect", reason: "redirecting output onto a raw device", test: (c) => { const m = c.match(/>\s*\/dev\/(?!null|zero|stdout|stderr|tty|random|urandom|fd\/)\w+/i); return m ? { sample: m[0].trim() } : null; } },
  { id: "mkfs", reason: "formatting a filesystem (mkfs/newfs)", test: (c) => { const m = c.match(new RegExp(BOUNDARY + "(mkfs(\\.\\w+)?|newfs)\\b", "i")); return m ? { sample: m[0].trim() } : null; } },
  { id: "diskutil-erase", reason: "diskutil erase/zero/reformat", test: (c) => { const m = c.match(/\bdiskutil\b[^\n;&|]*\b(eraseDisk|eraseVolume|zeroDisk|reformat|apfs\s+delete)/i); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
  { id: "shred-device", reason: "shred against a raw device", test: (c) => { const m = c.match(/\bshred\b[^\n;&|]*\/dev\/\w/i); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
  { id: "fork-bomb", reason: "fork bomb", test: (c) => { const m = c.match(/\w*\(\)\s*\{[^}]*\|[^}]*&[^}]*\}\s*;\s*\S/); return m ? { sample: m[0].trim().slice(0, 60) } : null; } },
  { id: "find-delete-root", reason: "find on / ~ or $HOME with -delete or -exec rm", test: (c) => { const m = c.match(/\bfind\s+(?:-\S+\s+)*(\/|~\/?|\$\{?HOME\}?)\s[^\n;]*(-delete\b|-exec\s+rm\b)/i); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
  // `find . -delete` with no FILTER predicate wipes everything under cwd (same class as `rm -rf .`).
  // Only the unfiltered form blocks: after `find .` we allow a run of non-selecting flags (-maxdepth N,
  // -depth, -xdev …) before -delete/-exec rm, but a predicate (-name/-path/-type/-regex/-size/-mtime…)
  // stops the run, so targeted cleanups like `find . -name '*.tmp' -delete` stay ALLOWED.
  { id: "find-delete-cwd", reason: "unfiltered find in cwd with -delete/-exec rm (recursive cwd wipe)", test: (c) => { const m = c.match(/\bfind\s+\.\s+(?:-(?:maxdepth|mindepth|depth|xdev|mount|noleaf|H|L|P)\S*\s+(?:\d+\s+)?)*(-delete\b|-exec\s+rm\b)/i); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
  { id: "force-push-protected", reason: "force-push to a protected branch (main/master/prod)", test: matchForcePushProtected },
  { id: "git-clean-ignored", reason: "force git-clean that deletes git-ignored files (irreversible)", test: matchGitClean },
  { id: "curl-pipe-shell", reason: "piping a network download straight into a shell/interpreter", test: (c) => { const m = c.match(/\b(curl|wget|fetch)\b[^\n;|]*\|\s*(sudo\s+)?(sh|bash|zsh|dash|python3?|perl|ruby|node)\b/i); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
  // Same execute-remote-code risk as curl|sh, but via process substitution: `bash <(curl …)`,
  // `python3 <(wget -qO- …)`. The interpreter runs a script it just downloaded — no pipe, so the
  // curl-pipe-shell rule misses it. Bias to block (this is the RCE class the pipe rule already covers).
  { id: "interpreter-download-substitution", reason: "interpreter executing a freshly-downloaded script via process substitution", test: (c) => { const m = c.match(/\b(sudo\s+)?(sh|bash|zsh|dash|python3?|perl|ruby|node)\b\s+<\(\s*(curl|wget|fetch)\b/i); return m ? { sample: m[0].trim().slice(0, 120) } : null; } },
];

/**
 * Scan a shell command string.
 * @param {string} raw
 * @returns {{blocked:boolean, matched:Array<{id,reason,sample,detail?}>}}
 */
export function scanCommand(raw) {
  const cmd = normalize(raw);
  const matched = [];
  for (const rule of RULES) {
    let hit;
    try { hit = rule.test(cmd); } catch { hit = null; }   // a rule bug must never crash the guard
    if (hit) matched.push({ id: rule.id, reason: rule.reason, sample: hit.sample || "", detail: hit.detail });
  }
  return { blocked: matched.length > 0, matched };
}

// Human-readable block message for a hook/CLI to print.
export function explain(result) {
  if (!result.blocked) return "";
  const lines = result.matched.map((r) => `  ✗ [${r.id}] ${r.reason}${r.detail ? ` — ${r.detail}` : ""}${r.sample ? `\n      ↳ ${r.sample}` : ""}`);
  return "BLOCKED: this command matches a catastrophic, irreversible pattern and will not run.\n" +
    lines.join("\n") +
    "\nIf this is a false positive: reference the string in a file instead of a live command, narrow the target, or ask the operator to run it manually. This guard errs toward blocking on purpose.";
}

export const RULE_IDS = RULES.map((r) => r.id);
