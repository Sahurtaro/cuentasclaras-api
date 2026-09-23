import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { users } from '../db.js';

interface RegisterBody {
  email: string;
  emailConfirm: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

export function createUser(req: Request, res: Response): void {
  const body = req.body as RegisterBody;
  const exists = users.some((user) => user.email === body.email);
  if (exists) {
    res.status(409).json({
      error: { code: 'USER_ALREADY_EXISTS', message: 'The user already exists in the system', details: {} },
    });
    return;
  }
  const user = { id: randomUUID(), email: body.email, name: body.name };
  users.push(user);
  res.setHeader('Location', `/v1/users/${user.id}`);
  res.status(201).json({ email: user.email, message: 'User created successfully' });
}

export function getProfile(req: Request, res: Response): void {
  const user = users.find((candidate) => candidate.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', details: {} } });
    return;
  }
  res.status(200).json({ id: user.id, email: user.email, name: user.name });
}