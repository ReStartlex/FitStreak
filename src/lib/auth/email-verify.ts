import { createHash, randomInt } from "node:crypto";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

/**
 * Email-verification 6-digit codes.
 *
 * We piggy-back on the existing Auth.js `VerificationToken` table:
 * - `identifier` = `verify-email:<lowercased-email>`
 * - `token` = SHA-256 hash of the 6-digit code (so a DB leak doesn't
 *   reveal active codes)
 * - `expires` = +10 minutes
 *
 * On verification we delete the row whether it succeeds or not (one-shot
 * use), but we also rate-limit issuance from the API layer.
 */

const PREFIX = "verify-email:";
const TTL_MS = 10 * 60 * 1000;

export interface IssuedCode {
  /** Plain 6-digit code, only ever returned to the issuer (to email it). */
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

/** Issues a fresh code and invalidates any previous outstanding ones. */
export async function issueVerificationCode(
  email: string,
): Promise<IssuedCode> {
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

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "INVALID" | "EXPIRED" | "NOT_FOUND" };

/** Verifies & consumes a code. Always deletes any matching row to prevent reuse. */
export async function consumeVerificationCode(
  email: string,
  code: string,
): Promise<VerifyResult> {
  const identifier = identifierFor(email);
  const tokenHash = hashCode(code.trim());

  const found = await db.verificationToken.findFirst({
    where: { identifier },
  });
  if (!found) return { ok: false, reason: "NOT_FOUND" };

  if (found.token !== tokenHash) {
    return { ok: false, reason: "INVALID" };
  }

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
  appUrl?: string;
}

/**
 * Sends the verification email via Resend if configured.
 * In development without Resend we just log to console so the dev
 * can still complete the flow.
 */
export async function sendVerificationEmail({
  email,
  code,
  locale = "ru",
  appUrl,
}: SendArgs): Promise<void> {
  const subject =
    locale === "ru"
      ? `Ваш код FitStreak: ${code}`
      : `Your FitStreak code: ${code}`;
  const text =
    locale === "ru"
      ? `Код подтверждения: ${code}\n\nКод действует 10 минут. Если вы не запрашивали — просто проигнорируйте письмо.\n\n— FitStreak`
      : `Verification code: ${code}\n\nThe code is valid for 10 minutes. If you didn't request it, ignore this email.\n\n— FitStreak`;

  const html = renderHtml({ code, locale, appUrl });

  if (!env.resend.enabled || !env.resend.apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email-verify] Resend not configured, code for ${email}: ${code}`,
      );
    }
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.resend.apiKey);
    await resend.emails.send({
      from: env.resend.from,
      to: email,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[email-verify] failed to send", err);
  }
}

function renderHtml({
  code,
  locale,
  appUrl,
}: {
  code: string;
  locale: "ru" | "en";
  appUrl?: string;
}): string {
  const url = appUrl ?? env.NEXT_PUBLIC_APP_URL ?? "https://fitstreak.app";
  const t =
    locale === "ru"
      ? {
          title: "Подтвердите email",
          subtitle:
            "Введите этот код в FitStreak, чтобы завершить регистрацию.",
          ttl: "Код действует 10 минут.",
          ignore:
            "Если вы не пытались зарегистрироваться, просто проигнорируйте письмо.",
          footer: "FitStreak — двигайся каждый день, и серия будет расти.",
        }
      : {
          title: "Confirm your email",
          subtitle: "Enter this code in FitStreak to finish signing up.",
          ttl: "The code is valid for 10 minutes.",
          ignore: "If you didn't try to register, just ignore this email.",
          footer: "FitStreak — move every day and your streak will grow.",
        };

  return `
<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:#0a0c0d;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7ecef;">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
      <a href="${url}" style="display:inline-block;font-weight:700;font-size:18px;color:#bdfb4d;text-decoration:none;">
        FitStreak
      </a>
      <h1 style="font-size:24px;font-weight:800;margin:24px 0 8px 0;color:#ffffff;">${t.title}</h1>
      <p style="font-size:14px;line-height:1.5;color:#a8b3b9;margin:0 0 24px 0;">${t.subtitle}</p>

      <div style="background:#161a1c;border:1px solid #232a2e;border-radius:14px;padding:20px;text-align:center;">
        <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:32px;letter-spacing:8px;font-weight:700;color:#bdfb4d;">
          ${code}
        </div>
      </div>

      <p style="font-size:12px;color:#7d878d;margin:20px 0 6px 0;">${t.ttl}</p>
      <p style="font-size:12px;color:#7d878d;margin:0 0 24px 0;">${t.ignore}</p>

      <hr style="border:none;border-top:1px solid #232a2e;margin:24px 0;" />
      <p style="font-size:12px;color:#5b656a;margin:0;">${t.footer}</p>
    </div>
  </body>
</html>`;
}
