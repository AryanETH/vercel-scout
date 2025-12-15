export function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="glass rounded-2xl p-6 opacity-0 animate-fade-in"
          style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg animate-shimmer" />
            <div className="h-4 w-32 rounded animate-shimmer" />
          </div>
          <div className="h-6 w-3/4 rounded animate-shimmer mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded animate-shimmer" />
            <div className="h-4 w-2/3 rounded animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
