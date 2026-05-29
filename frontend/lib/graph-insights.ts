import { ClaimSummary } from '@/lib/api'
import { ClaimGraphPayload } from '@/components/graph/graph-types'
import { COMPONENT_LABELS, ScoreComponentKey } from '@/lib/score-weights'

const SPIDER_AXES: { key: ScoreComponentKey; label: string }[] = [
  { key: 'score_reglas', label: 'Reglas' },
  { key: 'score_modelo', label: 'Modelo' },
  { key: 'score_anomalia', label: 'Anomalía' },
  { key: 'score_nlp', label: 'Narrativa' },
  { key: 'score_grafo', label: 'Relaciones' },
  { key: 'score_categorico', label: 'Categórico' },
]

const num = (v: unknown) => Number(v ?? 0)

export interface SpiderAxisData {
  dimension: string
  caseValue: number
  average: number
  diff: number
}

export function computeSpiderData(selectedClaim: ClaimSummary, claims: ClaimSummary[]): SpiderAxisData[] {
  return SPIDER_AXES.map((axis) => {
    const avg = claims.length
      ? claims.reduce((acc, c) => acc + num(c[axis.key]), 0) / claims.length
      : 0
    const caseValue = num(selectedClaim[axis.key])
    return {
      dimension: axis.label,
      caseValue: Math.round(caseValue * 100) / 100,
      average: Math.round(avg * 100) / 100,
      diff: Math.round((caseValue - avg) * 100) / 100,
    }
  })
}

export function getTopSpiderDrivers(selectedClaim: ClaimSummary, claims: ClaimSummary[], limit = 3) {
  return [...computeSpiderData(selectedClaim, claims)]
    .sort((a, b) => b.diff - a.diff)
    .filter((d) => d.diff > 0)
    .slice(0, limit)
}

export function buildSpiderNarrative(selectedClaim: ClaimSummary | null, claims: ClaimSummary[]): string {
  if (!selectedClaim) return 'Selecciona un caso para ver el patrón de riesgo.'
  const drivers = getTopSpiderDrivers(selectedClaim, claims, 3)
  if (!drivers.length) {
    return 'Este caso no supera el promedio de la cartera en ningún componente clave del puntaje.'
  }
  const parts = drivers.map((d) => `${d.dimension} (+${d.diff})`)
  return `El caso supera el promedio de cartera en ${parts.join(', ')}. Esto indica dónde conviene profundizar la revisión humana.`
}

export function buildNetworkInsight(payload: ClaimGraphPayload): string {
  const connections = payload.connections?.length ?? 0
  const alert = payload.alerta_red
  if (!connections) {
    return 'La red del caso no muestra conexiones adicionales con otras entidades del portafolio.'
  }
  const topEntity = [...payload.recurring_entities].sort((a, b) => b.total_siniestros - a.total_siniestros)[0]
  const entityPart = topEntity
    ? ` La entidad más recurrente es ${topEntity.type} «${topEntity.value}» (${topEntity.total_siniestros} casos).`
    : ''
  const alertPart = alert ? ' Se detectó alerta de red.' : ''
  return `El caso tiene ${connections} conexión(es) en la red.${entityPart}${alertPart}`
}

export function buildEntitiesInsight(payload: ClaimGraphPayload): string {
  const entities = payload.recurring_entities
  if (!entities.length) {
    return 'No hay entidades recurrentes vinculadas a este caso en el portafolio analizado.'
  }
  const top = [...entities].sort((a, b) => b.total_siniestros - a.total_siniestros)[0]
  return `${entities.length} entidad(es) recurrente(s). La más relevante: ${top.type} «${top.value}» aparece en ${top.total_siniestros} siniestro(s).`
}

export function buildRankingInsight(payload: ClaimGraphPayload): string {
  const providers = payload.recurring_entities.filter((e) => e.type === 'proveedor' || e.type === 'id_proveedor')
  if (!providers.length) {
    return 'No hay concentración notable de proveedores en las entidades vinculadas a este caso.'
  }
  const top = [...providers].sort((a, b) => b.total_siniestros - a.total_siniestros)[0]
  return `El proveedor «${top.value}» concentra ${top.total_siniestros} caso(s) relacionado(s), lo que puede indicar un patrón de revisión prioritario.`
}

export function buildRingsInsight(): string {
  return 'Las redes de fraude agrupan siniestros que comparten entidades. Úsalas para detectar patrones que un caso aislado no revela.'
}

export function buildChartInsights(
  selectedClaim: ClaimSummary | null,
  claims: ClaimSummary[],
  payload: ClaimGraphPayload,
) {
  return {
    graph: buildNetworkInsight(payload),
    rings: buildRingsInsight(),
    entities: buildEntitiesInsight(payload),
    ranking: buildRankingInsight(payload),
    spider: buildSpiderNarrative(selectedClaim, claims),
  }
}

export function resolveMainDriverLabel(component?: string | null): string {
  if (!component) return 'N/D'
  const normalized = component.trim().toLowerCase()
  const map: Record<string, string> = {
    reglas: COMPONENT_LABELS.score_reglas,
    modelo: COMPONENT_LABELS.score_modelo,
    'modelo ml': COMPONENT_LABELS.score_modelo,
    anomalia: COMPONENT_LABELS.score_anomalia,
    nlp: COMPONENT_LABELS.score_nlp,
    grafo: COMPONENT_LABELS.score_grafo,
    categorico: COMPONENT_LABELS.score_categorico,
  }
  return map[normalized] ?? component
}
