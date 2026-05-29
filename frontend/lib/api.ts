'use client'

export type FrontendRiskLevel = 'bajo' | 'medio' | 'alto' | 'critico'

export interface ApiEnvelope<T> {
  ok: boolean
  data: T | null
  error: {
    message: string
    hint?: string | null
    details?: unknown
  } | null
}

export interface ClaimSummary {
  id_siniestro: string
  ramo?: string | null
  cobertura?: string | null
  ciudad?: string | null
  id_proveedor?: string | null
  beneficiario?: string | null
  monto_reclamado?: number | null
  suma_asegurada?: number | null
  score_reglas?: number | null
  score_modelo?: number | null
  score_anomalia?: number | null
  score_nlp?: number | null
  score_grafo?: number | null
  score_categorico?: number | null
  score_final?: number | null
  nivel_riesgo?: string | null
  alertas_activadas?: unknown
  explicacion?: string | null
  accion_sugerida?: string | null
  narrativa?: string | null
  descripcion?: string | null
  fecha_ocurrencia?: string | null
  fecha_reporte?: string | null
  dias_desde_inicio_poliza?: number | null
  dias_desde_fin_poliza?: number | null
  dias_entre_ocurrencia_reporte?: number | null
  documentos_completos?: string | boolean | null
  documentos_inconsistentes?: string | boolean | null
}

export interface ClaimExplanation {
  id_siniestro: string
  score_final?: number | null
  nivel_riesgo?: string | null
  alertas?: unknown[]
  explicacion?: string | null
  accion_sugerida?: string | null
  componentes_score?: {
    reglas?: number | null
    modelo?: number | null
    anomalia?: number | null
    nlp?: number | null
    grafo?: number | null
    categorico?: number | null
  }
  detalles_avanzados?: Record<string, unknown>
}


export interface ClaimDossier {
  id_siniestro: string
  headline: string
  risk: {
    score_final?: number | null
    nivel_riesgo?: string | null
    accion_sugerida?: string | null
    decision_automatica?: string | null
    revision_humana_requerida?: string | null
  }
  claim: {
    ramo?: string | null
    cobertura?: string | null
    ciudad?: string | null
    id_asegurado?: string | null
    id_proveedor?: string | null
    beneficiario?: string | null
    monto_reclamado?: number | null
    suma_asegurada?: number | null
    ratio_monto_suma?: number | null
    fecha_ocurrencia?: string | null
    fecha_reporte?: string | null
  }
  evidence: Array<{
    codigo?: string | null
    senal?: string | null
    puntos?: number | null
    severidad?: string | null
    mensaje?: string | null
    evidencia?: Record<string, unknown>
  }>
  score_components: Record<string, number | null | undefined>
  main_driver?: { componente?: string | null; valor?: number | null }
  advanced_evidence?: {
    nlp?: { explicacion?: string | null; similares?: unknown[] }
    grafo?: { explicacion?: string | null; conexiones?: unknown[]; entidades_recurrentes?: unknown[] }
  }
  recommended_review: string[]
  ethical_guardrail: string
  explanation?: string | null
}

export interface StarCase {
  tipo: string
  id_siniestro: string
  nivel_riesgo?: string | null
  score_final?: number | null
  ramo?: string | null
  ciudad?: string | null
  id_proveedor?: string | null
  monto_reclamado?: number | null
  por_que_destaca: string
  explicacion_demo?: string | null
}

export interface StarCasesResponse {
  count: number
  cases: StarCase[]
}

export interface BusinessImpact {
  total_siniestros: number
  casos_rojos: number
  casos_a_revisar_top_percent: number
  porcentaje_revision: number
  monto_total_reclamado: number
  monto_en_casos_rojos: number
  monto_priorizado_top_percent: number
  mensaje: string
}

export interface AgentResponse {
  ok?: boolean
  intent?: string
  message?: string
  data?: unknown
  source?: string
  metadata?: unknown
}

export class ApiClientError extends Error {
  hint?: string | null
  details?: unknown
  status?: number

  constructor(message: string, options: { hint?: string | null; details?: unknown; status?: number } = {}) {
    super(message)
    this.name = 'ApiClientError'
    this.hint = options.hint
    this.details = options.details
    this.status = options.status
  }
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new ApiClientError('No se pudo conectar con el API de RastroSeguro.', {
      hint: 'Verifica que FastAPI esté activo en http://localhost:8000.',
    })
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!payload) {
    throw new ApiClientError('El API respondió con un formato inválido.', { status: response.status })
  }
  if (!response.ok || !payload.ok) {
    throw new ApiClientError(payload.error?.message || 'El API no pudo completar la solicitud.', {
      hint: payload.error?.hint,
      details: payload.error?.details,
      status: response.status,
    })
  }
  return payload.data as T
}

export function getHealth() {
  return apiRequest<{ service: string; status: string }>('/api/health')
}

export function getClaims(limit = 50) {
  return apiRequest<ClaimSummary[]>(`/api/claims?limit=${limit}`)
}

export function getClaimExplanation(idSiniestro: string) {
  return apiRequest<ClaimExplanation>(`/api/claims/${encodeURIComponent(idSiniestro)}/explanation`)
}

