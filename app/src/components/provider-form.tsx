"use client";

import { useActionState } from "react";
import { saveProviderAction } from "@/app/actions";
import type { ProviderStatus } from "@/lib/ai";

export function ProviderForm({ p }: { p: ProviderStatus }) {
  const [state, action, pending] = useActionState(saveProviderAction, undefined);
  return (
    <form action={action} className="rounded-3xl border border-line bg-surface p-4">
      <input type="hidden" name="provider" value={p.id} />
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold">{p.label}</h2>
        {p.isDefault ? (
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">Default</span>
        ) : p.configured ? (
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">Ready</span>
        ) : (
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">No key</span>
        )}
      </div>

      <label className="label" htmlFor={`${p.id}-key`}>API key</label>
      <input
        id={`${p.id}-key`}
        name="apiKey"
        type="password"
        autoComplete="off"
        className="input font-mono text-sm"
        placeholder={
          p.keySource === "app"
            ? `Saved ${p.keyHint} · paste to replace`
            : p.keySource === "env"
              ? `From .env ${p.keyHint} · paste to override`
              : "Paste your key"
        }
      />
      <p className="mt-1 text-xs text-muted">
        Get one at{" "}
        <a href={p.keyUrl} target="_blank" rel="noreferrer" className="text-accent underline">
          {new URL(p.keyUrl).host}
        </a>
        {" "}· or set <code>{p.envKey}</code> in <code>.env.local</code>
      </p>

      <label className="label mt-3" htmlFor={`${p.id}-model`}>Model</label>
      <input id={`${p.id}-model`} name="model" defaultValue={p.model} className="input font-mono text-sm" placeholder={p.defaultModel} />
      <p className="mt-1 text-xs text-muted">Leave empty for the default ({p.defaultModel}).</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button name="intent" value="save" className="btn-ghost" disabled={pending}>Save</button>
        <button name="intent" value="test" className="btn-ghost" disabled={pending}>
          {pending ? "Working…" : "Save & test"}
        </button>
        {!p.isDefault && (
          <button name="intent" value="default" className="btn-ghost" disabled={pending || !p.configured}>
            Use by default
          </button>
        )}
        {p.keySource === "app" && (
          <button name="intent" value="remove" className="btn-ghost text-red-600" disabled={pending}>Remove key</button>
        )}
      </div>
      {state?.ok && <p className="mt-3 text-sm text-good">✓ {state.ok}</p>}
      {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
