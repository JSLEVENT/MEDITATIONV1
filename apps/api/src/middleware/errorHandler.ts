import { Request, Response, NextFunction } from 'express';
import { Sentry } from '../lib/sentry';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.status(500).json({ error: 'Internal server error' });
};
