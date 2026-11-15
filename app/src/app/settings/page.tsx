import Link from "next/link";
import { ProviderForm } from "@/components/provider-form";
import { getProviderStatuses } from "@/lib/ai";

export default function SettingsPage() {
  const providers = getProviderStatuses();
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight">Settings</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">AI providers</h2>
        <p className="mt-1 text-sm text-muted">
          Add a key for any provider you want to use to generate idea cards. You can pick the provider each time you
          generate. “Save &amp; test” checks the key and model without using any tokens.
        </p>
        <p className="mt-2 rounded-2xl bg-surface-2 p-3 text-xs text-muted">
          🔒 Keys saved here are stored in plain text in your local database file (<code>data/deep-knowledge.db</code>)
          and never sent to the browser. A key saved here takes priority over the one in <code>.env.local</code>.
        </p>
        <div className="mt-4 space-y-4">
          {providers.map((p) => (
            <ProviderForm key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Feed</h2>
        <Link href="/topics" className="btn-ghost mt-3">Edit topics</Link>
      </section>
    </div>
  );
}
