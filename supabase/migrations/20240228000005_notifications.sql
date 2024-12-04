-- Create notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null check (
    type in (
      'analysis_complete',
      'report_ready',
      'subscription_expiring',
      'usage_limit',
      'system_alert'
    )
  ),
  title text not null,
  message text not null,
  data jsonb,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index notifications_user_id_idx on notifications(user_id);
create index notifications_created_at_idx on notifications(created_at);
create index notifications_read_idx on notifications(read);

-- Enable RLS
alter table notifications enable row level security;

-- Create policies
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on notifications for delete
  using (auth.uid() = user_id);

-- Function to clean up old notifications (keep last 100)
create function cleanup_old_notifications()
returns trigger as $$
begin
  delete from notifications
  where user_id = NEW.user_id
    and id not in (
      select id
      from notifications
      where user_id = NEW.user_id
      order by created_at desc
      limit 100
    );
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for cleanup
create trigger cleanup_old_notifications_trigger
  after insert on notifications
  for each row
  execute function cleanup_old_notifications();