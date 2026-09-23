import { Router } from 'express';
import { createUser } from '../mocks/controllers/userController.js';
import { login, refresh } from '../mocks/controllers/authController.js';

export const authRouter: Router = Router();

authRouter.post('/users', createUser);
authRouter.post('/auth/login', login);
authRouter.post('/auth/refresh', refresh);