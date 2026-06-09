import { Resend } from "resend";

// Lazy init: the Resend constructor throws without an API key,
// which would break `next build` when the env variable is absent
let resendClient: Resend | null = null;

function getResend(): Resend {
  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@legendarium.ru";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Сброс пароля — Легендариум",
    html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#07181c;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07181c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#fbf7f1;border-radius:28px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.35);">
          <tr>
            <td style="background:linear-gradient(135deg,#07181c,#0b2428);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;color:#f0bd5b;">
                Легендариум
              </p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:800;color:#fff8e8;">
                Сброс пароля
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#44403c;">
                Мы получили запрос на сброс пароля для вашего аккаунта.
                Нажмите на кнопку ниже, чтобы задать новый пароль.
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#78716c;">
                Ссылка действительна в течение <strong>1 часа</strong>.
                Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                      style="display:inline-block;background:#d8a342;color:#06151a;font-weight:800;font-size:15px;
                             text-decoration:none;padding:14px 36px;border-radius:16px;letter-spacing:0.02em;">
                      Сбросить пароль
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:12px;color:#a8a29e;word-break:break-all;">
                Или скопируйте ссылку: ${resetUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 28px;border-top:1px solid #e7e0d8;">
              <p style="margin:20px 0 0;font-size:12px;color:#a8a29e;text-align:center;">
                © Легендариум — интерактивная платформа фольклора народов России
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
