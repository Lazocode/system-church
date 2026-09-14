-- Rode este script inteiro no Supabase: Menu lateral > SQL Editor > New query > cole > Run

create table members (
  id text primary key,
  name text not null,
  phone text,
  email text,
  address text,
  birthdate text,
  ministry text,
  "joinedDate" text,
  notes text
);

create table finance_entries (
  id text primary key,
  type text not null,
  category text not null,
  amount numeric not null,
  date text not null,
  description text
);

-- Segurança: ativa o RLS (Row Level Security) e libera acesso de leitura/escrita.
-- Isso mantém o mesmo nível de proteção que já tínhamos (acesso por código no
-- app), sem exigir login individual no banco. Se um dia quiser reforçar isso
-- com autenticação de verdade no Supabase, essas políticas podem ser
-- reescritas para exigir usuário autenticado.
alter table members enable row level security;
alter table finance_entries enable row level security;

create policy "Permitir tudo - members" on members for all using (true) with check (true);
create policy "Permitir tudo - finance_entries" on finance_entries for all using (true) with check (true);
