import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AskPageClient from "./ask-client";

export const metadata = {
  title: "Ask",
};

function AskLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-10 w-full max-w-lg" />
      </div>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<AskLoading />}>
      <AskPageClient />
    </Suspense>
  );
}
