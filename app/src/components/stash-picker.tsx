"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { createStashAction, setInStashAction } from "@/app/actions";

export type StashOption = { id: number; name: string; emoji: string };

export function StashPicker({
  ideaId,
  stashes,
  selected,
}: {
  ideaId: number;
  stashes: StashOption[];
  selected: number[];
}) {
  const [open, setOpen] = useState(false);
  const [optimistic, toggle] = useOptimistic(selected, (cur: number[], id: number) =>
    cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
  );
  const [, start] = useTransition();
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const saved = optimistic.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`btn ${saved ? "bg-accent-soft text-accent" : "border border-line bg-surface text-ink hover:bg-surface-2"}`}
      >
        {saved ? "★ Saved" : "☆ Save"}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-20 mb-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-xl">
          <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted">Save to stash</p>
          <ul className="max-h-60 overflow-auto">
            {stashes.map((s) => {
              const on = optimistic.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() =>
                      start(async () => {
                        toggle(s.id);
                        await setInStashAction(ideaId, s.id, !on);
                      })
                    }
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    <span>{s.emoji}</span>
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className={on ? "text-accent" : "text-line"}>{on ? "✓" : "○"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <form
            className="mt-1 flex gap-1 border-t border-line pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newName.trim();
              if (!name) return;
              setNewName("");
              start(async () => {
                await createStashAction(name, "📌", ideaId);
              });
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New stash…"
              className="input py-1.5 text-sm"
              maxLength={60}
            />
            <button className="btn-primary px-3 py-1.5" type="submit">
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
