"use client";

import * as React from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <main className="container py-20 sm:py-28 grid place-items-center text-center">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose/40 bg-rose/10 text-rose px-3 h-8 text-xs uppercase tracking-widest">
          ошибка
        </div>
        <h1 className="font-display text-display-md sm:text-display-lg font-bold mt-5 leading-[1.05]">
          Что-то пошло не по плану.
        </h1>
        <p className="text-ink-dim mt-4">
          Попробуй обновить страницу. Если ошибка повторится — мы её уже
          фиксируем.
        </p>
        {error.digest && (
          <p className="text-xs text-ink-muted mt-2 font-mono">
            digest: {error.digest}
          </p>
        )}
        <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-lime-gradient text-bg font-medium shadow-glow"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-line bg-white/[0.04] text-ink hover:bg-white/[0.08]"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
