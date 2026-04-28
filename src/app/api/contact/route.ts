import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import {
  ok,
  badRequest,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOPICS = [
  "general",
  "bug",
  "feature",
  "billing",
  "press",
  "abuse",
] as const;

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  topic: z.enum(TOPICS).default("general"),
  message: z.string().min(10).max(4000),
  /** Honeypot — must stay empty for real users. */
  website: z.string().optional(),
});

const TOPIC_LABEL: Record<(typeof TOPICS)[number], string> = {
  general: "General",
  bug: "Bug report",
  feature: "Feature request",
  billing: "Billing",
  press: "Press",
  abuse: "Abuse / safety",
};

const TARGET = process.env.CONTACT_INBOX ?? "support@fitstreak.ru";

export async function POST(request: NextRequest) {
  try {
    // IP-based limit first so anonymous users can't spam.
    const ipKey = `contact-ip:${clientId(request)}`;
    const ipLimit = rateLimit(ipKey, 5, 60 * 60_000);
    if (!ipLimit.ok) return tooMany(ipLimit.resetAt);

    // Tighter per-account limit when authenticated.
    const session = await auth();
    if (session?.user?.id) {
      const userLimit = rateLimit(`contact:${session.user.id}`, 5, 60 * 60_000);
      if (!userLimit.ok) return tooMany(userLimit.resetAt);
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("VALIDATION");
    if (parsed.data.website) {
      // Honeypot tripped — fail silently to bots.
      return ok({ ok: true });
    }

    const { name, email, topic, message } = parsed.data;
    const subject = `[Contact · ${TOPIC_LABEL[topic]}] ${name}`;

    const text = [
      `Topic: ${TOPIC_LABEL[topic]}`,
      `From: ${name} <${email}>`,
      session?.user?.id
        ? `User ID: ${session.user.id} (${session.user.email})`
        : "User ID: anonymous",
      "",
      message,
    ].join("\n");

    const html = `
<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#111;background:#fafafa;padding:24px">
  <h2 style="margin:0 0 12px">${TOPIC_LABEL[topic]} · ${escapeHtml(name)}</h2>
  <p style="margin:0 0 4px;color:#555;font-size:13px">From: <strong>${escapeHtml(email)}</strong></p>
  ${
    session?.user?.id
      ? `<p style="margin:0 0 12px;color:#555;font-size:13px">User ID: ${session.user.id} (${escapeHtml(session.user.email ?? "")})</p>`
      : `<p style="margin:0 0 12px;color:#888;font-size:13px">Anonymous visitor</p>`
  }
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
  <pre style="white-space:pre-wrap;font:14px/1.5 system-ui,sans-serif;margin:0">${escapeHtml(message)}</pre>
</body></html>`;

    const result = await sendEmail({
      to: TARGET,
      subject,
      text,
      html,
    });
    // We always return ok=true to the user — they shouldn't have to
    // know whether the platform email backend is wired up. Errors are
    // logged server-side by `sendEmail` itself.
    return ok({ ok: true, delivered: result.ok });
  } catch (error) {
    return serverError(error);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
