# Deep Knowledge (app)

Bite-sized idea cards from books, articles and videos — save them into stashes and review
them with spaced repetition. Personal, single-user app. See `../PLAN.md` for the roadmap.

## Run it

Requires **Node.js 22.13+** (uses the built-in `node:sqlite`).

```bash
cd app
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY for AI cards
npm run dev                  # http://localhost:3000
```

For everyday use, run the faster production build: `npm run build && npm start`.

- Data lives in `app/data/deep-knowledge.db` (git-ignored). Back up that one file; delete it to start fresh.
- Set `DATA_DIR` to keep the database elsewhere.
- On your phone: open the app's address on the same Wi-Fi, then "Add to Home Screen".
- There is **no login**. Don't expose it to the internet without adding authentication.

## Features

- **Feed** of idea cards filtered by the topics you follow; unseen ideas first.
- **Stashes**: save any idea to one or more collections; create, rename, delete.
- **Create**: write your own ideas, or paste a link / text and let Claude draft cards that you
  edit before saving.
- **Review**: saved ideas come back on a spaced-repetition schedule (recall, reveal, grade).
- **Search** across ideas, sources and authors.

## AI cards

`src/lib/ai.ts` calls the Claude API (`claude-opus-5-5`, medium effort) with a structured-output
schema, so every response is validated JSON (source + list of ideas with topics). Requests opt into
server-side refusal fallbacks. Each generation costs a few cents, depending on source length; very
long sources (>600k characters) are rejected rather than silently truncated.

## Code map

| Path | What |
|---|---|
| `src/lib/db.ts` | SQLite connection, schema, first-run seed |
| `src/lib/seed.ts` | Starter library |
| `src/lib/queries.ts` | All data access + spaced-repetition scheduling |
| `src/lib/ai.ts` | Claude card generation |
| `src/lib/fetch-source.ts` | Download a URL and extract readable text |
| `src/app/actions.ts` | Server actions (all mutations) |
| `src/app/**/page.tsx` | Pages: feed, topics, idea, source, stashes, create, review, search, mine |
| `src/components/` | Idea card, stash picker, AI generator, review session, nav |
