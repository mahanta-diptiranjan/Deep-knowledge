import Link from "next/link";
import { createIdeaAction } from "@/app/actions";
import { AiGenerator } from "@/components/ai-generator";
import { IdeaForm } from "@/components/idea-form";
import { aiConfigured } from "@/lib/ai";

export default async function CreatePage({ searchParams }: PageProps<"/create">) {
  const mode = (await searchParams).mode === "write" ? "write" : "ai";
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight">Create</h1>
      <div className="mb-6 mt-4 inline-flex rounded-full border border-line bg-surface p-1 text-sm">
        <Link href="/create" className={`rounded-full px-4 py-1.5 ${mode === "ai" ? "bg-ink text-bg" : "text-muted"}`}>
          ✨ From a source
        </Link>
        <Link href="/create?mode=write" className={`rounded-full px-4 py-1.5 ${mode === "write" ? "bg-ink text-bg" : "text-muted"}`}>
          ✍️ Write your own
        </Link>
      </div>
      {mode === "ai" ? <AiGenerator configured={aiConfigured()} /> : <IdeaForm action={createIdeaAction} showSource />}
    </div>
  );
}
