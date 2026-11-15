import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteIdeaAction } from "@/app/actions";
import { IdeaCard } from "@/components/idea-card";
import { getIdea, getIdeasBySource, markSeen } from "@/lib/queries";
import { cardContext } from "@/lib/view";

export default async function IdeaPage({ params }: PageProps<"/idea/[id]">) {
  const { id } = await params;
  const idea = getIdea(Number(id));
  if (!idea) notFound();
  markSeen(idea.id);

  const siblings = idea.source_id ? getIdeasBySource(idea.source_id).filter((i) => i.id !== idea.id) : [];
  const { stashes, selectedFor } = cardContext([idea, ...siblings]);
  const editable = idea.origin !== "library";

  return (
    <div>
      <IdeaCard idea={idea} stashes={stashes} selected={selectedFor(idea.id)} />
      <div className="mt-3 flex flex-wrap gap-2">
        {idea.source_url && (
          <a href={idea.source_url} target="_blank" rel="noreferrer" className="btn-ghost">
            Open original ↗
          </a>
        )}
        {editable && (
          <>
            <Link href={`/idea/${idea.id}/edit`} className="btn-ghost">
              Edit
            </Link>
            <form action={deleteIdeaAction}>
              <input type="hidden" name="id" value={idea.id} />
              <button className="btn-ghost text-red-600">Delete</button>
            </form>
          </>
        )}
      </div>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            More from {idea.source_title}
          </h2>
          <div className="space-y-4">
            {siblings.map((s) => (
              <IdeaCard key={s.id} idea={s} stashes={stashes} selected={selectedFor(s.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
