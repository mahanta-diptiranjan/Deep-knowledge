import "server-only";
import { db } from "./db";
import { TOPIC_SLUGS, type TopicSlug } from "./topics";

export type Idea = {
  id: number;
  title: string;
  body: string;
  topic: string;
  origin: "library" | "mine" | "ai";
  created_at: string;
  source_id: number | null;
  source_title: string | null;
  source_author: string | null;
  source_kind: string | null;
  source_url: string | null;
  saved: number; // 0/1
};

export type Stash = { id: number; name: string; emoji: string; count: number; created_at: string };
export type Source = { id: number; title: string; author: string | null; kind: string; url: string | null };

const IDEA_SELECT = `
  SELECT i.id, i.title, i.body, i.topic, i.origin, i.created_at, i.source_id,
         s.title AS source_title, s.author AS source_author, s.kind AS source_kind, s.url AS source_url,
         EXISTS (SELECT 1 FROM stash_ideas si WHERE si.idea_id = i.id) AS saved
  FROM ideas i LEFT JOIN sources s ON s.id = i.source_id`;

// ---------- settings ----------

export function getFollowedTopics(): TopicSlug[] {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'topics'").get() as
    | { value: string }
    | undefined;
  if (!row) return [];
  const parsed = JSON.parse(row.value) as string[];
  return parsed.filter((t): t is TopicSlug => (TOPIC_SLUGS as string[]).includes(t));
}

