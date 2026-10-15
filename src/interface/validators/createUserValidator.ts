import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.string().email(),
    emailConfirm: z.string().email(),
    password: z.string().min(8),
    passwordConfirm: z.string(),
    name: z.string().min(1),
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: 'Emails do not match',
    path: ['emailConfirm'],
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type CreateUserBody = z.infer<typeof createUserSchema>;
