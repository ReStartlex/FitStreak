import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";

interface SendOpts {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Generic, brand-friendly email send via Resend with the same fallback
 * pattern as `sendVerificationEmail`: if the configured RESEND_FROM
 * domain isn't verified yet, retry with the universal sandbox sender
 * once so dev/staging deliver to the API-key owner.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendOpts): Promise<{ ok: boolean; error?: string }> {
  if (!env.resend.enabled || !env.resend.apiKey) {
    console.warn(
      `[email] Resend not configured. Would send "${subject}" to ${to}`,
    );
    return { ok: false, error: "RESEND_DISABLED" };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(env.resend.apiKey);
    const result = await resend.emails.send({
      from: env.resend.from,
      to,
      subject,
      text,
      html,
    });
    if (result.error) {
      console.error(
        "[email] resend rejected:",
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
          to,
          subject,
          text,
          html,
        });
        return { ok: true };
      }
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] failed", err);
    return { ok: false, error: String(err) };
  }
}

interface BrandedTemplate {
  preheader?: string;
  greeting: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  footer?: string;
}

/**
 * Compose a simple branded HTML wrapper. Keeps inline styles to play
 * nice with Gmail/Outlook.
 */
export function brandedEmailHtml(
  subject: string,
  t: BrandedTemplate,
): string {
  const url = siteConfig.url;
  const cta =
    t.ctaLabel && t.ctaHref
      ? `<a href="${t.ctaHref}" style="display:inline-block;margin-top:18px;padding:12px 22px;border-radius:12px;background:#bdfb4d;color:#0a0c0d;font-weight:700;text-decoration:none;">${t.ctaLabel}</a>`
      : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0c0d;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e7ecef;">
${t.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${t.preheader}</div>` : ""}
<div style="max-width:520px;margin:0 auto;padding:32px 24px;">
  <a href="${url}" style="display:inline-block;font-weight:700;font-size:20px;color:#bdfb4d;text-decoration:none;">FitStreak</a>
  <h1 style="font-size:22px;font-weight:800;margin:24px 0 8px 0;color:#ffffff;">${subject}</h1>
  <p style="font-size:14px;line-height:1.55;color:#a8b3b9;margin:0 0 8px 0;">${t.greeting}</p>
  <div style="font-size:15px;line-height:1.6;color:#dde3e6;margin:0 0 8px 0;">${t.body}</div>
  ${cta}
  <hr style="border:none;border-top:1px solid #232a2e;margin:28px 0 18px;" />
  <p style="font-size:12px;color:#5b656a;margin:0;">${t.footer ?? "FitStreak — двигайся каждый день, и серия будет расти."}</p>
</div></body></html>`;
}
