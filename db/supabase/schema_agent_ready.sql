-- Tablas para agente de preguntas/respuestas sobre siniestros.

create table if not exists public.siniestros_canonico (
  id_siniestro text primary key,
  id_poliza text not null,
  id_asegurado text not null,
  ramo text not null,
  cobertura text not null,
  fecha_ocurrencia date not null,
  fecha_reporte date not null,
  monto_reclamado numeric(18,2) not null,
  monto_estimado numeric(18,2) not null,
  monto_pagado numeric(18,2) not null,
  estado text not null,
  sucursal text not null,
  descripcion text,
  documentos_completos text not null,
  beneficiario text,
  dias_desde_inicio_poliza int,
  dias_desde_fin_poliza int,
  dias_entre_ocurrencia_reporte int,
  historial_siniestros_asegurado int,
  etiqueta_fraude_simulada int,
  supplier_ruc text,
  supplier_risk_signal_score numeric(10,2),
  supplier_risk_band text,
  score_final numeric(10,2) not null,
  nivel_riesgo text not null,
  alertas_activadas text,
  explicacion text,
  accion_sugerida text
);

create table if not exists public.proveedores_contexto (
  supplier_ruc text primary key,
  supplier_risk_signal_score numeric(10,2),
  supplier_risk_band text,
  sanciones_total int,
  contratos_total int,
  provincia_muestra text
);

create index if not exists idx_siniestros_fecha on public.siniestros_canonico (fecha_ocurrencia);
create index if not exists idx_siniestros_riesgo on public.siniestros_canonico (nivel_riesgo, score_final desc);
create index if not exists idx_siniestros_supplier on public.siniestros_canonico (supplier_ruc);

alter table public.siniestros_canonico enable row level security;
alter table public.proveedores_contexto enable row level security;

drop policy if exists "read siniestros canonico" on public.siniestros_canonico;
create policy "read siniestros canonico"
on public.siniestros_canonico
for select
to anon, authenticated
using (true);

drop policy if exists "read proveedores contexto" on public.proveedores_contexto;
create policy "read proveedores contexto"
on public.proveedores_contexto
for select
to anon, authenticated
using (true);
