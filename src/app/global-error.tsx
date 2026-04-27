"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#0A0A0B",
          color: "#F5F5F4",
          fontFamily:
            "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 540, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(255, 80, 100, 0.4)",
              background: "rgba(255, 80, 100, 0.1)",
              color: "#ff7088",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            critical error
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              marginTop: 18,
              letterSpacing: -1,
            }}
          >
            Что-то пошло не по плану
          </h1>
          <p style={{ color: "#A8A29E", marginTop: 12 }}>
            Сервис временно недоступен. Попробуй обновить страницу.
          </p>
          {error.digest && (
            <p
              style={{
                color: "#78716C",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              digest: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              marginTop: 28,
              height: 48,
              padding: "0 24px",
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #c6ff3d 0%, #8aff00 60%, #5fbd00 100%)",
              color: "#0A0A0B",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
