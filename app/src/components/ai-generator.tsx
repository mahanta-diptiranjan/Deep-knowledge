"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { generateAction, saveGeneratedAction, type GenerateState } from "@/app/actions";
import { SOURCE_KINDS, TOPICS } from "@/lib/topics";

type Result = Extract<GenerateState, { status: "ok" }>["result"];
type Draft = Result["ideas"][number] & { keep: boolean };

export type ProviderOption = { id: string; label: string; model: string; isDefault: boolean };

export function AiGenerator({ providers }: { providers: ProviderOption[] }) {
  const configured = providers.length > 0;
  const defaultId = providers.find((p) => p.isDefault)?.id ?? providers[0]?.id;
  const [state, formAction, pending] = useActionState(generateAction, { status: "idle" });
  // Remount the review step whenever a new result arrives so drafts reset.
  const key = state.status === "ok" ? JSON.stringify(state.result).length + state.result.source.title : "none";

  return (
    <div className="space-y-6">
      {!configured && (
        <p className="rounded-2xl bg-accent-soft p-3 text-sm text-accent">
          AI is off: add a Claude, Gemini or OpenAI key in{" "}
          <Link href="/settings" className="font-semibold underline">Settings</Link>.
        </p>
      )}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="url">Link</label>
          <input id="url" name="url" type="url" className="input" placeholder="https://… an article or blog post" />
        </div>
        <div>
          <label className="label" htmlFor="text">…or paste text</label>
          <textarea id="text" name="text" className="input min-h-32" placeholder="Paste a chapter, your book notes, a transcript…" />
          <p className="mt-1 text-xs text-muted">If both are filled, the pasted text is used.</p>
        </div>
        <div className="grid grid-cols-[1fr_1fr_5rem] gap-2">
          <input name="title" className="input" placeholder="Title (optional)" />
          <input name="author" className="input" placeholder="Author (optional)" />
          <input name="count" type="number" min={1} max={15} defaultValue={6} className="input" aria-label="Number of cards" />
        </div>
        {configured && (
          <div>
            <label className="label" htmlFor="provider">AI provider</label>
            <div className="flex items-center gap-2">
              <select id="provider" name="provider" defaultValue={defaultId} className="input">
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.label} · {p.model}</option>
                ))}
              </select>
              <Link href="/settings" className="shrink-0 text-sm text-muted hover:text-ink">Manage keys</Link>
            </div>
          </div>
        )}
        <button className="btn-primary w-full py-3" disabled={pending || !configured}>
          {pending ? "Reading and writing cards… (can take a minute)" : "✨ Generate idea cards"}
        </button>
        {state.status === "error" && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
      {state.status === "ok" && <Review key={key} result={state.result} url={state.url} />}
    </div>
  );
}

function Review({ result, url }: { result: Result; url: string | null }) {
  const [source, setSource] = useState(result.source);
  const [drafts, setDrafts] = useState<Draft[]>(result.ideas.map((i) => ({ ...i, keep: true })));
  const [saving, start] = useTransition();
  const update = (n: number, patch: Partial<Draft>) =>
    setDrafts((d) => d.map((x, i) => (i === n ? { ...x, ...patch } : x)));
  const kept = drafts.filter((d) => d.keep);

  return (
    <section className="space-y-4 border-t border-line pt-6">
      <h2 className="font-serif text-2xl font-bold">Review before saving</h2>
      <div className="grid gap-2 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-[1fr_1fr_auto]">
        <input className="input" value={source.title} onChange={(e) => setSource({ ...source, title: e.target.value })} aria-label="Source title" />
        <input className="input" value={source.author} placeholder="Author" onChange={(e) => setSource({ ...source, author: e.target.value })} aria-label="Source author" />
        <select className="input" value={source.kind} onChange={(e) => setSource({ ...source, kind: e.target.value as Result["source"]["kind"] })} aria-label="Source type">
          {SOURCE_KINDS.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      {drafts.map((d, n) => (
        <div key={n} className={`rounded-3xl border bg-surface p-4 ${d.keep ? "border-line" : "border-dashed border-line opacity-50"}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <select className="input w-auto py-1 text-sm" value={d.topic} onChange={(e) => update(n, { topic: e.target.value as Draft["topic"] })}>
              {TOPICS.map((t) => <option key={t.slug} value={t.slug}>{t.emoji} {t.label}</option>)}
            </select>
            <label className="flex items-center gap-1 text-sm text-muted">
              <input type="checkbox" checked={d.keep} onChange={(e) => update(n, { keep: e.target.checked })} /> Keep
            </label>
          </div>
          <input className="input font-serif text-lg font-bold" value={d.title} onChange={(e) => update(n, { title: e.target.value })} />
          <textarea className="input mt-2 min-h-28" value={d.body} onChange={(e) => update(n, { body: e.target.value })} />
        </div>
      ))}
      <button
        className="btn-primary sticky bottom-24 w-full py-3 shadow-lg md:bottom-4"
        disabled={saving || kept.length === 0}
        onClick={() =>
          start(async () => {
            await saveGeneratedAction({ source, ideas: kept.map((d) => ({ title: d.title, body: d.body, topic: d.topic })) }, url);
          })
        }
      >
        {saving ? "Saving…" : `Save ${kept.length} ${kept.length === 1 ? "card" : "cards"}`}
      </button>
    </section>
  );
}
