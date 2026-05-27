-- Esquema recomendado para cargar dataset curado en Supabase/Postgres.
-- Diseñado para lectura analítica y señales explicables (no acusatorias).

create extension if not exists pgcrypto;

create table if not exists public.sercop_sanctions (
  id uuid primary key default gen_random_uuid(),
  year int,
  ruc text,
  razon_social text,
  fecha_emision date,
  estado text,
  tipo_sancion text,
  plazo_dias int,
  motivo_corto text,
  pdf_url text,
  source_url text,
  raw text
);

create table if not exists public.ocds_contracts (
  ocid text primary key,
  id bigint,
  year_query int,
  query_type text,
  search_term text,
  supplier_ruc text,
  year int,
  month int,
  method text,
  internal_type text,
  locality text,
  region text,
  suppliers text,
  buyer text,
  amount numeric(18,2),
  budget numeric(18,2),
  contract_date date,
  title text,
  description text
);

create table if not exists public.supplier_risk_features (
  supplier_ruc text primary key,
  sanciones_total int not null default 0,
  motivos_distintos int not null default 0,
  contratos_total int not null default 0,
  compradores_unicos int not null default 0,
  monto_total numeric(18,2) not null default 0,
  ultima_sancion date,
  ultimo_contrato date,
  risk_signal_score numeric(6,2) not null default 0,
  risk_band text not null
);

create table if not exists public.ecu911_monthly_agg (
  year_month text not null,
  provincia text not null,
  servicio text not null,
  subtipo text not null,
  total_eventos bigint not null,
  primary key (year_month, provincia, servicio, subtipo)
);

create table if not exists public.inec_dataset_agg (
  dataset_key text primary key,
  year int,
  source_key text,
  page_url text,
  download_url text,
  member_name text,
  total_cells bigint not null default 0,
  rows_distintos bigint not null default 0,
  cols_distintas bigint not null default 0,
  cells_numericas bigint not null default 0,
  cells_texto bigint not null default 0
);

create table if not exists public.inec_column_profile (
  dataset_key text not null,
  year int,
  col_idx int not null,
  cells_total bigint not null default 0,
  rows_distintos bigint not null default 0,
  numeric_ratio numeric(10,6) not null default 0,
  unique_values_capped bigint not null default 0,
  top_values_json jsonb,
  primary key (dataset_key, col_idx)
);

create table if not exists public.inec_records_sample (
  dataset_key text not null,
  year int,
  row_idx bigint not null,
  col_1 text,
  col_2 text,
  col_3 text,
  col_4 text,
  col_5 text,
  col_6 text,
  col_7 text,
  col_8 text,
  col_9 text,
  col_10 text,
  primary key (dataset_key, row_idx)
);

create index if not exists idx_sercop_ruc on public.sercop_sanctions (ruc);
create index if not exists idx_sercop_fecha on public.sercop_sanctions (fecha_emision);
create index if not exists idx_ocds_supplier_ruc on public.ocds_contracts (supplier_ruc);
create index if not exists idx_ocds_date on public.ocds_contracts (contract_date);
create index if not exists idx_ocds_buyer on public.ocds_contracts (buyer);
create index if not exists idx_features_score on public.supplier_risk_features (risk_signal_score desc);
create index if not exists idx_ecu911_prov_ym on public.ecu911_monthly_agg (provincia, year_month);
create index if not exists idx_inec_year on public.inec_dataset_agg (year);
create index if not exists idx_inec_total_cells on public.inec_dataset_agg (total_cells desc);
create index if not exists idx_inec_col_profile_year on public.inec_column_profile (year, col_idx);
create index if not exists idx_inec_sample_year on public.inec_records_sample (year);

-- RLS mínimo para exposición segura por API.
alter table public.sercop_sanctions enable row level security;
alter table public.ocds_contracts enable row level security;
alter table public.supplier_risk_features enable row level security;
alter table public.ecu911_monthly_agg enable row level security;
alter table public.inec_dataset_agg enable row level security;
alter table public.inec_column_profile enable row level security;
alter table public.inec_records_sample enable row level security;

drop policy if exists "read sercop sanctions" on public.sercop_sanctions;
create policy "read sercop sanctions"
on public.sercop_sanctions
for select
to anon, authenticated
using (true);

drop policy if exists "read ocds contracts" on public.ocds_contracts;
create policy "read ocds contracts"
on public.ocds_contracts
for select
to anon, authenticated
using (true);

drop policy if exists "read supplier features" on public.supplier_risk_features;
create policy "read supplier features"
on public.supplier_risk_features
for select
to anon, authenticated
using (true);

drop policy if exists "read ecu911 agg" on public.ecu911_monthly_agg;
create policy "read ecu911 agg"
on public.ecu911_monthly_agg
for select
to anon, authenticated
using (true);

drop policy if exists "read inec agg" on public.inec_dataset_agg;
create policy "read inec agg"
on public.inec_dataset_agg
for select
to anon, authenticated
using (true);

drop policy if exists "read inec column profile" on public.inec_column_profile;
create policy "read inec column profile"
on public.inec_column_profile
for select
to anon, authenticated
using (true);

drop policy if exists "read inec records sample" on public.inec_records_sample;
create policy "read inec records sample"
on public.inec_records_sample
for select
to anon, authenticated
using (true);
