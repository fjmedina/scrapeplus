import express from 'express';
import { salesforceWebhook } from './salesforce';
import { hubspotWebhook } from './hubspot';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/salesforce', authMiddleware, salesforceWebhook);
router.post('/hubspot', authMiddleware, hubspotWebhook);

export { router as webhookRouter };