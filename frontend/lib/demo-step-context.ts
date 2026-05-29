export interface StepContext {
  step: number
  title: string
  subtitle: string
  /** Qué muestra esta pantalla (1–2 frases). */
  overview: string
  /** Puntos clave que el usuario debe revisar. */
  focusPoints: string[]
  hints: string[]
}

export const STEP_CONTEXT: Record<number, StepContext> = {
  0: {
    step: 0,
    title: 'Centro de control',
    subtitle: 'Indicadores del portafolio y selección de casos.',
    overview: 'Vista general del portafolio: distribución de riesgo, proveedores, ciudades y casos prioritarios. Desde aquí eliges qué siniestro revisar en detalle.',
    focusPoints: [
      'Totales de casos verdes, amarillos y rojos',
      'Top proveedores y ciudades con alertas',
      'Selección del caso foco para el flujo analista',
    ],
    hints: [
      '¿Cuáles son los casos con mayor prioridad?',
      '¿Qué proveedores concentran más alertas?',
      'Genera un resumen general del portafolio.',
    ],
  },
  1: {
    step: 1,
    title: 'Carga de datos',
    subtitle: 'Ingesta y validación del dataset de siniestros.',
    overview: 'Subes o sincronizas el CSV de siniestros. El sistema valida columnas, normaliza identificadores y prepara el scoring para todo el portafolio.',
    focusPoints: [
      'Archivo cargado y filas reconocidas',
      'Campos obligatorios para reglas y modelos',
      'Confirmación de que el dataset quedó activo',
    ],
    hints: [
      '¿Qué valida el sistema al subir el CSV?',
      '¿Cuántos siniestros hay en el dataset activo?',
      '¿Qué campos son obligatorios para el scoring?',
    ],
  },
  2: {
    step: 2,
    title: 'Resumen técnico',
    subtitle: 'Ficha del caso: documentos, narrativa y contexto.',
    overview: 'Revisión de la ficha del caso antes del puntaje: narrativa, estado documental, ubicación, montos y cobertura. Aquí validas que la información base sea coherente.',
    focusPoints: [
      'Narrativa y descripción del evento',
      'Documentos completos, pendientes o inconsistentes',
      'Ramo, cobertura, monto y contexto geográfico',
    ],
    hints: [
      '¿Qué documentos faltan en este caso?',
      'Resume la narrativa del siniestro seleccionado.',
      '¿Qué datos geográficos tiene este caso?',
    ],
  },
  3: {
    step: 3,
    title: 'Riesgo explicable',
    subtitle: 'Puntaje, reglas activadas y recomendación.',
    overview: 'El score final (0–100) combina reglas, modelo, anomalías, narrativa, relaciones y señales categóricas. Ves el desglose, las alertas activadas y la acción sugerida — sin decisión automática.',
    focusPoints: [
      'Puntaje final y semáforo de riesgo',
      'Waterfall de componentes ponderados',
      'Top alertas y trazabilidad de reglas',
    ],
    hints: [
      '¿Por qué este caso tiene este puntaje?',
      '¿Qué reglas activó el sistema?',
      '¿Qué recomienda el sistema para este caso?',
    ],
  },
  4: {
    step: 4,
    title: 'Red de relaciones',
    subtitle: 'Grafo, entidades recurrentes y patrones.',
    overview: 'Exploración de la red del caso: conexiones con proveedores, beneficiarios, ciudades y otros siniestros. Los gráficos muestran recurrencias y concentraciones que pueden elevar el riesgo.',
    focusPoints: [
      'Red del caso y entidades compartidas',
      'Ranking de concentración por proveedor',
      'Patrón araña: caso vs promedio de cartera',
    ],
    hints: [
      '¿Qué entidades se repiten en este caso?',
      '¿Hay relatos parecidos o conexiones con otros casos?',
      '¿Qué proveedores concentran alertas en la red?',
    ],
  },
  5: {
    step: 5,
    title: 'Reporte y cierre',
    subtitle: 'Síntesis demo del caso y exportación ejecutiva.',
    overview: 'Cierre del recorrido: score objetivo desglosado, síntesis de etapas 1–4, gráficos explicados y contexto del portafolio. Puedes exportar un reporte .md para pitch o auditoría.',
    focusPoints: [
      'Score objetivo con contribución ponderada',
      'Recorrido por etapas y gráficos explicados',
      'Expediente completo y exportación del reporte',
    ],
    hints: [
      'Resume este caso para un ejecutivo.',
      'Genera un resumen ejecutivo del portafolio.',
      '¿Cuál es el impacto de negocio del top 10% de casos?',
    ],
  },
  6: {
    step: 6,
    title: 'Impacto ejecutivo',
    subtitle: 'Casos estrella y exposición priorizada.',
    overview: 'Vista para decisión: casos estrella de la demo, exposición del top 10% y mensaje de impacto de negocio. Enlaza el caso individual con el valor del sistema para la organización.',
    focusPoints: [
      'Casos prioritarios para revisión (estrella)',
      'Monto priorizado del top 10%',
      'Guardrail ético: priorización, no acusación',
    ],
    hints: [
      '¿Cuáles son los casos estrella para la demo?',
      '¿Cuál es la exposición del top 10% de casos?',
      'Muéstrame un caso rojo evidente.',
    ],
  },
}

export function getStepContext(step: number): StepContext {
  return STEP_CONTEXT[step] ?? STEP_CONTEXT[0]
}

function stepLabel(step: number): string {
  return step > 0 ? `Paso ${step}` : 'Inicio'
}

/** Guía explicativa uniforme para cada etapa (demo / chat lateral). */
export function getStepGuideMessage(step: number, claimId: string | null): string {
  const ctx = getStepContext(step)
  const lines = [
    `${stepLabel(step)}: ${ctx.title}`,
    '',
    ctx.overview,
    '',
    'Qué conviene revisar:',
    ...ctx.focusPoints.map((point) => `• ${point}`),
  ]

  if (claimId) {
    lines.push('', `Caso activo: ${claimId}. Pregúntame sobre esta etapa o sobre el caso.`)
  } else {
    lines.push('', 'Selecciona un caso en el panel o carga datos para profundizar.')
  }

  return lines.join('\n')
}

/** @deprecated Usar getStepGuideMessage */
export function getStepWelcomeMessage(step: number, claimId: string | null): string {
  return getStepGuideMessage(step, claimId)
}

export function getStepQuickQuestions(step: number, claimId: string | null): string[] {
  const ctx = getStepContext(step)
  const hints = [...ctx.hints]

  if (claimId) {
    if (step === 2) {
      hints.unshift(`Resume el caso ${claimId} en esta etapa.`)
    } else if (step === 3) {
      hints.unshift(`¿Por qué el caso ${claimId} tiene este puntaje?`)
    } else if (step === 4) {
      hints.unshift(`¿Qué relaciones tiene el caso ${claimId}?`)
    } else if (step === 5) {
      hints.unshift(`Genera el reporte del caso ${claimId}.`)
    } else if (step >= 1) {
      hints.unshift(`¿Qué debo revisar del caso ${claimId} aquí?`)
    }
  }

  return hints.slice(0, 5)
}
