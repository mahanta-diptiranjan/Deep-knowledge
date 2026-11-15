"use server";

// Single-user personal app: no auth layer. Do not expose this server publicly
// without adding authentication to every action below.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as q from "@/lib/queries";
import { AiError, GeneratedCardsSchema, aiConfigured, generateCards } from "@/lib/ai";
import { FetchSourceError, fetchSource } from "@/lib/fetch-source";
import { SOURCE_KINDS, TOPIC_SLUGS } from "@/lib/topics";

const refresh = () => revalidatePath("/", "layout");
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// ---------- topics ----------

export async function saveTopicsAction(formData: FormData) {
  q.setFollowedTopics(formData.getAll("topic").map(String));
  refresh();
  redirect("/");
}

// ---------- stashes ----------

export async function setInStashAction(ideaId: number, stashId: number, inStash: boolean) {
  if (inStash) q.addToStash(stashId, ideaId);
  else q.removeFromStash(stashId, ideaId);
  refresh();
}

export async function createStashAction(name: string, emoji: string, ideaId?: number) {
  const clean = name.trim().slice(0, 60);
  if (!clean) return null;
  const id = q.createStash(clean, emoji.trim().slice(0, 8));
  if (ideaId) q.addToStash(id, ideaId);
  refresh();
  return id;
}

export async function createStashFormAction(formData: FormData) {
  const id = await createStashAction(str(formData, "name"), str(formData, "emoji"));
  if (id) redirect(`/stashes/${id}`);
}

export async function renameStashAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = str(formData, "name").slice(0, 60);
  if (name) q.renameStash(id, name, str(formData, "emoji").slice(0, 8));
  refresh();
}

export async function deleteStashAction(formData: FormData) {
  q.deleteStash(Number(formData.get("id")));
  refresh();
  redirect("/stashes");
}

// ---------- ideas ----------

const IdeaForm = z.object({
  title: z.string().trim().min(1, "Give the idea a title").max(140),
  body: z.string().trim().min(1, "Write the idea").max(2000),
  topic: z.enum(TOPIC_SLUGS),
});

export type FormState = { error?: string } | undefined;

export async function createIdeaAction(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = IdeaForm.safeParse({ title: str(formData, "title"), body: str(formData, "body"), topic: str(formData, "topic") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const sourceTitle = str(formData, "sourceTitle");
  const sourceId = sourceTitle
    ? q.findOrCreateSource({
        title: sourceTitle,
        author: str(formData, "sourceAuthor"),
        kind: (SOURCE_KINDS as readonly string[]).includes(str(formData, "sourceKind")) ? str(formData, "sourceKind") : "book",
      })
    : null;
  const id = q.createIdea({ ...parsed.data, sourceId, origin: "mine" });
  refresh();
  redirect(`/idea/${id}`);
}

export async function updateIdeaAction(_: FormState, formData: FormData): Promise<FormState> {
  const id = Number(formData.get("id"));
  const parsed = IdeaForm.safeParse({ title: str(formData, "title"), body: str(formData, "body"), topic: str(formData, "topic") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  q.updateIdea(id, parsed.data);
  refresh();
  redirect(`/idea/${id}`);
}

export async function deleteIdeaAction(formData: FormData) {
  q.deleteIdea(Number(formData.get("id")));
  refresh();
  redirect("/mine");
}

export async function markSeenAction(ideaId: number) {
  q.markSeen(ideaId);
}

// ---------- AI generation ----------

export type GenerateState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "ok"; result: z.infer<typeof GeneratedCardsSchema>; url: string | null };

export async function generateAction(_: GenerateState, formData: FormData): Promise<GenerateState> {
  if (!aiConfigured())
    return { status: "error", error: "Set ANTHROPIC_API_KEY in app/.env.local and restart the server to use AI generation." };

  const url = str(formData, "url");
  let text = str(formData, "text");
  let pageTitle = "";
  const count = Math.min(15, Math.max(1, Number(formData.get("count")) || 6));

  try {
    if (!text && url) ({ text, title: pageTitle } = await fetchSource(url));
    if (!text) return { status: "error", error: "Paste a link or some text first." };
    const result = await generateCards({
      text,
      count,
      hint: { title: str(formData, "title") || pageTitle, author: str(formData, "author"), url },
    });
    return { status: "ok", result, url: url || null };
  } catch (e) {
    if (e instanceof AiError || e instanceof FetchSourceError) return { status: "error", error: e.message };
    console.error(e);
    return { status: "error", error: "Something went wrong while generating cards." };
  }
}

export async function saveGeneratedAction(payload: unknown, url: string | null) {
  const data = GeneratedCardsSchema.parse(payload);
  const ideas = data.ideas.filter((i) => i.title.trim() && i.body.trim());
  if (!ideas.length) return;
  const sourceId = q.findOrCreateSource({
    title: data.source.title.trim() || "Untitled source",
    author: data.source.author,
    kind: data.source.kind,
    url,
  });
  for (const i of ideas) q.createIdea({ title: i.title.trim(), body: i.body.trim(), topic: i.topic, sourceId, origin: "ai" });
  refresh();
  redirect(`/source/${sourceId}`);
}

// ---------- review ----------

export async function gradeAction(ideaId: number, grade: q.Grade) {
  q.gradeReview(ideaId, grade);
  refresh();
}
