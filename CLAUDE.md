# CLAUDE.md — Agent pointer (OrdinaryBook)

**Soli Deo Gloria.** Pointer only — household law is not duplicated here.

Book-writing repo. Canonical home of the **`bestselling-voice`** skill and its
research base.

## Read order (mandatory)

| # | Layer | Load |
|---|-------|------|
| 1 | **Soli Deo Gloria** | `open-claw-stuff/skills/soli-deo-gloria/SKILL.md` |
| 2 | **Careful, not clever** | `open-claw-stuff/skills/careful-not-clever/SKILL.md` |
| 3 | **Sophos OS** | `open-claw-stuff/docs/SOPHOS-OPERATING-SYSTEM.md` |
| 4 | **Cognitive memory** | `ken/orchestrator/memory_ops.py`; `open-claw-stuff/admin/recall-memory.mjs` |
| 5 | **Household rulebook** | `open-claw-stuff/docs/HOUSEHOLD-AGENT-RULEBOOK.md` |
| 6 | **Household library** | `open-claw-stuff/skills/household-library/SKILL.md` |

**Do not skip to §5–6 without §1–4.**

### User task gates (P0)

```bash
node open-claw-stuff/admin/library.mjs claim-patron   # once per session
node open-claw-stuff/admin/library.mjs preflight --query "<task>" --patron <your-claimed-name> --merge --repo OrdinaryBook
```

## Layer 2 — This repo

| Resource | Path |
|----------|------|
| **Bestselling-voice skill (canonical)** | `.claude/skills/bestselling-voice/SKILL.md` |
| Research evidence base | `.claude/bestselling-voice-research.md` |
| Book framework (current draft home) | `Romans/.claude/book-framework.md` (*The Night Is Far Gone*) |

**Guard-stack resolution:** `bestselling-voice` binds `like-a-human`,
`voice-audit`, `voice-dna` (canonical in `Romans/.claude/skills/`) and
`writing-shape` (canonical in `ken/.claude/skills/`). Book drafting sessions in
this repo load those from their canonical homes or synced copies.

*Household catalog SSOT:* `open-claw-stuff/.household-library/catalog.jsonl`
