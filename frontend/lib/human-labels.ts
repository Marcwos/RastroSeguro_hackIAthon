/** Etiquetas en espanol claro para audiencia no tecnica. */

const ENTITY_TYPE_LABELS: Record<string, string> = {
  proveedor: 'Proveedor',
  id_proveedor: 'Proveedor',
  beneficiario: 'Beneficiario',
  ciudad: 'Ciudad',
  asegurado: 'Asegurado',
  id_asegurado: 'Asegurado',
  vehiculo: 'Vehiculo',
  id_vehiculo: 'Vehiculo',
  ramo: 'Ramo',
  cobertura: 'Cobertura',
  claim: 'Siniestro',
  siniestro: 'Siniestro',
}

const COMPONENT_KEY_LABELS: Record<string, string> = {
  reglas: 'Reglas de negocio',
  modelo: 'Patrones historicos',
  anomalia: 'Comportamiento inusual',
  nlp: 'Narrativa del relato',
  grafo: 'Relaciones',
  categorico: 'Contexto del caso',
  score_reglas: 'Reglas de negocio',
  score_modelo: 'Patrones historicos',
  score_anomalia: 'Comportamiento inusual',
  score_nlp: 'Narrativa del relato',
  score_grafo: 'Relaciones',
  score_categorico: 'Contexto del caso',
}

export function humanizeEntityType(type?: string | null): string {
  if (!type) return 'Elemento'
  const key = type.trim().toLowerCase()
  return ENTITY_TYPE_LABELS[key] ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
}

export function humanizeComponentKey(key?: string | null): string {
  if (!key) return 'Senal'
  const normalized = key.trim().toLowerCase().replace(/^score_/, '')
  return COMPONENT_KEY_LABELS[normalized] ?? COMPONENT_KEY_LABELS[key.trim().toLowerCase()] ?? key
}

export function formatRecurrenceLabel(entity: { type?: string; value?: string; field?: string }): string {
  const typeLabel = humanizeEntityType(entity.type || entity.field)
  const value = String(entity.value || '').trim()
  return value ? `${typeLabel}: ${value}` : typeLabel
}

export const UI_COPY = {
  scoreObjective: 'Puntaje del caso',
  scoreBreakdown: 'Desglose del puntaje',
  mainSignals: 'Senales que mas destacan',
  topRecurrence: 'Elementos que mas se repiten',
  topRecurrenceSubtitle: 'Ranking general: posicion en la cartera y veces que aparece',
  recurrenceCount: 'Veces en otros siniestros',
  vsAverage: 'respecto al promedio',
  comparePortfolio: 'Comparacion con la cartera',
  caseConnections: 'Conexiones del caso',
  relatedGroups: 'Grupos relacionados',
  repeatingElements: 'Elementos que se repiten',
  topThreeSignals: 'Tres senales principales',
  askAssistant: 'Preguntar al asistente',
  caseSummary: 'Resumen del caso',
  resultAndReasons: 'Resultado y motivos',
  alertReview: 'Revision de alertas',
  dataFile: 'Archivo de datos',
  portfolio: 'Cartera de siniestros',
  riskEvaluation: 'Evaluacion de riesgo',
  whatInfluenced: 'Que influyo',
  weight: 'Peso',
  contribution: 'Aporte al puntaje',
  mainPortfolioCases: 'Principales casos de la cartera',
  assistantSynthesis: 'Sintesis del asistente',
} as const
