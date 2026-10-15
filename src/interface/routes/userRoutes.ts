import { Router } from 'express';
import { getProfile } from '../mocks/controllers/userController.js';

export const userRouter: Router = Router();

userRouter.get('/users/:id', getProfile);