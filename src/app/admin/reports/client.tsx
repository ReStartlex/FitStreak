"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  X as XIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

type Status = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
type Category =
  | "SPAM"
  | "HARASSMENT"
  | "IMPERSONATION"
  | "CHEATING"
  | "INAPPROPRIATE"
  | "OTHER";

interface ReportRow {
  id: string;
  category: Category;
  comment: string | null;
  status: Status;
  createdAt: string;
  reporter: {
    id: string;
    username: string | null;
    name: string | null;
    email: string;
  };
  target: {
    id: string;
    username: string | null;
    name: string | null;
    email: string;
    currentStreak: number;
    level: number;
  };
}

interface Props {
  initial: ReportRow[];
  counts: Record<string, number>;
}

const CATEGORY_LABEL: Record<Category, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  IMPERSONATION: "Impersonation",
  CHEATING: "Cheating / inflated stats",
  INAPPROPRIATE: "Inappropriate content",
  OTHER: "Other",
};

const STATUS_TABS: { id: Status; label: string }[] = [
  { id: "OPEN", label: "Open" },
  { id: "REVIEWING", label: "Reviewing" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "DISMISSED", label: "Dismissed" },
];

export function AdminReportsClient({ initial, counts }: Props) {
  const toast = useToast();
  const [tab, setTab] = React.useState<Status>("OPEN");
  const [rows, setRows] = React.useState<ReportRow[]>(initial);
  const [loading, setLoading] = React.useState(false);
  const [actingId, setActingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tab === "OPEN") return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/reports?status=${tab}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        setRows(
          (j?.reports ?? []).map(
            (r: ReportRow & { createdAt: string | Date }) => ({
              ...r,
              createdAt:
                typeof r.createdAt === "string"
                  ? r.createdAt
                  : new Date(r.createdAt).toISOString(),
            }),
          ),
        );
      })
      .catch(() => setRows([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function act(id: string, status: Status, note?: string) {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error("update_failed");
      // Drop the row from the current view since its status changed.
      setRows((rs) => rs.filter((r) => r.id !== id));
      toast(`Marked ${status.toLowerCase()}`, { tone: "success" });
    } catch {
      toast("Failed to update report", { tone: "error" });
    } finally {
      setActingId(null);
    }
  }

  return (
    <main className="container py-8 sm:py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Reports
          </h1>
          <p className="text-sm text-ink-dim">
            Moderation queue · {counts.OPEN ?? 0} open ·{" "}
            {counts.REVIEWING ?? 0} reviewing
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_TABS.map((s) => {
          const active = tab === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors " +
                (active
                  ? "border-lime/60 bg-lime/10 text-lime"
                  : "border-line bg-white/[0.02] text-ink-muted hover:text-ink")
              }
            >
              {s.label}
              <span className="ml-1.5 text-ink-dim">
                {counts[s.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="surface p-6 flex items-center gap-3 text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="surface p-10 text-center text-ink-muted">
          <Check className="size-6 mx-auto mb-2 text-lime" />
          Nothing to review here. Quiet day.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <ReportCard
              key={r.id}
              row={r}
              busy={actingId === r.id}
              onAct={act}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

function ReportCard({
  row,
  busy,
  onAct,
}: {
  row: ReportRow;
  busy: boolean;
  onAct: (id: string, status: Status, note?: string) => void;
}) {
  const reporterHandle = row.reporter.username ?? row.reporter.id;
  const targetHandle = row.target.username ?? row.target.id;

  return (
    <li className="surface p-4 sm:p-5">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-ink-muted shrink-0">
          <Clock className="size-3.5" />
          {new Date(row.createdAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full px-2 py-0.5 border border-accent-rose/30 bg-accent-rose/10 text-accent-rose font-medium">
            {CATEGORY_LABEL[row.category]}
          </span>
          <span className="text-ink-dim">{row.status}</span>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <PersonBlock
          title="Reporter"
          name={row.reporter.name}
          handle={reporterHandle}
          email={row.reporter.email}
        />
        <PersonBlock
          title="Target"
          name={row.target.name}
          handle={targetHandle}
          email={row.target.email}
          extra={`L${row.target.level} · ${row.target.currentStreak}-day streak`}
        />
      </div>

      {row.comment ? (
        <div className="mt-4 rounded-xl bg-white/[0.03] border border-line p-3 text-sm whitespace-pre-wrap">
          {row.comment}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/u/${targetHandle}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
        >
          <ExternalLink className="size-3.5" />
          Open profile
        </Link>
        {row.status !== "REVIEWING" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAct(row.id, "REVIEWING")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet/40 bg-violet/10 text-violet-soft px-3 py-1.5 text-xs disabled:opacity-50"
          >
            <Eye className="size-3.5" /> Mark reviewing
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => onAct(row.id, "RESOLVED")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-lime/40 bg-lime/10 text-lime px-3 py-1.5 text-xs disabled:opacity-50"
        >
          <Check className="size-3.5" /> Resolve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            const note = window.prompt("Reason for dismissal (optional)") ?? "";
            onAct(row.id, "DISMISSED", note || undefined);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] text-ink-muted hover:text-ink px-3 py-1.5 text-xs disabled:opacity-50"
        >
          <XIcon className="size-3.5" /> Dismiss
        </button>
        {busy ? (
          <Loader2 className="size-4 animate-spin text-ink-muted" />
        ) : null}
      </div>
    </li>
  );
}

function PersonBlock({
  title,
  name,
  handle,
  email,
  extra,
}: {
  title: string;
  name: string | null;
  handle: string;
  email: string;
  extra?: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-line p-3">
      <div className="text-[11px] uppercase tracking-widest text-ink-dim mb-2 flex items-center gap-1.5">
        {title === "Target" ? (
          <AlertTriangle className="size-3 text-accent-rose" />
        ) : null}
        {title}
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={name ?? handle} size={36} />
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{name ?? handle}</div>
          <div className="text-xs text-ink-muted truncate">@{handle}</div>
          <div className="text-xs text-ink-dim truncate">{email}</div>
          {extra ? (
            <div className="text-xs text-ink-dim mt-0.5">{extra}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
