import express from 'express';
import type { Express } from 'express';
import { ErrorHandler } from './interface/middlewares/errorHandler.js';
import { FakeAuth } from './interface/middlewares/fakeAuth.js';
import { authRouter } from './interface/routes/authRoutes.js';
import { userRouter } from './interface/routes/userRoutes.js';
import { householdRouter } from './interface/routes/householdRoutes.js';
import { expenseRouter } from './interface/routes/expenseRoutes.js';
import { settlementRouter } from './interface/routes/settlementRoutes.js';

const app: Express = express();

app.use(express.json());

app.use('/v1', authRouter);
app.use('/v1', FakeAuth);
app.use('/v1', userRouter);
app.use('/v1', householdRouter);
app.use('/v1', expenseRouter);
app.use('/v1', settlementRouter);

app.use(ErrorHandler);

export default app;
