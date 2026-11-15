import { notFound } from "next/navigation";
import { IdeaCard } from "@/components/idea-card";
import { getIdeasBySource, getSource } from "@/lib/queries";
import { cardContext } from "@/lib/view";

export default async function SourcePage({ params }: PageProps<"/source/[id]">) {
  const { id } = await params;
  const source = getSource(Number(id));
  if (!source) notFound();
  const ideas = getIdeasBySource(source.id);
  const { stashes, selectedFor } = cardContext(ideas);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{source.kind}</p>
      <h1 className="font-serif text-3xl font-bold tracking-tight">{source.title}</h1>
      {source.author && <p className="text-muted">{source.author}</p>}
      {source.url && (
        <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-sm text-accent">
          {source.url}
        </a>
      )}
      <p className="mt-4 text-sm text-muted">{ideas.length} ideas</p>
      <div className="mt-3 space-y-4">
        {ideas.map((i) => (
          <IdeaCard key={i.id} idea={i} stashes={stashes} selected={selectedFor(i.id)} />
        ))}
      </div>
    </div>
  );
}
