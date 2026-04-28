import { createHash, randomInt } from "node:crypto";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * Password reset codes — same pattern as email verification but a
 * different identifier prefix so the two flows don't clash.
 */

const PREFIX = "password-reset:";
const TTL_MS = 15 * 60 * 1000;

export interface IssuedResetCode {
  code: string;
  expiresAt: Date;
}

function hashCode(code: string): string {
  return createHash("sha256").update(`${code}|${PREFIX}`).digest("hex");
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function identifierFor(email: string): string {
  return PREFIX + email.toLowerCase();
}

export async function issueResetCode(email: string): Promise<IssuedResetCode> {
  const identifier = identifierFor(email);
  await db.verificationToken.deleteMany({ where: { identifier } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + TTL_MS);

  await db.verificationToken.create({
    data: {
      identifier,
      token: hashCode(code),
      expires: expiresAt,
    },
  });
  return { code, expiresAt };
}

export type ResetVerifyResult =
  | { ok: true }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "NOT_FOUND" };

export async function consumeResetCode(
  email: string,
  code: string,
): Promise<ResetVerifyResult> {
  const identifier = identifierFor(email);
  const tokenHash = hashCode(code.trim());

  const found = await db.verificationToken.findFirst({ where: { identifier } });
  if (!found) return { ok: false, reason: "NOT_FOUND" };

  if (found.token !== tokenHash) return { ok: false, reason: "INVALID" };

  await db.verificationToken
    .delete({ where: { token: found.token } })
    .catch(() => null);

  if (found.expires.getTime() < Date.now()) {
    return { ok: false, reason: "EXPIRED" };
  }
  return { ok: true };
}

interface SendArgs {
  email: string;
  code: string;
  locale?: "ru" | "en";
}

export async function sendPasswordResetEmail({
  email,
  code,
  locale = "ru",
}: SendArgs): Promise<void> {
  const subject =
    locale === "ru"
      ? `Сброс пароля FitStreak: ${code}`
      : `FitStreak password reset: ${code}`;
  const text =
    locale === "ru"
      ? `Код для сброса пароля: ${code}\n\nКод действует 15 минут. Если вы не запрашивали сброс — просто проигнорируйте письмо.\n\n— FitStreak`
      : `Password reset code: ${code}\n\nThe code is valid for 15 minutes. If you didn't request a reset, just ignore this email.\n\n— FitStreak`;

  if (!env.resend.enabled || !env.resend.apiKey) {
    console.warn(
      `[password-reset] Resend not configured. Code for ${email}: ${code}`,
    );
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.resend.apiKey);
    const result = await resend.emails.send({
      from: env.resend.from,
      to: email,
      subject,
      text,
      html: htmlTemplate(code, locale),
    });
    if (result.error) {
      console.error(
        "[password-reset] resend rejected:",
        result.error.name,
        result.error.message,
      );
      const isDomain =
        /domain|verif|sender|forbidden|not verified/i.test(
          result.error.message ?? "",
        ) || result.error.name === "validation_error";
      if (isDomain && env.resend.from !== "onboarding@resend.dev") {
        await resend.emails.send({
          from: "FitStreak <onboarding@resend.dev>",
          to: email,
          subject,
          text,
          html: htmlTemplate(code, locale),
        });
      }
    }
  } catch (err) {
    console.error("[password-reset] failed to send", err);
  }
}

function htmlTemplate(code: string, locale: "ru" | "en"): string {
  const t =
    locale === "ru"
      ? {
          title: "Сброс пароля",
          subtitle: "Введите этот код в FitStreak, чтобы установить новый пароль.",
          ttl: "Код действует 15 минут.",
          ignore: "Если вы не запрашивали сброс — просто проигнорируйте письмо.",
          footer: "FitStreak — двигайся каждый день.",
        }
      : {
          title: "Reset password",
          subtitle: "Enter this code in FitStreak to set a new password.",
          ttl: "The code is valid for 15 minutes.",
          ignore: "If you didn't request a reset, just ignore this email.",
          footer: "FitStreak — move every day.",
        };
  return `<!doctype html><html lang="${locale}"><body style="margin:0;padding:0;background:#0a0c0d;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7ecef;"><div style="max-width:480px;margin:0 auto;padding:32px 24px;"><a style="display:inline-block;font-weight:700;font-size:18px;color:#bdfb4d;text-decoration:none;">FitStreak</a><h1 style="font-size:24px;font-weight:800;margin:24px 0 8px 0;color:#fff;">${t.title}</h1><p style="font-size:14px;line-height:1.5;color:#a8b3b9;margin:0 0 24px 0;">${t.subtitle}</p><div style="background:#161a1c;border:1px solid #232a2e;border-radius:14px;padding:20px;text-align:center;"><div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:32px;letter-spacing:8px;font-weight:700;color:#bdfb4d;">${code}</div></div><p style="font-size:12px;color:#7d878d;margin:20px 0 6px 0;">${t.ttl}</p><p style="font-size:12px;color:#7d878d;margin:0 0 24px 0;">${t.ignore}</p><hr style="border:none;border-top:1px solid #232a2e;margin:24px 0;"/><p style="font-size:12px;color:#5b656a;margin:0;">${t.footer}</p></div></body></html>`;
}
