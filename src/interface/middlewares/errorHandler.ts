import { AppError } from '../../domain/errors/AppError.js';
import type { Request, Response, NextFunction } from 'express';

export function ErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  } else {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno en el servidor',
      },
    });
  }
}
