import nodemailer, { type Transporter } from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from './env';

export interface MailPreview {
  kind: 'ethereal' | 'smtp' | 'json';
  /** Where a human can read the message. Null for real SMTP. */
  previewUrl: string | null;
  account?: { user: string; host: string; port: number };
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface MailerBundle {
  transporter: Transporter;
  preview: MailPreview;
}

let bundlePromise: Promise<MailerBundle> | null = null;
let preview: MailPreview | null = null;

function fromHeader(): string {
  return `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`;
}


async function createMailer(): Promise<MailerBundle> {
  if (env.MAIL_TRANSPORT === 'smtp') {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    await transporter.verify();
    return { transporter, preview: { kind: 'smtp', previewUrl: null } };
  }

  if (env.MAIL_TRANSPORT === 'json') {
    return { transporter: createFileTransport(), preview: { kind: 'json', previewUrl: null } };
  }

  const account = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
  const url = nodemailer.getTestMessageUrl(account as never);
  return {
    transporter,
    preview: {
      kind: 'ethereal',
      previewUrl: typeof url === 'string' ? url : null,
      account: { user: account.user, host: account.smtp.host, port: account.smtp.port },
    },
  };
}

export async function initMailer(): Promise<MailPreview> {
  if (!bundlePromise) bundlePromise = createMailer();
  const bundle = await bundlePromise;
  preview = bundle.preview;

  if (bundle.preview.kind === 'ethereal' && bundle.preview.previewUrl) {
    console.log(`  OTP emails: ${bundle.preview.previewUrl}`);
  }

  return bundle.preview;
}

/** Test transport: keeps the rendered message so tests can read the OTP back. */
function createFileTransport(): Transporter {
  const dir = path.resolve(process.cwd(), 'tmp-mail');
  const transporter = nodemailer.createTransport({ jsonTransport: true });
  const deliver = transporter.sendMail.bind(transporter);

  // Nodemailer only honours a custom `sendMail` when it is assigned onto the
  // built transporter, so the original delivery is wrapped rather than replaced.
  transporter.sendMail = async (options) => {
    const info = await deliver(options);
    const rendered = (info as { message?: string | Record<string, unknown> }).message;

    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
    await fs.writeFile(
      path.join(dir, name),
      typeof rendered === 'string' ? rendered : JSON.stringify(rendered ?? options, null, 2),
    );

    return info;
  };

  return transporter;
}

export async function sendMail(message: MailMessage): Promise<void> {
  if (!bundlePromise) await initMailer();
  const bundle = await bundlePromise!;
  await bundle.transporter.sendMail({ from: fromHeader(), ...message });

  if (env.MAIL_DEBUG) {
    console.log(`[mail] to=${message.to} subject="${message.subject}"`);
  }
}

export function mailPreviewUrl(): string | null {
  return preview?.previewUrl ?? null;
}
