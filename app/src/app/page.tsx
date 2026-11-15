import Link from "next/link";
import { redirect } from "next/navigation";
import { IdeaCard } from "@/components/idea-card";
import { getFeed, getFollowedTopics, getStats, hasOnboarded } from "@/lib/queries";
import { TOPICS, topicInfo } from "@/lib/topics";
import { cardContext } from "@/lib/view";

export default async function FeedPage({ searchParams }: PageProps<"/">) {
  if (!hasOnboarded()) redirect("/topics");
  const sp = await searchParams;
  const topic = typeof sp.topic === "string" && TOPICS.some((t) => t.slug === sp.topic) ? sp.topic : null;
  const followed = getFollowedTopics();
  const ideas = getFeed(topic);
  const { stashes, selectedFor } = cardContext(ideas);
  const stats = getStats();
  const chips = topic && !followed.includes(topic as never) ? [...followed, topic] : followed;

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">{topic ? topicInfo(topic).label : "Your feed"}</h1>
          <p className="text-sm text-muted">
            {stats.saved} saved · {stats.ideas} ideas in your library
            {stats.due > 0 && (
              <>
                {" · "}
                <Link href="/review" className="font-medium text-accent">
                  {stats.due} to review
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3 text-sm text-muted">
          <Link href="/topics" className="hover:text-ink">
            Topics
          </Link>
          <Link href="/settings" className="hover:text-ink" aria-label="Settings">
            ⚙ Settings
          </Link>
        </div>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Chip href="/" active={!topic}>
          All
        </Chip>
        {chips.map((slug) => {
          const t = topicInfo(slug);
          return (
            <Chip key={slug} href={`/?topic=${slug}`} active={topic === slug}>
              {t.emoji} {t.label}
            </Chip>
          );
        })}
      </div>

      {ideas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
          <p>No ideas here yet.</p>
          <Link href="/create" className="btn-primary mt-4">
            Create some with AI
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} stashes={stashes} selected={selectedFor(idea.id)} />
          ))}
          <div className="py-6 text-center">
            <Link href={topic ? `/?topic=${topic}` : "/"} className="btn-ghost">
              ↻ Shuffle for more
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm ${active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:bg-surface-2"}`}
    >
      {children}
    </Link>
  );
}
