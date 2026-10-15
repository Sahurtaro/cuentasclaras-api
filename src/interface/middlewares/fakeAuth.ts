import type { Request, Response, NextFunction } from 'express';

export function FakeAuth(_req: Request, _res: Response, next: NextFunction): void {
  next();
}