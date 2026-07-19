---
kind: skill
name: bestselling-voice
description: >-
  The positive craft layer for book writing — what prose that sells actually
  does. Fires during planning, drafting, and revising book chapters (The Night
  Is Far Gone and future trade books). Binds the anti-LLM guard stack
  (like-a-human, voice-audit, writing-shape, voice-dna) with book-recalibrated
  thresholds: chapter-scale caps, pulpit-liturgy strip rules, cross-chapter
  template variation, and a merged post-draft gate. Supplies the propulsion,
  clarity, and chapter mechanics that make a stranger keep reading. Evidence
  base: .claude/bestselling-voice-research.md.
version: "1.1.0"
license: LicenseRef-Proprietary
category: writing
keywords:
  - book
  - voice
  - bestseller
  - propulsion
  - windowpane
  - chapter-craft
  - pulpit-to-page
  - anti-llm
  - machine-tells
  - authenticity
activation: automatic
runtimes: [claude-code, hermes, grok, codex]
capabilities: [read, edit]
related_skills:
  - like-a-human
  - voice-audit
  - voice-dna
  - writing-shape
  - every-meal
  - thus-says-the-lord
  - careful-not-clever
---

# Bestselling Voice — The Craft That Keeps a Stranger Reading

*Fires during book planning, drafting, and revision. Supplies what the guard
skills don't: the positive shape of prose that sells.*

> **Canonical home: `OrdinaryBook` (this repo).** The copy in
> `Romans/.claude/skills/bestselling-voice/` is a synced copy — edit here,
> sync there. The guard skills this stack binds keep their own canonical
> homes: `like-a-human`, `voice-audit`, `voice-dna` in `Romans`;
> `writing-shape` in `ken`. The research evidence base travels with this
> skill: `.claude/bestselling-voice-research.md` (this repo).

## The guard stack (binding, in order)

Book work runs the full anti-LLM voice stack. This skill does not replace the
guard skills — it binds them to book work and recalibrates their thresholds
for chapter scale (§11).

| Stage | Skill | Role in book work |
|---|---|---|
| During writing | **like-a-human** | Every ban and cap applies to book prose: hard/soft vocabulary bans, copula avoidance, -ing tailing, rule-of-three, synonym cycling, adverb kill, announcement-before-move, therapeutic verbs, stock folksy phrasing, superlatives, manufactured insider, composite-story rule, image-density caps — all of it, unchanged except where §11 recalibrates a threshold. |
| During writing | **bestselling-voice** (this skill) | The positive craft: propulsion, clarity, chapter mechanics (§1–10) + book calibration of the guards (§11). |
| Post-draft | **voice-audit** | The machine-tell grep scans, seam detection, conviction/cadence/doctrinal checks, and risk rating run on every chapter — in **book mode** (§11.3): the sermon liturgical-structure check is suspended and replaced by this skill's post-flight. |
| Post-draft | **writing-shape** | Structural tight-cluster check, applied per the book's genre row (§11.5). |
| Calibration | **voice-dna** | The sermon corpus remains the voice baseline until enough book chapters exist to profile a book corpus; then re-run and calibrate book-mode thresholds empirically. |

Precedence: where anything in §1–10 could be read as licensing a pattern the
guard skills ban, **the guard skills win**. Craft never overrides authenticity,
and neither overrides careful-not-clever's verification rules. The one
systematic exception: sermon *liturgy* requirements (§11.3) do not bind the
book — those are drift *into* the page, not voice.

**The governing difference between pulpit and page:** the congregation is
captive and listening; the reader is free and skimming. A sermon is owed
attention for forty minutes. A book earns attention one page at a time.
Every rule below serves that single fact.

Evidence for every principle: `.claude/bestselling-voice-research.md`
(Sanderson, Capote, King, Child, Grisham, Lewis, Lucado, Keller, Warren,
Yancey, Zinsser, Archer & Jockers, plus publisher norms). Quotes there are
sourced; do not re-cite from memory.

---

## 1. Windowpane by default, stained glass by choice

Orwell: "Good prose is like a windowpane." Sanderson's working version: craftsman
style throughout, with "a little stained glass" permitted at a chapter opening to
set tone — then back to windowpane.

- Default register: clear, plain, invisible. The reader sees Romans, not the prose.
- Budget lyrical passages deliberately: a chapter opening, a gospel landing. One
  or two stained-glass moments per chapter, placed where the weight is.
- If a sentence makes the reader notice its cleverness, it has failed even if it
  is beautiful (this is the Window Pane Principle from like-a-human, extended:
  the *budget* for deliberate beauty is small and placed, not scattered).

