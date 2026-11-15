"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { SOURCE_KINDS, TOPICS } from "@/lib/topics";

export function IdeaForm({
  action,
  initial,
  showSource,
}: {
  action: (s: FormState, f: FormData) => Promise<FormState>;
  initial?: { id: number; title: string; body: string; topic: string };
  showSource?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={initial?.title} className="input" maxLength={140} required placeholder="The idea in a few words" />
      </div>
      <div>
        <label className="label" htmlFor="body">Idea</label>
        <textarea id="body" name="body" defaultValue={initial?.body} className="input min-h-36" maxLength={2000} required placeholder="Explain it in 2–4 sentences, so future-you understands it without context." />
      </div>
      <div>
        <label className="label" htmlFor="topic">Topic</label>
        <select id="topic" name="topic" defaultValue={initial?.topic ?? "productivity"} className="input">
          {TOPICS.map((t) => (
            <option key={t.slug} value={t.slug}>{t.emoji} {t.label}</option>
          ))}
        </select>
      </div>
      {showSource && (
        <fieldset className="rounded-2xl border border-line p-3">
          <legend className="label px-1">Source (optional)</legend>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input name="sourceTitle" className="input" placeholder="Book / article title" />
            <input name="sourceAuthor" className="input" placeholder="Author" />
            <select name="sourceKind" className="input" defaultValue="book">
              {SOURCE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </fieldset>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn-primary w-full py-3" disabled={pending}>{pending ? "Saving…" : "Save idea"}</button>
    </form>
  );
}
