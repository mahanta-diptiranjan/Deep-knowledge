export const TOPICS = [
  { slug: "productivity", label: "Productivity", emoji: "⚡" },
  { slug: "psychology", label: "Psychology", emoji: "🧠" },
  { slug: "health", label: "Health", emoji: "🌿" },
  { slug: "money", label: "Money", emoji: "💰" },
  { slug: "relationships", label: "Relationships", emoji: "🤝" },
  { slug: "leadership", label: "Leadership", emoji: "🧭" },
  { slug: "creativity", label: "Creativity", emoji: "🎨" },
  { slug: "learning", label: "Learning", emoji: "📚" },
  { slug: "philosophy", label: "Philosophy", emoji: "🏛️" },
  { slug: "communication", label: "Communication", emoji: "💬" },
  { slug: "science", label: "Science", emoji: "🔭" },
  { slug: "habits", label: "Habits", emoji: "🔁" },
] as const;

export type TopicSlug = (typeof TOPICS)[number]["slug"];

export const TOPIC_SLUGS = TOPICS.map((t) => t.slug) as [TopicSlug, ...TopicSlug[]];

export function topicInfo(slug: string) {
  return TOPICS.find((t) => t.slug === slug) ?? { slug, label: slug, emoji: "💡" };
}

export const SOURCE_KINDS = ["book", "article", "video", "podcast", "note"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];
