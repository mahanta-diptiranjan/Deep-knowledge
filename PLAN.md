# Deep Knowledge — plan

A personal, single-user take on the "idea cards" learning-app pattern (as popularised by
Deepstash): bite-sized ideas from books, articles and videos, saved into collections and
reviewed so they stick. Built for personal use.

## Decisions

| Area | Choice | Why |
|---|---|---|
| Platform | Web app (Next.js), mobile-first, installable as a PWA | One codebase for phone + desktop |
| Storage | Local SQLite file via Node's built-in `node:sqlite` | Single user: no server DB, no accounts, easy backup (one file) |
| Auth | None | Personal use. **Don't expose it publicly without adding auth.** |
| Content | Starter library + your own cards + AI-generated cards | AI turns any link or pasted text into cards, so the library grows with what you read |
| AI | Claude via the Anthropic SDK, structured JSON output | Cards come back typed and validated; you review/edit before saving |

## Concepts → data model

- **Source** (`sources`): book / article / video / podcast / note, with optional URL.
- **Idea** (`ideas`): one card = title + 2–4 sentence body + topic; `origin` is `library`, `mine` or `ai`.
- **Topic**: fixed list of 12 (productivity, psychology, health, money, …). Feed follows chosen topics.
- **Stash** (`stashes`, `stash_ideas`): named collections; an idea can be in many.
- **Review** (`reviews`): spaced-repetition state for every saved idea (simplified SM-2).
- `seen` (feed shows unseen ideas first), `settings` (followed topics).

## Phases

- [x] **1. Foundation** — Next.js + TypeScript + Tailwind, SQLite schema, seed library (~35 ideas).
- [x] **2. Core loop** — topic onboarding, feed with topic filter, idea page with "more from this source",
      save to stash (multi-stash picker, create stash inline), stash pages (rename/delete), source pages.
- [x] **3. Creation** — write your own ideas (create/edit/delete); AI cards from a URL or pasted text
      with a review-and-edit step before saving.
- [x] **3b. Retention** — daily review with recall-then-reveal and Forgot/Hard/Got it/Easy grading; search.
- [ ] **4. Next up (ideas)**
  - Export/import (JSON / Markdown) and a backup button
  - Highlights → cards: paste Kindle highlights or a YouTube transcript
  - Streaks and daily-goal widget
  - Better feed ranking (favour topics you save from; resurface old saves)
  - Offline support (service worker) and audio (text-to-speech) for cards
  - Browser bookmarklet: "send this page to Deep Knowledge"
  - Optional auth + hosted deployment if it ever needs to run beyond your own machine
