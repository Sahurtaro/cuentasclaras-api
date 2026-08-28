import express from 'express';
import type { Express } from 'express';
import { ErrorHandler } from './interface/middlewares/errorHandler.js';

const app: Express = express();

app.use(express.json());

//RUTAS

//ERROR HANDLER
app.use(ErrorHandler);
console.log('La app funciona');

export default app;
