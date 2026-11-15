import Link from "next/link";
import { ReviewSession } from "@/components/review-session";
import { getDueReviews, nextReviewAt } from "@/lib/queries";

export default function ReviewPage() {
  const due = getDueReviews();
  const next = due.length ? null : nextReviewAt();
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold tracking-tight">Daily review</h1>
      <p className="mb-6 text-sm text-muted">Saved ideas come back at growing intervals so they stick.</p>
      {due.length ? (
        <ReviewSession ideas={due} />
      ) : (
        <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
          <p>Nothing to review right now.</p>
          <p className="mt-1 text-sm">
            {next
              ? `Next review: ${new Date(next.replace(" ", "T") + "Z").toLocaleString()}`
              : "Save ideas to a stash and they'll show up here the next day."}
          </p>
          <Link href="/" className="btn-ghost mt-6">Browse the feed</Link>
        </div>
      )}
    </div>
  );
}
