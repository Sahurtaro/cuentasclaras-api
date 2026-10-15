import { Router } from 'express';
import { createSettlement, listSettlements } from '../mocks/controllers/settlementController.js';

export const settlementRouter: Router = Router();

settlementRouter.post('/households/:householdId/settlements', createSettlement);
settlementRouter.get('/households/:householdId/settlements', listSettlements);