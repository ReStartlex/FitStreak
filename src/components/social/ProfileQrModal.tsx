"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

/**
 * Lightweight QR modal — encodes the public profile URL with the
 * `qrcode` package as an SVG string, then displays it inline. Avoids
 * canvas/img round-trips and stays crisp at any size.
 */
export function ProfileQrModal({
  open,
  onClose,
  username,
  displayName,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
}) {
  const { locale } = useI18n();
  const [svg, setSvg] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const url = React.useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/u/${username}`
        : `https://fitstreak.ru/u/${username}`,
    [username],
  );

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    void (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const data = await QRCode.toString(url, {
          type: "svg",
          margin: 1,
          color: {
            dark: "#0A0A0B",
            light: "#FFFFFFFF",
          },
          errorCorrectionLevel: "M",
        });
        if (alive) setSvg(data);
      } catch {
        if (alive) setSvg(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm rounded-3xl border border-line bg-bg-card p-6 shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 size-8 grid place-items-center rounded-full text-ink-muted hover:text-ink hover:bg-white/[0.06]"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <h2 className="font-display text-xl font-bold mb-1">
              {displayName}
            </h2>
            <p className="text-sm text-ink-muted mb-4">
              {locale === "ru"
                ? "Покажи QR — добавят в один тап."
                : "Show this QR to be added in one tap."}
            </p>
            <div className="aspect-square bg-white rounded-2xl p-3 mb-4 grid place-items-center">
              {svg ? (
                <div
                  className="size-full"
                  // svg string from qrcode is safe — values are numeric paths
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <div className="size-full bg-white/30 rounded-xl animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 h-10">
              <span className="flex-1 text-sm text-ink-dim truncate">
                {url}
              </span>
              <button
                type="button"
                onClick={copy}
                className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-lime" />
                    {locale === "ru" ? "Готово" : "Copied"}
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    {locale === "ru" ? "Скопировать" : "Copy"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
