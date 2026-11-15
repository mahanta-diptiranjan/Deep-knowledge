import { IdeaCard } from "@/components/idea-card";
import { searchIdeas } from "@/lib/queries";
import { cardContext } from "@/lib/view";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const ideas = q ? searchIdeas(q) : [];
  const { stashes, selectedFor } = cardContext(ideas);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight">Search</h1>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Ideas, books, authors…" className="input py-3" autoFocus />
      </form>
      {q && (
        <p className="mt-4 text-sm text-muted">
          {ideas.length} {ideas.length === 1 ? "result" : "results"} for “{q}”
        </p>
      )}
      <div className="mt-3 space-y-4">
        {ideas.map((i) => (
          <IdeaCard key={i.id} idea={i} stashes={stashes} selected={selectedFor(i.id)} />
        ))}
      </div>
    </div>
  );
}
