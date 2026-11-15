import { saveTopicsAction } from "@/app/actions";
import { getFollowedTopics, hasOnboarded } from "@/lib/queries";
import { TOPICS } from "@/lib/topics";

export default function TopicsPage() {
  const first = !hasOnboarded();
  const followed = new Set<string>(first ? ["productivity", "psychology", "learning", "habits"] : getFollowedTopics());

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight">{first ? "What do you want to learn?" : "Your topics"}</h1>
      <p className="mt-1 text-muted">Pick the topics for your feed. You can change this anytime.</p>
      <form action={saveTopicsAction} className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <label
              key={t.slug}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-line bg-surface p-4 has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
            >
              <input type="checkbox" name="topic" value={t.slug} defaultChecked={followed.has(t.slug)} className="sr-only" />
              <span className="text-xl">{t.emoji}</span>
              <span className="font-medium">{t.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Pick none to see every topic.</p>
        <button className="btn-primary mt-6 w-full py-3 text-base">{first ? "Start learning →" : "Save"}</button>
      </form>
    </div>
  );
}
