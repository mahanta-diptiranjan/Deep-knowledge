import Link from "next/link";
import type { Idea } from "@/lib/queries";
import { topicInfo } from "@/lib/topics";
import { StashPicker, type StashOption } from "./stash-picker";

const KIND_ICON: Record<string, string> = { book: "📖", article: "📰", video: "🎬", podcast: "🎧", note: "📝" };

export function SourceLine({ idea }: { idea: Pick<Idea, "source_id" | "source_title" | "source_author" | "source_kind"> }) {
  if (!idea.source_id || !idea.source_title) return null;
  return (
    <Link href={`/source/${idea.source_id}`} className="flex min-w-0 items-center gap-1.5 text-sm text-muted hover:text-ink">
      <span>{KIND_ICON[idea.source_kind ?? ""] ?? "📄"}</span>
      <span className="truncate">
        <span className="font-medium">{idea.source_title}</span>
        {idea.source_author && <> · {idea.source_author}</>}
      </span>
    </Link>
  );
}

export function TopicTag({ topic }: { topic: string }) {
  const t = topicInfo(topic);
  return (
    <Link
      href={`/?topic=${t.slug}`}
      className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted hover:text-ink"
    >
      {t.emoji} {t.label}
    </Link>
  );
}

export function IdeaCard({
  idea,
  stashes,
  selected,
  extra,
}: {
  idea: Idea;
  stashes: StashOption[];
  selected: number[];
  extra?: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <TopicTag topic={idea.topic} />
        {idea.origin !== "library" && (
          <span className="text-xs text-muted">{idea.origin === "ai" ? "✨ AI card" : "✍️ Your idea"}</span>
        )}
      </div>
      <Link href={`/idea/${idea.id}`} className="block">
        <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight">{idea.title}</h2>
        <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed text-ink/90">{idea.body}</p>
      </Link>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SourceLine idea={idea} />
        </div>
        {extra}
        <StashPicker ideaId={idea.id} stashes={stashes} selected={selected} />
      </div>
    </article>
  );
}
