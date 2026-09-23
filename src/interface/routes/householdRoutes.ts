import { Router } from 'express';
import { getBalance } from '../mocks/controllers/balanceController.js';
import {
  createHousehold,
  getHousehold,
  joinHousehold,
  listHouseholds,
} from '../mocks/controllers/householdController.js';

export const householdRouter: Router = Router();

householdRouter.post('/households', createHousehold);
householdRouter.post('/households/join', joinHousehold);
householdRouter.get('/households', listHouseholds);
householdRouter.get('/households/:householdId/balance', getBalance);
householdRouter.get('/households/:id', getHousehold);