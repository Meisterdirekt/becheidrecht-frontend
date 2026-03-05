import { SkeletonCard } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="skeleton-shimmer rounded-lg h-8 w-48" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
