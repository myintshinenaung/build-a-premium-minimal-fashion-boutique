-- Notification Center MVP

create table if not exists public.notification_templates (
  id text primary key,
  name text not null,
  category text not null,
  notification_type text not null,
  subject_template text not null,
  body_template text not null,
  channels text[] not null default array['in_app']::text[],
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_templates drop constraint if exists notification_templates_category_check;
alter table public.notification_templates
  add constraint notification_templates_category_check
  check (category in ('order', 'inventory', 'marketing', 'security', 'review'));

alter table public.notification_templates drop constraint if exists notification_templates_type_check;
alter table public.notification_templates
  add constraint notification_templates_type_check
  check (
    notification_type in (
      'order_created',
      'order_paid',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'inventory_low_stock',
      'inventory_out_of_stock',
      'coupon_expiring',
      'new_review',
      'security_alert',
      'login_alert'
    )
  );

create table if not exists public.notifications (
  id text primary key,
  recipient_type text not null,
  recipient_id text not null,
  recipient_email text,
  notification_type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  channel text not null default 'in_app',
  status text not null default 'unread',
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications drop constraint if exists notifications_recipient_type_check;
alter table public.notifications
  add constraint notifications_recipient_type_check
  check (recipient_type in ('admin', 'customer'));

alter table public.notifications drop constraint if exists notifications_status_check;
alter table public.notifications
  add constraint notifications_status_check
  check (status in ('unread', 'read', 'archived'));

alter table public.notifications drop constraint if exists notifications_channel_check;
alter table public.notifications
  add constraint notifications_channel_check
  check (channel in ('in_app', 'email', 'webhook', 'push'));

create table if not exists public.notification_delivery_logs (
  id text primary key,
  notification_id text references public.notifications(id) on delete set null,
  template_id text references public.notification_templates(id) on delete set null,
  channel text not null,
  status text not null,
  recipient text not null,
  payload jsonb not null default '{}'::jsonb,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notification_delivery_logs drop constraint if exists notification_delivery_logs_status_check;
alter table public.notification_delivery_logs
  add constraint notification_delivery_logs_status_check
  check (status in ('pending', 'sent', 'failed'));

create index if not exists notifications_recipient_idx on public.notifications(recipient_type, recipient_id, created_at desc);
create index if not exists notifications_status_idx on public.notifications(status);
create index if not exists notifications_type_idx on public.notifications(notification_type);
create index if not exists notification_delivery_logs_status_idx on public.notification_delivery_logs(status, created_at desc);
create index if not exists notification_delivery_logs_channel_idx on public.notification_delivery_logs(channel);

insert into public.notification_templates (id, name, category, notification_type, subject_template, body_template, channels)
values
  ('TPL-ORDER-CREATED', 'Order Created', 'order', 'order_created', 'Order {{orderNumber}} received', 'Your order {{orderNumber}} has been created.', array['in_app', 'email']),
  ('TPL-ORDER-PAID', 'Order Paid', 'order', 'order_paid', 'Payment confirmed for {{orderNumber}}', 'Payment for order {{orderNumber}} was successful.', array['in_app', 'email']),
  ('TPL-ORDER-SHIPPED', 'Order Shipped', 'order', 'order_shipped', 'Order {{orderNumber}} shipped', 'Your order {{orderNumber}} is on the way.', array['in_app', 'email']),
  ('TPL-ORDER-DELIVERED', 'Order Delivered', 'order', 'order_delivered', 'Order {{orderNumber}} delivered', 'Your order {{orderNumber}} has been delivered.', array['in_app', 'email']),
  ('TPL-ORDER-CANCELLED', 'Order Cancelled', 'order', 'order_cancelled', 'Order {{orderNumber}} cancelled', 'Your order {{orderNumber}} was cancelled.', array['in_app', 'email']),
  ('TPL-INV-LOW', 'Low Stock Alert', 'inventory', 'inventory_low_stock', 'Low stock: {{productName}}', '{{productName}} is below the low stock threshold ({{quantity}} remaining).', array['in_app', 'email']),
  ('TPL-INV-OUT', 'Out of Stock Alert', 'inventory', 'inventory_out_of_stock', 'Out of stock: {{productName}}', '{{productName}} is out of stock.', array['in_app', 'email']),
  ('TPL-COUPON-EXP', 'Coupon Expiring', 'marketing', 'coupon_expiring', 'Coupon {{couponCode}} expiring soon', 'Your coupon {{couponCode}} expires on {{expiresAt}}.', array['in_app', 'email']),
  ('TPL-REVIEW-NEW', 'New Review', 'review', 'new_review', 'New review on {{productName}}', 'A new {{rating}}-star review was submitted for {{productName}}.', array['in_app']),
  ('TPL-SEC-ALERT', 'Security Alert', 'security', 'security_alert', 'Security alert: {{title}}', '{{message}}', array['in_app', 'email']),
  ('TPL-LOGIN-ALERT', 'Login Alert', 'security', 'login_alert', 'New login detected', 'A login was detected from {{deviceLabel}} at {{timestamp}}.', array['in_app', 'email'])
on conflict (id) do nothing;

alter table public.notification_templates enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_delivery_logs enable row level security;

drop policy if exists "Authenticated manage notification_templates" on public.notification_templates;
create policy "Authenticated manage notification_templates"
  on public.notification_templates for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage notifications" on public.notifications;
create policy "Authenticated manage notifications"
  on public.notifications for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage notification_delivery_logs" on public.notification_delivery_logs;
create policy "Authenticated manage notification_delivery_logs"
  on public.notification_delivery_logs for all to authenticated using (true) with check (true);
