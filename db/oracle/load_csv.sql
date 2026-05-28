-- Plantilla SQL*Loader / external table para CSV sintéticos
-- Ajustar DIRECTORY y rutas según entorno Oracle XE.

-- Ejemplo: cargar siniestros desde CSV
-- sqlldr userid=rastro/rastro@localhost:1521/XEPDB1 control=load_siniestros.ctl log=load_siniestros.log

/*
LOAD DATA
INFILE 'data/synthetic/siniestros.csv'
INTO TABLE siniestros
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
TRAILING NULLCOLS
(
  id_siniestro,
  id_poliza,
  id_asegurado,
  ramo,
  cobertura,
  ...
)
*/

-- Consulta de validación post-carga
SELECT nivel_riesgo, COUNT(*) AS total
FROM siniestros
GROUP BY nivel_riesgo
ORDER BY total DESC;
