-- Oracle DDL de referencia — RastroSeguro (hackIAthon Aseguradora del Sur)
-- Tablas core para siniestros sintéticos y entidades relacionadas.

CREATE TABLE siniestros (
  id_siniestro       VARCHAR2(32) PRIMARY KEY,
  id_poliza          VARCHAR2(32) NOT NULL,
  id_asegurado       VARCHAR2(32) NOT NULL,
  ramo               VARCHAR2(32),
  cobertura          VARCHAR2(64),
  ciudad             VARCHAR2(64),
  sucursal           VARCHAR2(64),
  id_proveedor       VARCHAR2(32),
  beneficiario       VARCHAR2(128),
  fecha_ocurrencia   DATE,
  fecha_reporte      DATE,
  monto_reclamado    NUMBER(18,2),
  monto_estimado     NUMBER(18,2),
  monto_pagado       NUMBER(18,2),
  suma_asegurada     NUMBER(18,2),
  estado             VARCHAR2(32),
  descripcion        CLOB,
  documentos_completos VARCHAR2(8),
  historial_siniestros_asegurado NUMBER(6),
  dias_desde_inicio_poliza NUMBER(6),
  dias_desde_fin_poliza NUMBER(6),
  dias_entre_ocurrencia_reporte NUMBER(6),
  placa_hash         VARCHAR2(32),
  chasis_hash        VARCHAR2(32),
  motor_hash         VARCHAR2(32),
  marca              VARCHAR2(64),
  modelo             VARCHAR2(64),
  anio               NUMBER(4),
  score_final        NUMBER(6,2),
  nivel_riesgo       VARCHAR2(16),
  etiqueta_fraude_simulada NUMBER(1)
);

CREATE TABLE polizas (
  id_poliza          VARCHAR2(32) PRIMARY KEY,
  id_asegurado       VARCHAR2(32) NOT NULL,
  ramo               VARCHAR2(32),
  fecha_inicio       DATE,
  fecha_fin          DATE,
  prima              NUMBER(18,2),
  suma_asegurada     NUMBER(18,2),
  deducible          NUMBER(18,2),
  canal_venta        VARCHAR2(64),
  ciudad             VARCHAR2(64),
  estado_poliza      VARCHAR2(32)
);

CREATE TABLE asegurados (
  id_asegurado       VARCHAR2(32) PRIMARY KEY,
  segmento           VARCHAR2(32),
  antiguedad         NUMBER(4),
  ciudad             VARCHAR2(64),
  num_polizas        NUMBER(4),
  reclamos_12m       NUMBER(4),
  mora_actual        CHAR(1),
  score_cliente_simulado NUMBER(4)
);

CREATE TABLE proveedores (
  id_proveedor       VARCHAR2(32) PRIMARY KEY,
  tipo               VARCHAR2(32),
  ciudad             VARCHAR2(64),
  reclamos_asociados NUMBER(8),
  monto_promedio_reclamado NUMBER(18,2),
  pct_casos_observados NUMBER(6,2),
  antiguedad         NUMBER(4)
);

CREATE TABLE documentos (
  id_documento       VARCHAR2(32) PRIMARY KEY,
  id_siniestro       VARCHAR2(32) NOT NULL,
  tipo_documento     VARCHAR2(64),
  entregado          CHAR(1),
  legible            CHAR(1),
  fecha_emision      DATE,
  inconsistencia_detectada CHAR(1),
  observacion        VARCHAR2(512),
  CONSTRAINT fk_doc_siniestro FOREIGN KEY (id_siniestro) REFERENCES siniestros(id_siniestro)
);

CREATE INDEX idx_siniestros_score ON siniestros (score_final DESC);
CREATE INDEX idx_siniestros_nivel ON siniestros (nivel_riesgo);
CREATE INDEX idx_siniestros_proveedor ON siniestros (id_proveedor);
CREATE INDEX idx_siniestros_asegurado ON siniestros (id_asegurado);

COMMENT ON TABLE siniestros IS 'Reclamos sintéticos con score de riesgo — alerta, no acusación';
