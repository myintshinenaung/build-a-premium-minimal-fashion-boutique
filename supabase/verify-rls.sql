-- Run in Supabase Dashboard → SQL Editor after applying the RLS migration.
-- Returns one combined result set (Supabase SQL Editor shows only the last query by default).

with admin_tables (table_name, expected_policies) as (
  values
    ('products', 2),
    ('categories', 2),
    ('banners', 1),
    ('settings', 1),
    ('orders', 1),
    ('customers', 1)
),
rls_status as (
  select
    c.relname as table_name,
    c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
),
policy_counts as (
  select
    tablename as table_name,
    count(*)::int as policy_count,
    string_agg(policyname, ', ' order by policyname) as policy_names
  from pg_policies
  where schemaname = 'public'
    and tablename in ('products', 'categories', 'banners', 'settings', 'orders', 'customers')
  group by tablename
),
checks as (
  select
    'rls_enabled'::text as check_group,
    t.table_name as check_name,
    'true'::text as expected,
    coalesce(r.rls_enabled, false)::text as actual,
    case when coalesce(r.rls_enabled, false) then 'PASS' else 'FAIL' end as result,
    'Row level security must be enabled'::text as notes
  from admin_tables t
  left join rls_status r using (table_name)

  union all

  select
    'policy_count'::text,
    t.table_name,
    t.expected_policies::text,
    coalesce(p.policy_count, 0)::text,
    case when coalesce(p.policy_count, 0) = t.expected_policies then 'PASS' else 'FAIL' end,
    coalesce(p.policy_names, 'No policies found')
  from admin_tables t
  left join policy_counts p using (table_name)

  union all

  select
    'policy_total'::text,
    'all_admin_tables'::text,
    '8'::text,
    (
      select count(*)::text
      from pg_policies
      where schemaname = 'public'
        and tablename in ('products', 'categories', 'banners', 'settings', 'orders', 'customers')
    ),
    case
      when (
        select count(*)
        from pg_policies
        where schemaname = 'public'
          and tablename in ('products', 'categories', 'banners', 'settings', 'orders', 'customers')
      ) = 8 then 'PASS'
      else 'FAIL'
    end,
    'Total policies across products, categories, banners, settings, orders, customers'::text
)
select
  check_group,
  check_name,
  expected,
  actual,
  result,
  notes
from checks
order by
  case check_group
    when 'rls_enabled' then 1
    when 'policy_count' then 2
    when 'policy_total' then 3
  end,
  check_name;
