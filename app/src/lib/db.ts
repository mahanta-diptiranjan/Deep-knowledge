import "server-only";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { SEED } from "./seed";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  kind TEXT NOT NULL DEFAULT 'book',
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY,
  source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  topic TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT 'library',  -- library | mine | ai
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ideas_topic ON ideas(topic);
CREATE INDEX IF NOT EXISTS ideas_source ON ideas(source_id);
CREATE TABLE IF NOT EXISTS stashes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📌',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS stash_ideas (
  stash_id INTEGER NOT NULL REFERENCES stashes(id) ON DELETE CASCADE,
  idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (stash_id, idea_id)
);
-- Spaced-repetition state, one row per saved idea.
CREATE TABLE IF NOT EXISTS reviews (
  idea_id INTEGER PRIMARY KEY REFERENCES ideas(id) ON DELETE CASCADE,
  due_at TEXT NOT NULL,
  interval_days REAL NOT NULL DEFAULT 0,
  ease REAL NOT NULL DEFAULT 2.5,
  reps INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS seen (
  idea_id INTEGER PRIMARY KEY REFERENCES ideas(id) ON DELETE CASCADE,
  seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

function open(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "deep-knowledge.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  seedIfEmpty(db);
  return db;
}

function seedIfEmpty(db: DatabaseSync) {
  const row = db.prepare("SELECT COUNT(*) AS n FROM ideas").get() as { n: number };
  if (row.n > 0) return;
  const insertSource = db.prepare(
    "INSERT INTO sources (title, author, kind, url) VALUES (?, ?, ?, ?)",
  );
  const insertIdea = db.prepare(
    "INSERT INTO ideas (source_id, title, body, topic, origin) VALUES (?, ?, ?, ?, 'library')",
  );
  db.exec("BEGIN");
  try {
    for (const s of SEED) {
      const { lastInsertRowid } = insertSource.run(s.title, s.author, s.kind, s.url ?? null);
      for (const i of s.ideas) insertIdea.run(lastInsertRowid, i.title, i.body, i.topic);
    }
    db.prepare("INSERT INTO stashes (name, emoji) VALUES (?, ?)").run("Favorites", "⭐");
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// Reuse one connection across hot reloads in dev.
const g = globalThis as unknown as { __deepDb?: DatabaseSync };
const raw: DatabaseSync = g.__deepDb ?? (g.__deepDb = open());

// node:sqlite returns rows with a null prototype, which React refuses to pass to
// Client Components. This thin wrapper hands out plain objects instead.
const plain = <T,>(r: T): T => (r && typeof r === "object" ? ({ ...r } as T) : r);

export const db = {
  exec: (sql: string) => raw.exec(sql),
  prepare(sql: string) {
    const stmt = raw.prepare(sql);
    return {
      run: (...args: SQLInputValue[]) => stmt.run(...args),
      get: (...args: SQLInputValue[]) => plain(stmt.get(...args)),
      all: (...args: SQLInputValue[]) => stmt.all(...args).map(plain),
    };
  },
};
