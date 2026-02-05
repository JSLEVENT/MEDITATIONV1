import { Request, Response, NextFunction } from 'express';
import { isAdminEmail } from '../lib/admin';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const email = req.authUser?.email;

  if (!isAdminEmail(email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};
