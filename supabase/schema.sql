-- ==========================================================
-- Schema do CasaCerta QR no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/pxdsrlrxfsomfztrfucz/sql
-- ==========================================================

create table if not exists public.links (
  slug text primary key,
  name text not null,
  phone text not null,
  message text default '',
  clicks integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.links enable row level security;

-- Política de acesso permissiva para a chave anon (o painel Nuxt já tem senha própria)
drop policy if exists "Permitir tudo para anon" on public.links;
create policy "Permitir tudo para anon" on public.links
  for all
  to anon, authenticated
  using (true)
  with check (true);
