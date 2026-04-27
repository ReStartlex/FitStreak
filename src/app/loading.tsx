export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex items-center gap-3 text-ink-muted text-sm">
        <span className="size-2 rounded-full bg-lime animate-pulse" />
        <span className="size-2 rounded-full bg-lime/70 animate-pulse [animation-delay:0.15s]" />
        <span className="size-2 rounded-full bg-lime/40 animate-pulse [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
