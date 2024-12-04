-- Create website_analyses table
create table website_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  metrics jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index website_analyses_user_id_idx on website_analyses(user_id);
create index website_analyses_url_idx on website_analyses(url);

-- Enable RLS
alter table website_analyses enable row level security;

-- Create policies
create policy "Users can insert their own analyses"
  on website_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own analyses"
  on website_analyses for select
  using (auth.uid() = user_id);

-- Add function to clean up old analyses (keep last 30 days)
create function cleanup_old_analyses()
returns trigger as $$
begin
  delete from website_analyses
  where user_id = NEW.user_id
    and created_at < now() - interval '30 days'
    and id not in (
      select id
      from website_analyses
      where user_id = NEW.user_id
      order by created_at desc
      limit 100
    );
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to clean up old analyses
create trigger cleanup_old_analyses_trigger
  after insert on website_analyses
  for each row
  execute function cleanup_old_analyses();