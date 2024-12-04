-- Create crm_webhook_events table
create table crm_webhook_events (
  id uuid default uuid_generate_v4() primary key,
  provider text not null check (provider in ('salesforce', 'hubspot')),
  event_type text not null,
  data jsonb not null,
  processed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index crm_webhook_events_provider_idx on crm_webhook_events(provider);
create index crm_webhook_events_processed_idx on crm_webhook_events(processed);
create index crm_webhook_events_created_at_idx on crm_webhook_events(created_at);

-- Enable RLS
alter table crm_webhook_events enable row level security;

-- Create policies
create policy "Service role can manage webhook events"
  on crm_webhook_events
  using (auth.role() = 'service_role');

-- Function to clean up old events
create function cleanup_old_webhook_events()
returns trigger as $$
begin
  delete from crm_webhook_events
  where processed = true
    and created_at < now() - interval '30 days';
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for cleanup
create trigger cleanup_old_webhook_events_trigger
  after insert on crm_webhook_events
  for each row
  execute function cleanup_old_webhook_events();