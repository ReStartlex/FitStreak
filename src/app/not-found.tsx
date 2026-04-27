import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container py-20 sm:py-28 grid place-items-center text-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-line px-3 h-8 text-xs uppercase tracking-widest text-ink-muted">
            404
          </div>
          <h1 className="font-display text-display-lg sm:text-display-xl font-bold mt-5 leading-[0.95]">
            Эта страница <span className="text-lime">сорвала серию.</span>
          </h1>
          <p className="text-ink-dim mt-4">
            Похоже, путь нашёлся не туда. Проверь адрес или вернись на главную —
            серия ждёт.
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-lime-gradient text-bg font-medium shadow-glow"
            >
              На главную
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl border border-line bg-white/[0.04] text-ink hover:bg-white/[0.08]"
            >
              В кабинет
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
