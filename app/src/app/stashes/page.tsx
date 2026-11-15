import Link from "next/link";
import { createStashFormAction } from "@/app/actions";
import { getStashes, getStats } from "@/lib/queries";

export default function StashesPage() {
  const stashes = getStashes();
  const stats = getStats();
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight">Stashes</h1>
      <p className="text-sm text-muted">Collections of ideas worth keeping.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {stashes.map((s) => (
          <Link key={s.id} href={`/stashes/${s.id}`} className="rounded-3xl border border-line bg-surface p-4 hover:bg-surface-2">
            <div className="text-3xl">{s.emoji}</div>
            <div className="mt-2 truncate font-semibold">{s.name}</div>
            <div className="text-sm text-muted">
              {s.count} {s.count === 1 ? "idea" : "ideas"}
            </div>
          </Link>
        ))}
        <Link href="/mine" className="rounded-3xl border border-dashed border-line p-4 hover:bg-surface-2">
          <div className="text-3xl">✍️</div>
          <div className="mt-2 font-semibold">My ideas</div>
          <div className="text-sm text-muted">{stats.mine} written or generated</div>
        </Link>
      </div>

      <form action={createStashFormAction} className="mt-8 rounded-3xl border border-line bg-surface p-4">
        <p className="label">New stash</p>
        <div className="flex gap-2">
          <input name="emoji" defaultValue="📌" className="input w-14 text-center" maxLength={8} aria-label="Emoji" />
          <input name="name" placeholder="e.g. Ideas for work" className="input" maxLength={60} required />
          <button className="btn-primary">Create</button>
        </div>
      </form>
    </div>
  );
}
