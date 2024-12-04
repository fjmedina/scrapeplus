import { createClient } from '@supabase/supabase-js';
import { config } from '../config/api';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);