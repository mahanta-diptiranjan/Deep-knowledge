"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { gradeAction } from "@/app/actions";
import type { Grade, Idea } from "@/lib/queries";
import { SourceLine, TopicTag } from "./idea-card";

const GRADES: { g: Grade; label: string; hint: string }[] = [
  { g: "again", label: "Forgot", hint: "soon" },
  { g: "hard", label: "Hard", hint: "shorter" },
  { g: "good", label: "Got it", hint: "normal" },
  { g: "easy", label: "Easy", hint: "longer" },
];

export function ReviewSession({ ideas }: { ideas: Idea[] }) {
  const [queue] = useState(ideas);
  const [n, setN] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [, start] = useTransition();

  if (n >= queue.length) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center">
        <div className="text-4xl">🎉</div>
        <p className="mt-2 font-serif text-2xl font-bold">Review done</p>
        <p className="text-muted">You reviewed {queue.length} {queue.length === 1 ? "idea" : "ideas"}.</p>
        <Link href="/" className="btn-primary mt-6">Back to feed</Link>
      </div>
    );
  }

  const idea = queue[n];
  const grade = (g: Grade) => {
    start(() => gradeAction(idea.id, g));
    setRevealed(false);
    setN(n + 1);
  };

  return (
    <div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-accent transition-all" style={{ width: `${(n / queue.length) * 100}%` }} />
      </div>
      <p className="mb-3 text-sm text-muted">{n + 1} of {queue.length} · Try to recall the idea before revealing it.</p>
      <article className="rounded-3xl border border-line bg-surface p-6">
        <TopicTag topic={idea.topic} />
        <h2 className="mt-3 font-serif text-2xl font-bold leading-tight">{idea.title}</h2>
        {revealed ? (
          <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed">{idea.body}</p>
        ) : (
          <button onClick={() => setRevealed(true)} className="btn-ghost mt-6 w-full py-6">Reveal idea</button>
        )}
        <div className="mt-5"><SourceLine idea={idea} /></div>
      </article>
      {revealed && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GRADES.map(({ g, label, hint }) => (
            <button key={g} onClick={() => grade(g)} className={`rounded-2xl border border-line bg-surface py-3 text-sm font-semibold hover:bg-surface-2 ${g === "good" ? "border-good text-good" : ""}`}>
              {label}
              <span className="block text-[11px] font-normal text-muted">{hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
