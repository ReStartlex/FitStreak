"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";
import { useToast } from "@/components/ui/Toast";

type ReportCategory =
  | "SPAM"
  | "HARASSMENT"
  | "IMPERSONATION"
  | "CHEATING"
  | "INAPPROPRIATE"
  | "OTHER";

const CATEGORIES: Array<{
  id: ReportCategory;
  ru: string;
  en: string;
  hint: { ru: string; en: string };
}> = [
  {
    id: "SPAM",
    ru: "Спам / реклама",
    en: "Spam / advertising",
    hint: {
      ru: "Постоянно рассылает ссылки или коммерческие сообщения",
      en: "Repeatedly sending links or commercial messages",
    },
  },
  {
    id: "HARASSMENT",
    ru: "Оскорбления / травля",
    en: "Harassment",
    hint: {
      ru: "Угрозы, оскорбления или травля",
      en: "Threats, insults or bullying",
    },
  },
  {
    id: "IMPERSONATION",
    ru: "Выдаёт себя за другого",
    en: "Impersonation",
    hint: {
      ru: "Использует чужое имя, аватар или биографию",
      en: "Pretending to be someone else",
    },
  },
  {
    id: "CHEATING",
    ru: "Накручивает результаты",
    en: "Cheating",
    hint: {
      ru: "Нереалистичные показатели или эксплойты",
      en: "Unrealistic numbers or exploiting bugs",
    },
  },
  {
    id: "INAPPROPRIATE",
    ru: "Неуместный контент",
    en: "Inappropriate content",
    hint: {
      ru: "Аватар или имя нарушают правила",
      en: "Avatar or name breaks the rules",
    },
  },
  {
    id: "OTHER",
    ru: "Другое",
    en: "Other",
    hint: {
      ru: "Опиши проблему ниже",
      en: "Describe the issue below",
    },
  },
];

export function ReportUserModal({
  open,
  onClose,
  userId,
  displayName,
  onReported,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
  onReported?: () => void;
}) {
  const { locale } = useI18n();
  const toast = useToast();
  const [category, setCategory] = React.useState<ReportCategory>("HARASSMENT");
  const [comment, setComment] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setCategory("HARASSMENT");
    setComment("");
    setPending(false);
  }, [open]);

  async function submit() {
    setPending(true);
    try {
      const res = await fetch(`/api/report/${userId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          category,
          comment: comment.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast(
          locale === "ru"
            ? "Жалоба отправлена. Пользователь заблокирован."
            : "Report submitted. User blocked.",
          { tone: "success" },
        );
        onReported?.();
        onClose();
      } else {
        toast(
          locale === "ru" ? "Не получилось отправить" : "Couldn't submit",
          { tone: "error" },
        );
      }
    } catch {
      toast(
        locale === "ru" ? "Сеть недоступна" : "Network unavailable",
        { tone: "error" },
      );
    } finally {
      setPending(false);
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
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-3xl border border-line bg-bg-card p-6 shadow-glow"
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
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="size-5 text-rose" />
              <h2 className="font-display text-xl font-bold">
                {locale === "ru"
                  ? `Пожаловаться на ${displayName}`
                  : `Report ${displayName}`}
              </h2>
            </div>
            <p className="text-sm text-ink-muted mb-5">
              {locale === "ru"
                ? "Мы сразу заблокируем пользователя для тебя. Команда модерации проверит жалобу в течение 24 часов."
                : "We block the user for you immediately. Moderation reviews the report within 24 hours."}
            </p>

            <div className="flex flex-col gap-1.5 mb-4">
              {CATEGORIES.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    category === c.id
                      ? "border-rose/50 bg-rose/8"
                      : "border-line bg-white/[0.02] hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-category"
                    value={c.id}
                    checked={category === c.id}
                    onChange={() => setCategory(c.id)}
                    className="accent-rose mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {locale === "ru" ? c.ru : c.en}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {locale === "ru" ? c.hint.ru : c.hint.en}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <label className="block mb-5">
              <span className="text-xs text-ink-muted uppercase tracking-widest">
                {locale === "ru" ? "Комментарий" : "Comment"}{" "}
                <span className="lowercase tracking-normal text-ink-muted/60">
                  {locale === "ru" ? "(не обязательно)" : "(optional)"}
                </span>
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={
                  locale === "ru"
                    ? "Что произошло? Чем больше деталей — тем быстрее разберёмся."
                    : "What happened? More detail helps us resolve faster."
                }
                className="mt-1.5 w-full rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-rose/50 outline-none resize-none"
              />
              <div className="mt-1 text-[10px] text-ink-muted text-right number-tabular">
                {comment.length}/1000
              </div>
            </label>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={pending}
              >
                {locale === "ru" ? "Отмена" : "Cancel"}
              </Button>
              <Button
                onClick={submit}
                disabled={pending}
                className="!bg-rose hover:!bg-rose/90 !text-white gap-2"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldAlert className="size-4" />
                )}
                {locale === "ru" ? "Отправить" : "Submit"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
