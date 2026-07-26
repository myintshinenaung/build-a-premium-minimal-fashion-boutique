-- Security & Access Control MVP

create table if not exists public.admin_user_roles (
  user_id text primary key,
  email text not null,
  role text not null,
  assigned_by text,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_user_roles drop constraint if exists admin_user_roles_role_check;
alter table public.admin_user_roles
  add constraint admin_user_roles_role_check
  check (role in ('super_admin', 'admin', 'manager', 'staff', 'customer'));

create table if not exists public.admin_role_permissions (
  role text not null,
  permission text not null,
  allowed boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (role, permission)
);

create table if not exists public.admin_audit_logs (
  id text primary key,
  user_id text,
  user_name text not null,
  user_email text,
  action text not null,
  resource text not null,
  resource_id text,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  id text primary key,
  user_id text not null,
  user_email text not null,
  session_token text not null,
  device_label text not null,
  ip_address text,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_login_history (
  id text primary key,
  user_id text,
  user_email text not null,
  success boolean not null,
  ip_address text,
  user_agent text,
  device_label text,
  failure_reason text,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_user_id_idx on public.admin_audit_logs(user_id);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs(action);
create index if not exists admin_sessions_user_id_idx on public.admin_sessions(user_id);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions(expires_at);
create index if not exists admin_login_history_user_id_idx on public.admin_login_history(user_id);
create index if not exists admin_login_history_created_at_idx on public.admin_login_history(created_at desc);

-- Default permission matrix
insert into public.admin_role_permissions (role, permission, allowed)
values
  ('super_admin', 'products:read', true),
  ('super_admin', 'products:write', true),
  ('super_admin', 'products:delete', true),
  ('super_admin', 'orders:read', true),
  ('super_admin', 'orders:write', true),
  ('super_admin', 'orders:delete', true),
  ('super_admin', 'orders:approve', true),
  ('super_admin', 'customers:read', true),
  ('super_admin', 'customers:write', true),
  ('super_admin', 'customers:delete', true),
  ('super_admin', 'inventory:read', true),
  ('super_admin', 'inventory:write', true),
  ('super_admin', 'inventory:delete', true),
  ('super_admin', 'coupons:read', true),
  ('super_admin', 'coupons:write', true),
  ('super_admin', 'coupons:delete', true),
  ('super_admin', 'analytics:read', true),
  ('super_admin', 'marketing:read', true),
  ('super_admin', 'marketing:write', true),
  ('super_admin', 'marketing:delete', true),
  ('super_admin', 'settings:read', true),
  ('super_admin', 'settings:write', true),
  ('super_admin', 'users:read', true),
  ('super_admin', 'users:write', true),
  ('super_admin', 'users:delete', true),
  ('super_admin', 'reviews:read', true),
  ('super_admin', 'reviews:write', true),
  ('super_admin', 'reviews:delete', true),
  ('super_admin', 'reviews:approve', true),
  ('super_admin', 'reports:read', true),

  ('admin', 'products:read', true),
  ('admin', 'products:write', true),
  ('admin', 'products:delete', true),
  ('admin', 'orders:read', true),
  ('admin', 'orders:write', true),
  ('admin', 'orders:approve', true),
  ('admin', 'customers:read', true),
  ('admin', 'customers:write', true),
  ('admin', 'inventory:read', true),
  ('admin', 'inventory:write', true),
  ('admin', 'coupons:read', true),
  ('admin', 'coupons:write', true),
  ('admin', 'analytics:read', true),
  ('admin', 'marketing:read', true),
  ('admin', 'marketing:write', true),
  ('admin', 'settings:read', true),
  ('admin', 'settings:write', true),
  ('admin', 'users:read', true),
  ('admin', 'reviews:read', true),
  ('admin', 'reviews:write', true),
  ('admin', 'reviews:approve', true),
  ('admin', 'reports:read', true),

  ('manager', 'products:read', true),
  ('manager', 'products:write', true),
  ('manager', 'orders:read', true),
  ('manager', 'orders:write', true),
  ('manager', 'customers:read', true),
  ('manager', 'inventory:read', true),
  ('manager', 'inventory:write', true),
  ('manager', 'coupons:read', true),
  ('manager', 'analytics:read', true),
  ('manager', 'marketing:read', true),
  ('manager', 'marketing:write', true),
  ('manager', 'reviews:read', true),
  ('manager', 'reviews:write', true),
  ('manager', 'reports:read', true),

  ('staff', 'products:read', true),
  ('staff', 'orders:read', true),
  ('staff', 'customers:read', true),
  ('staff', 'inventory:read', true),
  ('staff', 'reviews:read', true)
on conflict (role, permission) do nothing;

alter table public.admin_user_roles enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_login_history enable row level security;

drop policy if exists "Authenticated manage admin_user_roles" on public.admin_user_roles;
create policy "Authenticated manage admin_user_roles"
  on public.admin_user_roles for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage admin_role_permissions" on public.admin_role_permissions;
create policy "Authenticated manage admin_role_permissions"
  on public.admin_role_permissions for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage admin_audit_logs" on public.admin_audit_logs;
create policy "Authenticated manage admin_audit_logs"
  on public.admin_audit_logs for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage admin_sessions" on public.admin_sessions;
create policy "Authenticated manage admin_sessions"
  on public.admin_sessions for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated manage admin_login_history" on public.admin_login_history;
create policy "Authenticated manage admin_login_history"
  on public.admin_login_history for all to authenticated using (true) with check (true);
