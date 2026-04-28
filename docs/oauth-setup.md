# OAuth setup after the move to `fitstreak.ru`

The provider apps were originally registered against the `*.vercel.app`
preview URL. After connecting the production domain `fitstreak.ru`,
each provider's redirect-URI whitelist must be updated **once** per
provider, otherwise the user lands on the provider's error page
("Ошибка загрузки" for VK, "Этот способ входа сейчас недоступен" for
Yandex).

The exact URLs to whitelist are:

| Provider | Redirect URI to add                                   |
| -------- | ----------------------------------------------------- |
| Google   | `https://fitstreak.ru/api/auth/callback/google`       |
| Yandex   | `https://fitstreak.ru/api/auth/callback/yandex`       |
| VK ID    | `https://fitstreak.ru/api/auth/vkid/callback`         |

Keep the previous Vercel preview URLs in the whitelist too — they're
still useful for staging deploys.

## Google

1. Open <https://console.cloud.google.com/apis/credentials>.
2. Pick the existing OAuth client (`Web application`, the one whose
   client id is in `AUTH_GOOGLE_ID`).
3. Add to **Authorized JavaScript origins**:
   - `https://fitstreak.ru`
4. Add to **Authorized redirect URIs**:
   - `https://fitstreak.ru/api/auth/callback/google`
5. Save.

Already set: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` in Vercel.

## Yandex

1. Open <https://oauth.yandex.ru/> → your app.
2. In **Платформы** ensure **Web-сервисы** is enabled.
3. In **Redirect URI** add:
   - `https://fitstreak.ru/api/auth/callback/yandex`
4. Required scopes: **Доступ к адресу электронной почты**
   (`login:email`) and **Доступ к логину, имени и фамилии, полу**
   (`login:info`).
5. If your app is in "developer-only" mode, switch it to public or
   add yourself to the test users list.
6. Save.

Already set: `AUTH_YANDEX_ID`, `AUTH_YANDEX_SECRET` in Vercel.

## VK ID (id.vk.com)

VK ID is the modern auth platform (not legacy `oauth.vk.com`) — the
one whose dashboard lives at <https://id.vk.com/about/business/go>.

1. Open the dashboard for the VK app whose **App ID** matches
   `AUTH_VK_ID` (currently `54568314`).
2. Go to **Настройки** → **Доверенные redirect URI** and add:
   - `https://fitstreak.ru/api/auth/vkid/callback`
3. Add `https://fitstreak.ru` to the **Доверенные домены** list (the
   "Trusted domains" field).
4. Make sure scope **email** is enabled in the application's settings.
5. If the app is in **тестовый режим**, switch it to **доступно для
   всех** (or add your VK account to allowed users).
6. Save.

The signin button on FitStreak hits our own `/api/auth/vkid/start`
which redirects to `https://id.vk.com/authorize?...` with PKCE — the
flow is custom because Auth.js's bundled `vk` provider only supports
the deprecated `oauth.vk.com` endpoints.

## Common error → cause

| Error shown to the user                              | Root cause                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| VK: "Ошибка загрузки. Попробуйте ещё раз."           | Redirect URI not in VK trusted list, or the app is still in `тестовый режим`.    |
| Yandex: "Этот способ входа сейчас недоступен."       | Redirect URI not whitelisted at oauth.yandex.ru, or `login:email` scope missing. |
| `?error=OAuthAccountNotLinked`                       | Same email already exists with another provider; sign in via the original one.   |
| `?error=Configuration`                               | Provider response failed validation; usually the redirect URI mismatch above.    |

## Sanity-check after updating

1. Open `https://fitstreak.ru/signin` in an **Incognito** window.
2. Click the provider button.
3. Approve the consent screen.
4. You should land on `https://fitstreak.ru/dashboard` (or
   `/onboarding` for the very first login).

If you still see an error, copy the URL from the address bar (it
contains `?error=...`) and check the table above.
