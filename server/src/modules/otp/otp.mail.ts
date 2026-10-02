import { env } from '../../config/env';

export interface OtpEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function buildOtpEmail(to: string, code: string): OtpEmail {
  const minutes = env.otp.ttlMs / 60000;
  const subject = `${code} is your PadosiPro verification code`;

  const text = [
    `Hi,`,
    ``,
    `${code} is your PadosiPro email verification code.`,
    ``,
    `It expires in ${minutes} minutes and can only be used once.`,
    `If you did not create a PadosiPro account you can ignore this email.`,
    ``,
    `- The PadosiPro Team`,
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F9F9FB;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1B2A26;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:460px;background:#FFFFFF;border-radius:12px;padding:32px;">
          <tr><td>
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#164E3F;">PadosiPro</p>
            <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;">Verify your email address</h1>
            <p style="margin:0 0 20px;font-size:15px;color:#5A6B66;">Enter this code to finish setting up your account.</p>
            <p style="margin:0 0 24px;font-size:32px;letter-spacing:8px;font-weight:700;color:#164E3F;">${escapeHtml(code)}</p>
            <p style="margin:0;font-size:13px;color:#7A8A85;">Valid for ${minutes} minutes, single use only.</p>
            <p style="margin:16px 0 0;font-size:12px;color:#98A6A2;">Sent to ${escapeHtml(to)}. If this was not you, no action is needed.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
