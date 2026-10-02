import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase, prisma } from './config/prisma';
import { initMailer } from './config/mailer';

async function init(): Promise<void> {
  await connectDatabase();
  const mail = await initMailer();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`  PadosiPro API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`  Health check: http://localhost:${env.PORT}/api/v1/health`);
    if (mail.kind === 'ethereal' && mail.previewUrl) {
      console.log(`  OTP emails land here: ${mail.previewUrl}`);
    }
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
    // Do not hang forever on a stuck keep-alive connection.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

init().catch(async (error) => {
  console.error('Failed to start the API:', error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