export function getQuickQuestions() {
  return apiRequest<string[]>('/api/agent/quick-questions')
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export function askAgent(question: string, history?: ChatTurn[]) {
  return apiRequest<AgentResponse>('/api/agent/ask', {
    method: 'POST',
    body: JSON.stringify(history && history.length ? { question, history } : { question }),
  })
}

export async function uploadClaimsCsv(file: File) {
  const form = new FormData()
  form.append('file', file)

  let response: Response
  try {
    response = await fetch(`${API_URL}/api/claims/upload-csv`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new ApiClientError('No se pudo conectar con el API de RastroSeguro.', {
      hint: 'Verifica que FastAPI esté activo en http://localhost:8000.',
    })
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<{
    uploaded: boolean
    filename?: string
    rows_processed?: number
    scored_output_path?: string
  }> | null

  if (!payload) {
    throw new ApiClientError('El API respondió con un formato inválido.', { status: response.status })
  }
  if (!response.ok || !payload.ok) {
    throw new ApiClientError(payload.error?.message || 'No se pudo procesar el CSV.', {
      hint: payload.error?.hint,
      details: payload.error?.details,
      status: response.status,
    })
  }
  return payload.data
}

export function toFrontendRiskLevel(level?: string | null): FrontendRiskLevel {
  const normalized = String(level || '').trim().toLowerCase()
  if (['verde', 'bajo', 'low'].includes(normalized)) return 'bajo'
  if (['amarillo', 'medio', 'medium'].includes(normalized)) return 'medio'
  if (['alto', 'high'].includes(normalized)) return 'alto'
  if (['rojo', 'critico', 'crítico', 'critical'].includes(normalized)) return 'critico'
  return 'medio'
}

export function alertToText(alert: unknown): string {
  if (typeof alert === 'string') return alert
  if (alert && typeof alert === 'object') {
    const item = alert as Record<string, unknown>
    return String(item.message || item.name || item.code || 'Alerta de riesgo activada')
  }
  return 'Alerta de riesgo activada'
}

export interface RiskAggregateRow {
  name?: string
  id_proveedor?: string
  ramo?: string
  ciudad?: string
  total_siniestros: number
  casos_rojos?: number
  score_promedio: number
}

export interface ExecutiveReport {
  generated_at: string
  summary: {
    total_siniestros: number
    casos_verdes: number
    casos_amarillos: number
    casos_rojos: number
    porcentaje_rojo: number
    mix_riesgo_pct: Record<string, number>
    monto_total_reclamado: number
    monto_reclamado_casos_rojos: number
    score_promedio_portafolio?: number
  }
  top_casos: ClaimSummary[]
  riesgo_por_ramo: RiskAggregateRow[]
  top_proveedores: RiskAggregateRow[]
  top_ciudades: RiskAggregateRow[]
  ethics_note: string
  ahorro_potencial_estimado?: SavingsEstimate
}

export interface SavingsEstimate {
  casos_rojos: number
  monto_expuesto_rojos: number
  tasa_prevencion_asumida: number
  ahorro_potencial_estimado: number
  desglose_por_ramo?: Array<{ ramo: string; monto_expuesto: number; ahorro_estimado: number }>
  nota_etica?: string
}

export interface SimulationResponse extends ClaimExplanation {
  ok?: boolean
  simulated?: boolean
  source?: string
  input_normalizado?: Record<string, unknown>
  risk?: {
    score_final?: number | null
    nivel_riesgo?: string | null
    accion_sugerida?: string | null
  }
  signals?: Record<string, unknown>
  ui?: {
    priority_badge?: string
    summary_cards?: Array<{ label: string; value: unknown }>
    recommended_next_steps?: string[]
  }
  context?: Record<string, unknown>
}

export function getProviderRiskRanking(limit = 10) {
  return apiRequest<RiskAggregateRow[]>(`/api/rankings/providers?limit=${limit}`)
}

export function getCityRiskDistribution() {
  return apiRequest<RiskAggregateRow[]>('/api/risk/cities')
}

export function getBranchRiskDistribution() {
  return apiRequest<RiskAggregateRow[]>('/api/risk/branches')
}

export function getExecutiveReport(topLimit = 10) {
  return apiRequest<ExecutiveReport>(`/api/report?format=dict&top_limit=${topLimit}`)
}

export function getExecutiveReportMarkdown(topLimit = 10) {
  return apiRequest<{ format: string; content: string }>(`/api/report?format=markdown&top_limit=${topLimit}`)
}

export function getSavingsEstimate() {
  return apiRequest<SavingsEstimate>('/api/report/savings')
}

export function simulateClaim(claimData: Record<string, unknown>) {
  return apiRequest<SimulationResponse>('/api/simulator/claim', {
    method: 'POST',
    body: JSON.stringify(claimData),
  })
}


export function getClaimDossier(idSiniestro: string) {
  return apiRequest<ClaimDossier>(`/api/claims/${encodeURIComponent(idSiniestro)}/dossier`)
}

export function getStarCases() {
  return apiRequest<StarCasesResponse>('/api/reports/star-cases')
}

export function getBusinessImpact(reviewPercent = 0.1) {
  return apiRequest<BusinessImpact>(`/api/reports/business-impact?review_percent=${reviewPercent}`)
}

export interface FraudRingSharedEntity {
  type: string
  value: string
  key: string
  siniestros_vinculados: number
  siniestros_relacionados: string[]
}

export interface FraudRingClaimSummary {
  id_siniestro: string
  ramo?: string | null
  nivel_riesgo?: string | null
  score_final?: number | null
  monto_reclamado?: number | null
  id_proveedor?: string | null
  beneficiario?: string | null
}

export interface FraudRing {
  id_anillo: string
  siniestros: string[]
  tamano: number
  casos_rojos: number
  pct_rojos: number
  monto_expuesto: number
  score_promedio: number
  ring_risk_score: number
  entidades_compartidas: FraudRingSharedEntity[]
  explicacion: string
  claims_resumen: FraudRingClaimSummary[]
}

export interface FraudRingsResponse {
  total_anillos: number
  anillos: FraudRing[]
  explicacion_global: string
}

export function getFraudRings(limit = 10) {
  return apiRequest<FraudRingsResponse>(`/api/graph/fraud-rings?limit=${limit}`)
}
