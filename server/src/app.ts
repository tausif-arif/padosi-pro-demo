import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFoundHandler } from './common/middlewares/errorHandler';
import { env } from './config/env';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  // The mobile client has no browser origin; permissive CORS keeps the Expo
  // web target and future admin dashboard usable without a second config.
  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
