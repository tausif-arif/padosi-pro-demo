import fs from 'node:fs/promises';
import path from 'node:path';

const MAIL_DIR = path.resolve(process.cwd(), 'tmp-mail');

export interface CapturedMail {
  /** Nodemailer normalises recipients to `{ address, name }` objects. */
  to: string | Array<string | { address: string }>;
  subject: string;
  text: string;
  html?: string;
  file: string;
}

async function readAll(): Promise<CapturedMail[]> {
  let files: string[];
  try {
    files = await fs.readdir(MAIL_DIR);
  } catch {
    return [];
  }

  const parsed = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(MAIL_DIR, file), 'utf8');
      try {
        return { ...(JSON.parse(raw) as CapturedMail), file };
      } catch {
        return null;
      }
    }),
  );

  // File names start with a millisecond timestamp, so lexical order is
  // chronological - that is what makes `.at(-1)` the newest message.
  return parsed
    .filter((mail): mail is CapturedMail => mail !== null && typeof mail.subject === 'string')
    .sort((a, b) => a.file.localeCompare(b.file));
}

function recipientsOf(mail: CapturedMail): string[] {
  const entries = Array.isArray(mail.to) ? mail.to : [mail.to];
  return entries.map((entry) => (typeof entry === 'string' ? entry : entry.address)).map((v) => v.toLowerCase());
}

/** The most recent OTP email delivered to `email`. */
export async function latestMailFor(email: string): Promise<CapturedMail | null> {
  const mails = (await readAll()).filter((mail) => recipientsOf(mail).includes(email.toLowerCase()));
  return mails.at(-1) ?? null;
}

/** Pulls the 6 digit code out of the rendered email body. */
export async function latestOtpFor(email: string): Promise<string> {
  const mail = await latestMailFor(email);
  if (!mail) throw new Error(`No email was captured for ${email}`);

  const fromSubject = /(\d{6})/.exec(mail.subject)?.[1];
  const fromText = /verification code\.?[\s\S]*?(\d{6})/i.exec(mail.text)?.[1];
  const code = fromSubject ?? fromText;

  if (!code) throw new Error(`No OTP found in the email sent to ${email}`);
  return code;
}
