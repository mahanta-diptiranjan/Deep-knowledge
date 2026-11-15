# Deep Knowledge (app)

Bite-sized idea cards from books, articles and videos — save them into stashes and review
them with spaced repetition. Personal, single-user app. See `../PLAN.md` for the roadmap.

## Run it

Requires **Node.js 22.13+** (uses the built-in `node:sqlite`).

```bash
cd app
npm install
cp .env.example .env.local   # optional: AI keys (or add them later in Settings)
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

## AI cards: Claude, Gemini or OpenAI

Add a key for any of these on the **Settings** page (⚙), or in `.env.local`:

| Provider | Env variable | Default model |
|---|---|---|
| Claude (Anthropic) | `ANTHROPIC_API_KEY` | `claude-opus-5-5` |
| Gemini (Google) | `GEMINI_API_KEY` | `gemini-3.8-flash` |
| OpenAI | `OPENAI_API_KEY` | `gpt-5.5` |

- You choose the provider each time you generate; the default is set in Settings.
- The model name is editable per provider. **Save & test** checks the key and model with a
  model lookup, which uses no tokens.
- Keys saved in Settings are stored in plain text in the local database file, never sent to the
  browser (only the last 4 characters are shown), and take priority over `.env.local`.
- Every provider gets the same prompt and the same JSON schema, so cards come back in one format
  and are validated before you see them. Generation costs a few cents per source.
- Very long sources (>600k characters) are rejected rather than silently truncated.

## Code map

| Path | What |
|---|---|
| `src/lib/db.ts` | SQLite connection, schema, first-run seed |
| `src/lib/seed.ts` | Starter library |
| `src/lib/queries.ts` | All data access + spaced-repetition scheduling |
| `src/lib/ai/` | Card generation: shared prompt + schema, one file per provider, key/model settings |
| `src/lib/fetch-source.ts` | Download a URL and extract readable text |
| `src/app/actions.ts` | Server actions (all mutations) |
| `src/app/**/page.tsx` | Pages: feed, topics, idea, source, stashes, create, review, search, mine, settings |
| `src/components/` | Idea card, stash picker, AI generator, review session, nav |
