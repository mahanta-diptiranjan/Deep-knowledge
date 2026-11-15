import Link from "next/link";
import { IdeaCard } from "@/components/idea-card";
import { getMyIdeas } from "@/lib/queries";
import { cardContext } from "@/lib/view";

export default function MinePage() {
  const ideas = getMyIdeas();
  const { stashes, selectedFor } = cardContext(ideas);
  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-tight">My ideas</h1>
        <Link href="/create" className="btn-primary">
          + New
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {ideas.length === 0 && (
          <p className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
            Ideas you write or generate with AI show up here.
          </p>
        )}
        {ideas.map((i) => (
          <IdeaCard key={i.id} idea={i} stashes={stashes} selected={selectedFor(i.id)} />
        ))}
      </div>
    </div>
  );
}
