import { notFound } from "next/navigation";
import { deleteStashAction, renameStashAction } from "@/app/actions";
import { IdeaCard } from "@/components/idea-card";
import { getStash, getStashIdeas } from "@/lib/queries";
import { cardContext } from "@/lib/view";

export default async function StashPage({ params }: PageProps<"/stashes/[id]">) {
  const { id } = await params;
  const stash = getStash(Number(id));
  if (!stash) notFound();
  const ideas = getStashIdeas(stash.id);
  const { stashes, selectedFor } = cardContext(ideas);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{stash.emoji}</span>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">{stash.name}</h1>
          <p className="text-sm text-muted">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
          </p>
        </div>
      </div>

      <details className="mt-4 rounded-2xl border border-line bg-surface p-3 text-sm">
        <summary className="cursor-pointer text-muted">Edit stash</summary>
        <form action={renameStashAction} className="mt-3 flex gap-2">
          <input type="hidden" name="id" value={stash.id} />
          <input name="emoji" defaultValue={stash.emoji} className="input w-14 text-center" maxLength={8} aria-label="Emoji" />
          <input name="name" defaultValue={stash.name} className="input" maxLength={60} required />
          <button className="btn-primary">Save</button>
        </form>
        <form action={deleteStashAction} className="mt-3">
          <input type="hidden" name="id" value={stash.id} />
          <button className="text-red-600 hover:underline">Delete this stash (ideas stay in your library)</button>
        </form>
      </details>

      <div className="mt-6 space-y-4">
        {ideas.length === 0 && (
          <p className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
            Nothing here yet. Tap ☆ Save on any idea to add it.
          </p>
        )}
        {ideas.map((i) => (
          <IdeaCard key={i.id} idea={i} stashes={stashes} selected={selectedFor(i.id)} />
        ))}
      </div>
    </div>
  );
}
