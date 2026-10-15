import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError.js';
import type { ZodSchema } from 'zod';
export function validate(schema: ZodSchema, message = 'Please provide a valid format') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(422, 'VALIDATION_ERROR', message, result.error.flatten());
    }
    req.body = result.data;
    next();
  };
}
