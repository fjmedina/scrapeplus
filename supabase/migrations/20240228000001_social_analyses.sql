-- Create social_analyses table
create table social_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  brand text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index social_analyses_user_id_idx on social_analyses(user_id);
create index social_analyses_brand_idx on social_analyses(brand);

-- Enable RLS
alter table social_analyses enable row level security;

-- Create policies
create policy "Users can insert their own analyses"
  on social_analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own analyses"
  on social_analyses for select
  using (auth.uid() = user_id);

-- Add function to clean up old analyses (keep last 30 days)
create function cleanup_old_social_analyses()
returns trigger as $$
begin
  delete from social_analyses
  where user_id = NEW.user_id
    and created_at < now() - interval '30 days'
    and id not in (
      select id
      from social_analyses
      where user_id = NEW.user_id
      order by created_at desc
      limit 100
    );
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to clean up old analyses
create trigger cleanup_old_social_analyses_trigger
  after insert on social_analyses
  for each row
  execute function cleanup_old_social_analyses();