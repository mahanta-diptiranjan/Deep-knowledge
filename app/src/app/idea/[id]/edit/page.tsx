import { notFound } from "next/navigation";
import { updateIdeaAction } from "@/app/actions";
import { IdeaForm } from "@/components/idea-form";
import { getIdea } from "@/lib/queries";

export default async function EditIdeaPage({ params }: PageProps<"/idea/[id]/edit">) {
  const { id } = await params;
  const idea = getIdea(Number(id));
  if (!idea || idea.origin === "library") notFound();
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight">Edit idea</h1>
      <IdeaForm action={updateIdeaAction} initial={idea} />
    </div>
  );
}
