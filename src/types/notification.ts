export type NotificationType = 
  | 'analysis_complete'
  | 'report_ready'
  | 'subscription_expiring'
  | 'usage_limit'
  | 'system_alert'
  | 'crm_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}