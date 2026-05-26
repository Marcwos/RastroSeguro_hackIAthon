# RastroSeguro — Reto hackIAthon 2026

Documento de arranque del equipo para el reto **Detector de posibles fraudes en siniestros** patrocinado por **Aseguradora del Sur**.

---

## Contexto

El sector asegurador necesita identificar a tiempo patrones irregulares en siniestros reportados. La revisión manual depende de la experiencia del analista, reglas dispersas y cruces de información que consumen tiempo.

El hackIAthon propone construir un **prototipo funcional con IA** que analice siniestros, genere un **score de riesgo** y entregue **alertas explicables** para apoyar la revisión humana.

> **Principio clave:** la solución genera alertas de revisión, no acusaciones automáticas de fraude.

---

## Nuestra propuesta: RastroSeguro

**RastroSeguro** es una plataforma de inteligencia artificial explicable para priorizar siniestros con señales de posible fraude en seguros vehiculares.

Actúa como copiloto del analista antifraude: cruza datos, detecta señales anómalas y explica por qué un siniestro requiere revisión prioritaria.

### Qué debe hacer el prototipo

| Capacidad | Descripción |
|---|---|
| Score de riesgo | Puntaje de 0 a 100 por siniestro |
| Semáforo | Clasificación verde / amarillo / rojo |
| Alertas explicables | Motivos auditables de cada alerta |
| Priorización | Bandeja de casos ordenados por riesgo |
| IA híbrida | Reglas + ML + NLP + agente consultivo |
| Demo funcional | Dashboard o interfaz ejecutable en vivo |

### Qué no debe hacer

- Acusar formalmente de fraude.
- Rechazar automáticamente un siniestro.
- Sustituir el análisis humano.
- Usar datos personales reales o confidenciales.

---

## Alcance del reto (resumen)

### Datos

Trabajaremos con **datos sintéticos o públicos**. Entidades mínimas:

- Siniestros, pólizas, asegurados
- Vehículos (placa, chasis, motor, marca, modelo, año)
- Beneficiarios / proveedores
- Documentos asociados al reclamo

### Señales de riesgo (ejemplos)

- Reclamo cerca del inicio o fin de vigencia de la póliza
- Alta frecuencia de reclamos por asegurado o vehículo
- Montos atípicos respecto al ramo
- Documentos incompletos o inconsistentes
- Proveedores recurrentes en casos observados
- Narrativas similares entre reclamos
- Reporte tardío del evento

### Score sugerido por el reto

| Rango | Nivel | Acción sugerida |
|---:|---|---|
| 0 – 40 | Verde / Bajo | Flujo normal |
| 41 – 75 | Amarillo / Medio | Revisión documental antifraude |
| 76 – 100 | Rojo / Alto | Revisión especializada de campo |

---

## Entregables obligatorios

1. Prototipo funcional (app, dashboard o notebook)
2. Código fuente en GitHub
3. Dataset sintético o público documentado
4. README con instalación y demo
5. Arquitectura y modelo de datos
6. Explicación del modelo de IA y reglas de alertas
7. Presentación ejecutiva y demo en vivo

---

## Criterios de evaluación (pesos)

| Criterio | Peso |
|---|--:|
| Uso de IA y prototipo | 40% |
| Explicabilidad y ética | 25% |
| Análisis del caso y lógica | 15% |
| Tecnología y arquitectura | 10% |
| Pitch, impacto y negocio | 10% |

---

## Documentación del repositorio

| Documento | Contenido |
|---|---|
| [reto-inicial.md](./reto-inicial.md) | Este resumen de arranque |
| [reto-aseguradora-del-sur.md](./reto-aseguradora-del-sur.md) | Documento completo del reto (alcance, reglas, rúbrica) |
| [planteamiento-tecnico-rastoseguro.md](./planteamiento-tecnico-rastoseguro.md) | Arquitectura, stack y plan de implementación del equipo |

---

## Próximos pasos del equipo

1. Revisar el documento completo del reto y validar alcance MVP vs. deseable.
2. Acordar división de trabajo entre los tres integrantes.
3. Generar dataset sintético realista alineado al modelo de datos del reto.
4. Implementar pipeline: ingesta → features → reglas → ML → score → dashboard.
5. Integrar agente de IA con herramientas sobre datos procesados.
6. Preparar demo en vivo y pitch (10 min + Q&A).

---

## Referencia rápida para el pitch

| Tiempo | Contenido |
|---|---|
| 1 min | Problema y oportunidad |
| 1 min | Solución propuesta |
| 4 min | Demo funcional |
| 2 min | Arquitectura y uso de IA |
| 1 min | Impacto de negocio |
| 1 min | Limitaciones y próximos pasos |
