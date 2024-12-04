import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notification';
import { verifyHubSpotSignature } from '../utils/signature';

export async function hubspotWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-hubspot-signature-v3'] as string;
    if (!verifyHubSpotSignature(signature, req.body)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    // Store webhook event
    await supabase.from('crm_webhook_events').insert({
      provider: 'hubspot',
      event_type: event.type,
      data: event
    });

    // Notify users
    const { data: integrations } = await supabase
      .from('crm_integrations')
      .select('user_id')
      .eq('provider', 'hubspot');

    if (integrations) {
      for (const integration of integrations) {
        await notificationService.create({
          userId: integration.user_id,
          type: 'crm_update',
          title: 'HubSpot Update',
          message: `New ${event.type} event received`,
          data: event
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('HubSpot webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}