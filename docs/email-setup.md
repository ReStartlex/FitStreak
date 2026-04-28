# Email setup (Resend)

FitStreak sends transactional email through [Resend](https://resend.com).

## Status: ✅ verified for `fitstreak.ru`

Production is live with the subdomain `mail.fitstreak.ru` verified in
Resend, so verification codes and password resets deliver to **any
inbox** (Gmail, Yandex, Mail.ru, iCloud, etc.).

Recommended `RESEND_FROM` for production:

```
RESEND_FROM=FitStreak <noreply@mail.fitstreak.ru>
```

> Tip: keep the friendly name (`FitStreak`) — it dramatically lowers
> the chance the message lands in spam.

## Why a verification code might still not arrive

Resend rejects messages with `validation_error` when:

1. The `from:` address uses a domain that **isn't verified** in your
   Resend dashboard.
2. The `from:` address uses Resend's shared sandbox
   `onboarding@resend.dev` **and** the `to:` address isn't the email
   that owns the Resend account.

If you ever see this on the server logs, double-check the domain
verification badge in Resend — DNS changes can drift if the registrar
deletes records during a renewal.

## Local / sandbox fallback

If you're running locally without a verified domain, set:

```
RESEND_FROM=FitStreak <onboarding@resend.dev>
```

Sandbox mode only delivers to the email that owns the Resend account.

If `RESEND_API_KEY` is missing entirely, we log the 6-digit code to
the server console — handy in development without internet.

## Adding another domain (or moving to a new one)

1. **Buy a domain** at any registrar (we use `fitstreak.ru`).
2. In **Resend → Domains** click **Add domain** and enter the bare
   domain or a sending-only subdomain (we use `mail.fitstreak.ru`).
3. Resend shows DNS records to add at your registrar:
   - 1× TXT (SPF: `v=spf1 include:amazonses.com ~all`)
   - 3× CNAME for DKIM
   - 1× TXT for DMARC (recommended: `v=DMARC1; p=none`)
   - 1× MX (depending on plan)
4. Add them in your DNS provider; propagation takes a few minutes to
   24 hours.
5. Click **Verify** in Resend. Status switches to **Verified**.
6. Update `RESEND_FROM` on Vercel and redeploy.

## What our code does on failure

`src/lib/auth/email-verify.ts` and `src/lib/auth/password-reset.ts`
both log the Resend error to Vercel runtime logs and, if the `from`
looks like an unverified custom domain, automatically retry **once**
with the sandbox sender. This keeps the auth flow usable during DNS
propagation.
