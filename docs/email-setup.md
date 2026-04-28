# Email setup (Resend)

FitStreak sends transactional email through [Resend](https://resend.com).

## Why your verification code may not arrive

Resend rejects emails with `validation_error` (or similar) when:

1. The `from:` address uses a domain that **isn't verified** in your
   Resend dashboard.
2. The `from:` address uses Resend's shared sandbox `onboarding@resend.dev`
   **and** the `to:` address isn't the email that owns the Resend account.

In our code we default `RESEND_FROM` to `FitStreak <onboarding@resend.dev>`,
which works out of the box — but only delivers to the inbox of whoever
owns the Resend API key. For real users you must verify your own domain.

## Quick fix for testing

Set on Vercel (or in `.env.local`):

```
RESEND_FROM=FitStreak <onboarding@resend.dev>
```

Then sign up using the **email registered with your Resend account** —
the code will arrive there.

## Production setup

1. **Buy a domain** (e.g. `fitstreak.app`) — any registrar.
2. In **Resend → Domains** click **Add domain** and enter your bare
   domain (`fitstreak.app`, not `mail.fitstreak.app` unless you want a
   subdomain).
3. Resend shows DNS records you must add at your registrar:
   - 1× MX (or sometimes none, depending on plan)
   - 1× TXT (SPF: `v=spf1 include:amazonses.com ~all`)
   - 3× CNAME for DKIM
   - 1× TXT for DMARC (recommended: `v=DMARC1; p=none`)
4. Add them in your DNS provider; propagation takes a few minutes to
   24 hours.
5. Click **Verify** in Resend. Status switches to **Verified**.
6. Update `RESEND_FROM` on Vercel:

```
RESEND_FROM=FitStreak <noreply@fitstreak.app>
```

7. Redeploy. Now codes deliver to anyone.

## What our code does on failure

`src/lib/auth/email-verify.ts` logs the Resend error to Vercel runtime
logs and, if the `from` looks like an unverified custom domain,
automatically retries once with the sandbox sender. So during DNS
propagation you can still finish the flow as the account owner.

If `RESEND_API_KEY` is missing entirely, we just log the 6-digit code
to the server console — handy in development without internet.