## 2. The reader is always owed something

The propulsion engine every mega-seller runs on. Child: "Ask a question at the
beginning, and answer it at the end." Brown: suspense is "making promises."
Sanderson: promises, *felt* progress, payoffs that are "unexpected and inevitable."

- **Book scale:** the night-to-dawn promise is made in chapter one and paid in
  Romans 13. Every part boundary must show the sky lightening — felt progress
  on the one promise the reader bought the book for.
- **Chapter scale:** each chapter opens by raising one question the reader
  actually has (the burden, the objection, the text's own tension) and closes by
  paying it — while raising the next. Track open promises like Brown's list of
  17; pay every one or cut the promise.
- **Never cheat.** Sanderson's First Law, translated: the resolution must be
  built from material the reader already holds. In this book that means the
  answer always comes from the text of Romans already put in front of them —
  never from a doctrine parachuted in unannounced.
- **The chapter-ending dial:** end on tension for a hard pull into the next
  chapter (use at part-interior boundaries); end on a small resolution to let
  the reader breathe (use before part transitions). Choose per chapter — never
  default.

## 3. Write to be read by a tired person at grade 6–8

Bestsellers cluster at 4th–9th grade readability. King ~6th. Gladwell writes at
8th on purpose. Lucado writes "for people who don't really like to read books."
The Bestseller Code winners: contractions, short sentences, ordinary words,
questions. This is compression, not condescension.

- Contractions stay in print (Lewis kept them — the talk-like register IS the book).
- Ordinary words: King's rule — the first word that comes to mind, if appropriate
  and colorful. The translation move from the sermons ("that's a fancy way of
  saying...") carries to the page: technical term, then plain gloss.
- Sentence length averages short, with deliberate spikes. Paragraphs short enough
  to leave white space — "solid print pages turn away a reader" (publisher norm).
- Chapter budget: ~3,000–4,000 words. Book budget: 40–50k. When a chapter runs
  long, split it or cut it — never densify it.

## 4. One idea per chapter, one image per book

Zinsser: leave the reader with one provocative thought — "not two thoughts, or
five — just one." Piper carried a book for 40 years on one portable sentence.
The Bestseller Code: winners concentrate ~30% of the text on one or two topics.

- Each chapter distills to one sentence before drafting begins (Lucado's method:
  distill the truth to one sentence, then wrap a story around it). Write that
  sentence at the top of the working file. If a paragraph doesn't serve it, the
  paragraph belongs to another chapter or to the cutting floor.
- The book's one image (night → dawn) obeys the existing controlling-metaphor
  density rule: promised early, progressed at boundaries, paid at the end —
  landing a few times per chapter, not per paragraph.
- Give the book its portable sentence: one line a reader can carry out of the
  book and repeat without the book in hand. Draft it early; test it against
  every part.

## 5. Story first, doctrine through it

Gladwell cold-opens on one person and zooms out. Lucado wraps the distilled
sentence in a story. Lewis runs every doctrine through the analogy engine
(moral law as sheet music). King: situation over plot — a person in a
predicament, working free.

- Open chapters at the human predicament — the insomniac at 3 a.m., the
  addict's craving hour, Paul under house arrest — not at the exposition.
  The burden table in book-framework.md is the chapter-opening menu.
- The doctrine arrives *through* the person and the text, named after it is
  felt. (This is the sermons' native move — Assembled Terminology vs. Lived
  Reality — promoted to structural law.)
- Analogy discipline per Lewis: domestic, everyday, load-bearing. One analogy
  carried honestly beats three decorating the page (like-a-human's image-density
  caps apply unchanged).

## 6. Cut like the sellers cut

King: 2nd draft = 1st draft − 10%. Grisham: read each sentence three times
hunting words to cut. Leonard: leave out the parts people skip. Hemingway: what
you omit still radiates. Lucado: "every word must earn its place on the page."

- Apply the −10% pass to every chapter draft, measured (word count before/after).
- The skim test: read the chapter asking "which paragraphs would a tired reader
  skip?" Those paragraphs are cut or converted into scene.
- Oral repetition dies at the page. The sermon says it three ways because the
  room can't rewind; the book says it once because the reader can reread.
  When importing sermon material, collapse every restatement to its sharpest
  single form.
- No throat-clearing. "Avoid prologues, begin with chapter one" (Grisham).
  Everything before the story starts is "there for the author, not for the
  reader" (Jane Friedman) — cut it. No chapter opens with a paragraph about
  what the chapter will do; signal subject and tone by *doing* (Sanderson's
  stealth thesis: the opening paragraph shows the chapter's matter and register
  without announcing it — fully compatible with the Announcement-Before-Move ban).

## 7. Rhythm is load-bearing — spend it at the ends

Capote: a story can be wrecked by "a faulty rhythm in a sentence — especially
if it occurs toward the end." Didion: the last sentence "should make you go
back and start reading from page one." Hemingway rewrote his last page 39 times.

- The last sentence of every chapter is the turn-the-page mechanism. It gets
  Hemingway-grade revision — more passes than any other sentence in the chapter.
- First lines invite (King: "Listen. Come in here. You want to know about
  this."). Specificity beats cleverness; assured beats flashy; something happens.
- The existing cadence rules (building pattern, shrinking sentences at climax,
  breath test) carry over from like-a-human unchanged. What this skill adds is
  *placement*: spend the strongest rhythm at chapter ends and gospel landings,
  and let the middle of the chapter run plain.

## 8. The heartbeat across chapters

The Bestseller Code: winners show a regular pulse of emotional highs and lows.
Child: pace "means nothing unless it's contrasted with a calmness inside the
novel" — and write the fast stuff slow, the slow stuff fast.

- Sequence weight and relief at *book* scale: Midnight presses down; the Alarm
  releases; the war of Romans 7 presses; Romans 8 releases. Do not let two
  crushing chapters or two comfortable chapters sit adjacent without intent.
- Within a chapter, the sermons' law-then-gospel arc already produces the pulse;
  keep it, but let the *depth* of the low and the *height* of the high vary
  chapter to chapter so the EKG doesn't flatline into template (writing-shape's
  tight-cluster warning, applied to emotional structure).
- Slow down at the crisis: when the chapter reaches its heaviest moment, expand
  the scene — short sentences, close detail. Speed up the connective tissue
  or delete it.

## 9. The stranger test and the felt need

The pew is captive; the buyer is a stranger. Publishing's one question of a
sermon-series book: *why would a stranger keep reading?* Titles and chapters
sell a felt need — "a need people know they have and actively search for
something to fill" (Laube).

- Every chapter must work for a reader who has never heard Ken preach, doesn't
  know the church, and picked the book up because the night is long. Assume no
  shared history; earn everything on the page.
- Address the reader as one person (Warren: second person from sentence one;
  Zinsser: "an intimate transaction between two people"). The sermons'
  preacher-with-the-flock stance adapts: on the page it is one reader, met in
  their 3 a.m., joined by a writer under the same Word — "we" still outranks
  a lecturing "you" (like-a-human's pronoun-stance thresholds apply).
- Chapter titles carry the felt-need promise, not the outline label. "The War
  in the Dark" sells; "Romans 7:13–25 Exegesis" does not. The draft chapter
  map in book-framework.md already has this right — protect it.
- Honesty is the differentiator on this shelf (Yancey). Name the doubt, the
  relapse, the silent years — the reader trusts the writer who has been in the
  dark, and only a trusted voice can walk them toward dawn.

## 10. What NOT to import from the bestseller lists

Craft transfers; gimmicks and compromises do not.

- **No manufactured intimacy.** Jesus Calling sold 45M on first-person-God voice;
  it is doctrinally off-limits here and would be a false voice besides.
- **No Patterson chapters.** Two-page chapters serve thrillers; this book's unit
  is the sermon-descended chapter at 3–4k. Take the principle (the chapter is
  the unit of propulsion), not the form.
- **No withheld-thesis games with the gospel.** Gladwell's calculated withholding
  works for ketchup; the gospel is declared, not teased. Withhold *resolution
  of the reader's question* to create pull — never clarity about what the text says.
- **No invented material.** Capote's fabricated ending is the standing warning:
  reconstructed scenes and composite stories fall under careful-not-clever and
  the Composite-Personal-Story rule — attribute uncertainty or cut.
- **No marketing cadence.** The Bestseller Code describes winners; it does not
  license keynote rhythm, benefit stacking, or urgency theater. Prophetic weight
  comes from the text (like-a-human's promotional-drift rules stand).

## 11. The anti-LLM gate — book calibration of the guard skills

The guard skills were calibrated on 30-minute sermon manuscripts read a week
apart by a congregation that knows the preacher. A book chapter is 3–4k words
read minutes apart by a stranger. Same voice, same bans — different thresholds,
plus one class of tell sermons never face and one class of sermon *requirement*
that becomes a book *defect*.

### 11.1 What applies unchanged

Everything word- and sentence-level in like-a-human and voice-audit: the
hard/soft vocabulary bans, copula avoidance ("serves as" → "is"), participial
-ing tailing, synonym cycling, decorative adverbs, hedging stacks, false
ranges, unwarranted superlatives, manufactured insider, self-endorsing
importance claims, therapeutic/cognitive verbs, stock folksy phrasing,
symmetric-contrast closure, keynote-cadence mirroring, abstract-authority
density, predictable identity archetype, composite-personal-story rule,
announcement-before-move (zero-target), punctuation fingerprint (≤2 em-dashes
per paragraph; ellipses ≤1 per page), the surprise word (1–2 per page), the
controlled flaw, structural breathing, and the Safety Root Cause diagnostic
("am I writing this because the chapter needs it, or because I don't trust the
next sentence?"). The local-model accent scans (Qwen/Gemma) run on any
fleet-drafted chapter before anything else does.

### 11.2 Recalibrated thresholds (sermon → chapter → book)

Chapters compound. A device used once per sermon is invisible across a year of
Sundays; the same device once per chapter is a visible tic by page 60. Per-unit
caps tighten, and a new axis appears: **cross-chapter variation**.

| Pattern | Sermon cap (guard skills) | Book calibration |
|---|---|---|
| Antithetical parallelism ("Not X. Not Y. *Z.*") | 1–2 per sermon | ≤1 per chapter, AND not at the same structural position (e.g. the gospel landing) in consecutive chapters |
| Staccato negation triads | ≤4 per sermon | ≤2 per chapter; count across the whole part before final draft |
| Imperative-listening cues ("Hear me," "Listen," "Mark this") | ≤6 per sermon | ≤1 per chapter. These are audio cues; on the page nearly all are filler. Gear-shifts ("Now —") survive; commands to listen mostly don't. |
| Daisy-chain escalation ("If not X, then Y…") | 3–4 steps max | Same per instance; ≤1 instance per chapter, not in adjacent chapters |
| Perfect parallel-image triplets | cut to strongest | Same — and never the same *category ladder* twice in the book |
| Image density | ≤1 image/paragraph, 2 borderline | Same, plus: one chapter's controlling illustration must not reappear as another chapter's (dead-metaphor rule at book scale) |
| Night/dawn controlling metaphor | ≤30 refs/30-min sermon; 4–6 load-bearing ideal | 4–6 landings per chapter (opening, doctrinal weight, gospel landing, page-turn line); heavier at part boundaries; run a whole-book density count before final draft — the image must crescendo toward Romans 13, not sit at uniform density |
| Pronoun stance (you-to-we ratio) | ≤2.0, aspiration 1.0–1.5 | ≤2.0 stands as the drift gate. Deliberate second-person openings are shelf-proven (Warren) and allowed; universal sin-diagnostics and divine-action passages stay "we/us" — the writer is under the same Word as the reader. |
| Closing-prayer stanzas | ≤5 | N/A — chapters don't close with prayers. If a chapter ends in prayer, it's imported sermon liturgy; cut or convert (a book-wide closing prayer may live in the final chapter only). |
| Ellipses | ≤1 per page | Same |
| Assumed familiarity ("as we saw…") | Verify against sermon-map or cut | Inverted scope: congregation-history claims ("when we preached…," "many of you remember") are **always cut** — the stranger wasn't there. Internal cross-references ("we saw in chapter 2…") are legitimate but must be verified against the actual earlier chapter (careful-not-clever) and kept sparse — the reader can flip back; trust them to. |

**The new axis — cross-chapter template repetition.** Sermons never face this;
books always do. Before final draft of each part, lay the chapters side by side
and check: same opening move (e.g., every chapter cold-opens on a 3 a.m.
scene)? Same climax device? Same closing cadence? Same paragraph-length
profile? Any shape that repeats in 3+ consecutive chapters is a template — vary
it deliberately (this is writing-shape's tight-cluster warning applied at
chapter grain). The heartbeat (§8) varies by design; the *machinery* must too.

### 11.3 Pulpit liturgy does not cross to the page

voice-audit's Structural Continuity Check *requires* these in a Sunday sermon.
In the book they are transcription residue and every one is a strip-target:

- Bible-handling cues: "If you have a Bible, and I hope you have…," "While
  you're turning there…," "Open with me to…," "Turn with me…"
- The People Group of the Week paragraph (sermon liturgical signature; a book
  chapter with one is an unconverted sermon)
- Congregational engagement markers: "Amen?", "Say it with me," "Take out a
  pen," "Don't raise your hand, but…"
- Pulpit deixis: "this morning," "this evening," "as we gather," "within the
  sound of my voice," "before we go to lunch"
- The closing invitational cluster ("If X, come talk to me…") — the book's
  invitation lives once, in the final chapter, written for a reader who cannot
  come talk to anyone; each chapter closes on the page-turn line instead (§7)
- Live call-and-response and altar/communion/baptism logistics

**Grep (run on every chapter drafted from sermon material):**
```
this morning|this evening|as we gather|sound of my voice|say it with me|amen\?|take out a pen|raise your hand|turn with me|while you're turning|if you have a Bible|open with me|come talk to me|as we close|people group
```
Every hit is a presumptive strip. What survives is only what has been
deliberately rewritten for the page (e.g., a scene *about* the congregation
responding, told to the reader as story).

The sermon's **translation move** ("that's a fancy way of saying…") and the
**voiced objection** ("Someone is going to say…") DO cross — they are voice,
not liturgy — under their existing caps.

### 11.4 Book-mode voice-audit run

Post-draft, run voice-audit with these substitutions:

1. All machine-tell scans, seam detection, announcement scan, image-density
   scan, abstract-authority scan, archetype scan: **run as written**, with
   §11.2 thresholds where they differ.
2. Structural Continuity Check: **suspended** — replaced by §11.3 strip-grep
   and the post-flight below.
3. Voice Continuity Check: run, with two book adjustments — the refrain ("The
   night is far gone…") is checked at *book* cadence per the §11.2 metaphor
   budget, not per-chapter presence; and "direct pastoral address" reads as
   direct *reader* address (the 3 a.m. reader, the relapsed reader), one per
   major movement, "Some of you" → "Maybe you."
4. Conviction, Cadence, Doctrinal Sharpness checks: run as written. Law still
   lands before comfort. The TED-talk and corporate-retreat tests apply with
   extra force — trade nonfiction drifts toward keynote register faster than
   sermons do.
5. Authenticity Risk rating: assign per chapter AND per part; a part whose
   chapters each pass but read identically fails on cross-chapter template
   (§11.2) at Medium risk minimum.

### 11.5 writing-shape, applied to this book

Genre row: trade Christian nonfiction with narrative openings — a hybrid the
transfer matrix splits cleanly:

- **Universal rows (always):** named references over vague allusions (name the
  town, the year, the hymn, the chapter of Romans — the sermons' real-name
  autobiography is the book's strongest human signature; keep names, dates,
  small specifics). Name the feeling at least once plainly — not every emotion
  as a body metaphor.
- **Doctrine and application sections:** the sermon/pastoral column governs —
  explicit, tidy, single-track is CORRECT. State the thesis. No ambiguity games
  with the gospel (§10).
- **Story and anecdote sections:** the narrative column applies — don't state
  the anecdote's moral before the reader feels it; let a story land and trust
  the reader for a beat before the doctrine names it (this is Gladwell's loop
  and the sermons' native pause-and-pivot, not a license for ambiguity about
  what the text says); honest loose threads are allowed in *testimony* (the
  prodigal who hasn't come home yet stays not-home if that's the truth —
  Yancey's honesty rule).
- **Privacy boundary stands:** chapters built on congregation or family
  material never go to external models for cross-audit; Mode A (self-audit)
  only.

---

## Chapter pre-flight (before drafting)

1. One-sentence distillation written at the top of the file.
2. The chapter's question named — whose burden, which tension in the text.
3. The opening predicament chosen (person, scene, hour — specific).
4. Position in the heartbeat known: does this chapter press or release?
5. Ending type chosen on the dial: tension-pull or breath.
6. Word budget set (~3,000–4,000).

## Chapter post-flight (after drafting)

1. −10% pass done, word counts recorded.
2. Skim test run; skipped paragraphs cut or converted to scene.
3. Promise ledger: what this chapter owed, what it paid, what it newly owes.
4. Last sentence revised in isolation — read aloud, multiple passes.
5. Oral repetition from source sermons collapsed.
6. Pulpit-liturgy strip-grep run (§11.3); every hit stripped or deliberately
   rewritten for the page.
7. Threshold counts taken (§11.2): antithesis, negation triads, listening
   cues, metaphor landings, you-to-we ratio, ellipses.
8. Readability sanity check: would a tired reader at grade 6–8 stay in it?
9. Book-mode voice-audit run (§11.4) — full machine-tell scan, seam detection,
   conviction/cadence/doctrinal checks, risk rating.
10. writing-shape pass on story sections (§11.5).
11. At each part boundary: chapters laid side by side for cross-chapter
    template repetition (§11.2) and whole-part metaphor density.

---

*The night is far gone; the day is at hand. Write so the stranger holding the
book at midnight turns one more page toward morning.*

**Soli Deo Gloria.**
