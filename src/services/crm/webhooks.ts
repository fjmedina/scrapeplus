import express from 'express';
import { supabase } from '../../lib/supabase';
import type { CRMWebhookEvent } from '../../types/crm';

const router = express.Router();

router.post('/webhooks/salesforce', async (req, res) => {
  try {
    const event = req.body as CRMWebhookEvent;
    
    // Verify Salesforce signature
    const signature = req.headers['x-sfdc-signature'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Process the event
    await processWebhookEvent(event);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Salesforce webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/webhooks/hubspot', async (req, res) => {
  try {
    const event = req.body as CRMWebhookEvent;
    
    // Verify HubSpot signature
    const signature = req.headers['x-hubspot-signature-v3'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Process the event
    await processWebhookEvent(event);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('HubSpot webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function processWebhookEvent(event: CRMWebhookEvent): Promise<void> {
  // Store the event in Supabase for processing
  await supabase.from('crm_webhook_events').insert({
    provider: event.source,
    event_type: event.type,
    data: event.data
  });

  // Notify relevant users
  const { data: integrations } = await supabase
    .from('crm_integrations')
    .select('user_id')
    .eq('provider', event.source);

  if (integrations) {
    for (const integration of integrations) {
      await supabase.from('notifications').insert({
        user_id: integration.user_id,
        type: 'crm_update',
        title: 'CRM Update',
        message: `New ${event.type} event from ${event.source}`,
        data: event
      });
    }
  }
}

export { router as webhookRouter };