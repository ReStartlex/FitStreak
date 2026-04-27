import { z } from "zod";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  ok,
  badRequest,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(255),
  plan: z.enum(["PRO", "TEAM"]),
  source: z.string().max(80).optional(),
  locale: z.enum(["ru", "en"]).default("ru"),
});

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`waitlist:${clientId(request)}`, 10, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

    await db.waitlist.upsert({
      where: { email_plan: { email: parsed.data.email.toLowerCase(), plan: parsed.data.plan } },
      create: {
        email: parsed.data.email.toLowerCase(),
        plan: parsed.data.plan,
        source: parsed.data.source,
        locale: parsed.data.locale,
      },
      update: { source: parsed.data.source ?? undefined },
    });

    if (env.resend.enabled && env.resend.apiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(env.resend.apiKey);
        const subject =
          parsed.data.locale === "ru"
            ? "Вы в листе ожидания FitStreak"
            : "You're on the FitStreak waitlist";
        const message =
          parsed.data.locale === "ru"
            ? `Спасибо! Мы напишем вам, когда план ${parsed.data.plan} будет доступен.`
            : `Thanks! We'll email you when the ${parsed.data.plan} plan is available.`;
        await resend.emails.send({
          from: env.resend.from,
          to: parsed.data.email,
          subject,
          text: message,
        });
      } catch (err) {
        console.error("[waitlist] resend failed", err);
      }
    }

    return ok({ saved: true });
  } catch (error) {
    return serverError(error);
  }
}
