import crypto from 'crypto';

export function verifySalesforceSignature(signature: string, payload: any): boolean {
  const secret = process.env.SALESFORCE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Salesforce webhook secret not configured');

  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

export function verifyHubSpotSignature(signature: string, payload: any): boolean {
  const secret = process.env.HUBSPOT_WEBHOOK_SECRET;
  if (!secret) throw new Error('HubSpot webhook secret not configured');

  const sourceString = `${secret}${JSON.stringify(payload)}`;
  const calculatedSignature = crypto
    .createHash('sha256')
    .update(sourceString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}