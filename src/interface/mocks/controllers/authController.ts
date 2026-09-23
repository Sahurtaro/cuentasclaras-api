import type { Request, Response } from 'express';
import { users } from '../db.js';

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

export function login(req: Request, res: Response): void {
  const { email } = req.body as LoginBody;
  const user = users.find((candidate) => candidate.email === email);
  if (!user) {
    res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect', details: {} },
    });
    return;
  }
  res.status(200).json({
    accessToken: `mock-access.${user.id}`,
    refreshToken: `mock-refresh.${user.id}`,
  });
}

export function refresh(req: Request, res: Response): void {
  const { refreshToken } = req.body as RefreshBody;
  const userId = refreshToken.replace('mock-refresh.', '');
  res.status(200).json({
    accessToken: `mock-access.${userId}`,
    refreshToken,
  });
}