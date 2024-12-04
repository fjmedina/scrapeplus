import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notification';
import { verifySalesforceSignature } from '../utils/signature';

export async function salesforceWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-sfdc-signature'] as string;
    if (!verifySalesforceSignature(signature, req.body)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Store webhook event
    await supabase.from('crm_webhook_events').insert({
      provider: 'salesforce',
      event_type: event.type,
      data: event
    });

    // Notify users
    const { data: integrations } = await supabase
      .from('crm_integrations')
      .select('user_id')
      .eq('provider', 'salesforce');

    if (integrations) {
      for (const integration of integrations) {
        await notificationService.create({
          userId: integration.user_id,
          type: 'crm_update',
          title: 'Salesforce Update',
          message: `New ${event.type} event received`,
          data: event
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Salesforce webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}