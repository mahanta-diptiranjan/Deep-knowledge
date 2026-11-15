import "server-only";
import { getStashes, getStashIdsForIdea, type Idea } from "./queries";

/** Data every IdeaCard needs: the stash list plus which stashes hold each idea. */
export function cardContext(ideas: Pick<Idea, "id">[]) {
  const stashes = getStashes().map(({ id, name, emoji }) => ({ id, name, emoji }));
  const selected = new Map(ideas.map((i) => [i.id, getStashIdsForIdea(i.id)]));
  return { stashes, selectedFor: (id: number) => selected.get(id) ?? [] };
}
