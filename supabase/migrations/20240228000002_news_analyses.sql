-- Create news_analyses table
create table news_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  query text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index news_analyses_user_id_idx on news_analyses(user_id);
create index news_analyses_query_idx on news_analyses(query);

-- Enable RLS
alter table news_analyses enable row level security;

-- Create policies
create policy "Users can insert their own analyses"
  on news_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own analyses"
  on news_analyses for select
  using (auth.uid() = user_id);

-- Add function to clean up old analyses (keep last 30 days)
create function cleanup_old_news_analyses()
returns trigger as $$
begin
  delete from news_analyses
  where user_id = NEW.user_id
    and created_at < now() - interval '30 days'
    and id not in (
      select id
      from news_analyses
      where user_id = NEW.user_id
      order by created_at desc
      limit 100
    );
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to clean up old analyses
create trigger cleanup_old_news_analyses_trigger
  after insert on news_analyses
  for each row
  execute function cleanup_old_news_analyses();