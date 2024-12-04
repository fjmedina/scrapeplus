-- Create crm_integrations table
create table crm_integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  provider text not null check (provider in ('salesforce', 'hubspot')),
  config jsonb not null,
  last_sync timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, provider)
);

-- Create indexes
create index crm_integrations_user_id_idx on crm_integrations(user_id);
create index crm_integrations_provider_idx on crm_integrations(provider);

-- Enable RLS
alter table crm_integrations enable row level security;

-- Create policies
create policy "Users can manage their own integrations"
  on crm_integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create function to update timestamp
create function update_crm_integration_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for timestamp
create trigger update_crm_integration_timestamp
  before update on crm_integrations
  for each row
  execute function update_crm_integration_timestamp();