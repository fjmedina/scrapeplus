-- Create reports table
create table reports (
  id uuid primary key,
  user_id uuid references auth.users not null,
  name text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index reports_user_id_idx on reports(user_id);

-- Enable RLS
alter table reports enable row level security;

-- Create policies
create policy "Users can insert their own reports"
  on reports for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own reports"
  on reports for select
  using (auth.uid() = user_id);

-- Add function to clean up old reports (keep last 100)
create function cleanup_old_reports()
returns trigger as $$
begin
  delete from reports
  where user_id = NEW.user_id
    and id not in (
      select id
      from reports
      where user_id = NEW.user_id
      order by created_at desc
      limit 100
    );
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to clean up old reports
create trigger cleanup_old_reports_trigger
  after insert on reports
  for each row
  execute function cleanup_old_reports();