export function setFollowedTopics(topics: string[]) {
  const valid = topics.filter((t) => (TOPIC_SLUGS as string[]).includes(t));
  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('topics', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(JSON.stringify(valid));
}

export function hasOnboarded(): boolean {
  return !!db.prepare("SELECT 1 FROM settings WHERE key = 'topics'").get();
}

// ---------- ideas ----------

/** Feed: ideas from the given topics (or followed topics), unseen first, shuffled. */
export function getFeed(topic: string | null, limit = 30): Idea[] {
  const topics = topic ? [topic] : getFollowedTopics();
  const where = topics.length ? `WHERE i.topic IN (${topics.map(() => "?").join(",")})` : "";
  return db
    .prepare(
      `${IDEA_SELECT} ${where}
       ORDER BY (SELECT 1 FROM seen WHERE seen.idea_id = i.id) IS NOT NULL, RANDOM()
       LIMIT ?`,
    )
    .all(...topics, limit) as Idea[];
}

export function getIdea(id: number): Idea | undefined {
  return db.prepare(`${IDEA_SELECT} WHERE i.id = ?`).get(id) as Idea | undefined;
}

export function getIdeasBySource(sourceId: number): Idea[] {
  return db.prepare(`${IDEA_SELECT} WHERE i.source_id = ? ORDER BY i.id`).all(sourceId) as Idea[];
}

export function getMyIdeas(): Idea[] {
  return db
    .prepare(`${IDEA_SELECT} WHERE i.origin IN ('mine','ai') ORDER BY i.created_at DESC, i.id DESC`)
    .all() as Idea[];
}

export function searchIdeas(q: string, limit = 50): Idea[] {
  const like = `%${q.replace(/[%_]/g, (m) => "\\" + m)}%`;
  return db
    .prepare(
      `${IDEA_SELECT}
       WHERE i.title LIKE ?1 ESCAPE '\\' OR i.body LIKE ?1 ESCAPE '\\'
          OR s.title LIKE ?1 ESCAPE '\\' OR s.author LIKE ?1 ESCAPE '\\'
       ORDER BY i.id DESC LIMIT ?2`,
    )
    .all(like, limit) as Idea[];
}

export function markSeen(id: number) {
  db.prepare("INSERT OR REPLACE INTO seen (idea_id, seen_at) VALUES (?, datetime('now'))").run(id);
}

export function createSource(s: { title: string; author?: string | null; kind: string; url?: string | null }) {
  const r = db
    .prepare("INSERT INTO sources (title, author, kind, url) VALUES (?, ?, ?, ?)")
    .run(s.title, s.author || null, s.kind, s.url || null);
  return Number(r.lastInsertRowid);
}

export function findOrCreateSource(s: { title: string; author?: string | null; kind: string; url?: string | null }) {
  const existing = db
    .prepare("SELECT id FROM sources WHERE lower(title) = lower(?) AND kind = ?")
    .get(s.title, s.kind) as { id: number } | undefined;
  return existing ? existing.id : createSource(s);
}

export function createIdea(i: {
  title: string;
  body: string;
  topic: string;
  sourceId: number | null;
  origin: "mine" | "ai";
}) {
  const r = db
    .prepare("INSERT INTO ideas (source_id, title, body, topic, origin) VALUES (?, ?, ?, ?, ?)")
    .run(i.sourceId, i.title, i.body, i.topic, i.origin);
  return Number(r.lastInsertRowid);
}

export function updateIdea(id: number, i: { title: string; body: string; topic: string }) {
  db.prepare("UPDATE ideas SET title = ?, body = ?, topic = ? WHERE id = ?").run(i.title, i.body, i.topic, id);
}

export function deleteIdea(id: number) {
  db.prepare("DELETE FROM ideas WHERE id = ?").run(id);
}

export function getSources(): Source[] {
  return db.prepare("SELECT id, title, author, kind, url FROM sources ORDER BY title").all() as Source[];
}

export function getSource(id: number): Source | undefined {
  return db.prepare("SELECT id, title, author, kind, url FROM sources WHERE id = ?").get(id) as Source | undefined;
}

// ---------- stashes ----------

export function getStashes(): Stash[] {
  return db
    .prepare(
      `SELECT st.id, st.name, st.emoji, st.created_at,
              (SELECT COUNT(*) FROM stash_ideas si WHERE si.stash_id = st.id) AS count
       FROM stashes st ORDER BY st.created_at, st.id`,
    )
    .all() as Stash[];
}

export function getStash(id: number): Stash | undefined {
  return db
    .prepare(
      `SELECT st.id, st.name, st.emoji, st.created_at,
              (SELECT COUNT(*) FROM stash_ideas si WHERE si.stash_id = st.id) AS count
       FROM stashes st WHERE st.id = ?`,
    )
    .get(id) as Stash | undefined;
}

export function getStashIdeas(stashId: number): Idea[] {
  return db
    .prepare(
      `${IDEA_SELECT} JOIN stash_ideas x ON x.idea_id = i.id AND x.stash_id = ?
       ORDER BY x.added_at DESC`,
    )
    .all(stashId) as Idea[];
}

export function getStashIdsForIdea(ideaId: number): number[] {
  return (
    db.prepare("SELECT stash_id FROM stash_ideas WHERE idea_id = ?").all(ideaId) as { stash_id: number }[]
  ).map((r) => r.stash_id);
}

export function createStash(name: string, emoji: string) {
  const r = db.prepare("INSERT INTO stashes (name, emoji) VALUES (?, ?)").run(name, emoji || "📌");
  return Number(r.lastInsertRowid);
}

export function renameStash(id: number, name: string, emoji: string) {
  db.prepare("UPDATE stashes SET name = ?, emoji = ? WHERE id = ?").run(name, emoji || "📌", id);
}

export function deleteStash(id: number) {
  db.prepare("DELETE FROM stashes WHERE id = ?").run(id);
  cleanupReviews();
}

export function addToStash(stashId: number, ideaId: number) {
  db.prepare("INSERT OR IGNORE INTO stash_ideas (stash_id, idea_id) VALUES (?, ?)").run(stashId, ideaId);
  // Saved ideas enter the review queue, first due tomorrow.
  db.prepare(
    "INSERT OR IGNORE INTO reviews (idea_id, due_at) VALUES (?, datetime('now', '+1 day'))",
  ).run(ideaId);
}

export function removeFromStash(stashId: number, ideaId: number) {
  db.prepare("DELETE FROM stash_ideas WHERE stash_id = ? AND idea_id = ?").run(stashId, ideaId);
  cleanupReviews();
}

function cleanupReviews() {
  db.exec("DELETE FROM reviews WHERE idea_id NOT IN (SELECT idea_id FROM stash_ideas)");
}

// ---------- review (spaced repetition) ----------

export type Grade = "again" | "hard" | "good" | "easy";

export function getDueReviews(limit = 20): Idea[] {
  return db
    .prepare(
      `${IDEA_SELECT} JOIN reviews r ON r.idea_id = i.id
       WHERE r.due_at <= datetime('now') ORDER BY r.due_at LIMIT ?`,
    )
    .all(limit) as Idea[];
}

export function countDueReviews(): number {
  return (
    db.prepare("SELECT COUNT(*) AS n FROM reviews WHERE due_at <= datetime('now')").get() as { n: number }
  ).n;
}

export function nextReviewAt(): string | null {
  const r = db.prepare("SELECT MIN(due_at) AS d FROM reviews").get() as { d: string | null };
  return r.d;
}

/** Simplified SM-2 scheduling. */
export function gradeReview(ideaId: number, grade: Grade) {
  const r = db.prepare("SELECT interval_days, ease, reps FROM reviews WHERE idea_id = ?").get(ideaId) as
    | { interval_days: number; ease: number; reps: number }
    | undefined;
  if (!r) return;
  let { interval_days: interval, ease, reps } = r;
  if (grade === "again") {
    reps = 0;
    interval = 0; // show again later today
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (grade === "hard") ease = Math.max(1.3, ease - 0.15);
    if (grade === "easy") ease += 0.15;
    if (reps === 1) interval = grade === "easy" ? 4 : grade === "hard" ? 1 : 2;
    else interval = Math.max(1, interval * (grade === "hard" ? 1.2 : grade === "easy" ? ease * 1.3 : ease));
  }
  const offset = grade === "again" ? "+10 minutes" : `+${Math.round(interval * 24 * 60)} minutes`;
  db.prepare(
    `UPDATE reviews SET interval_days = ?, ease = ?, reps = ?, due_at = datetime('now', ?) WHERE idea_id = ?`,
  ).run(interval, ease, reps, offset, ideaId);
}

// ---------- stats ----------

export function getStats() {
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return {
    ideas: one("SELECT COUNT(*) AS n FROM ideas"),
    saved: one("SELECT COUNT(DISTINCT idea_id) AS n FROM stash_ideas"),
    mine: one("SELECT COUNT(*) AS n FROM ideas WHERE origin IN ('mine','ai')"),
    due: countDueReviews(),
  };
}
