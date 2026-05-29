import { alertToText, ClaimDossier, ClaimExplanation, ClaimSummary, ExecutiveReport } from '@/lib/api'
import { formatCurrency, getRiskLabel } from '@/lib/claims-data'
import { buildChartInsights } from '@/lib/graph-insights'
import { buildContributionRows } from '@/lib/score-weights'
import { ClaimGraphPayload } from '@/components/graph/graph-types'
import { sanitizeAiText } from '@/lib/utils'

const num = (v: unknown) => Number(v ?? 0)

function yes(value: unknown) {
  return ['si', 'sí', 'true', '1', 'yes', 'completo'].includes(String(value ?? '').trim().toLowerCase()) || value === true
}

export interface CaseReportExportInput {
  claim: ClaimSummary
  explanation?: ClaimExplanation | null
  dossier?: ClaimDossier | null
  graphPayload: ClaimGraphPayload
  claims: ClaimSummary[]
  uploadedFileName?: string | null
  portfolioReport?: ExecutiveReport | null
  portfolioMarkdown?: string | null
}

export function buildCaseReportMarkdown(input: CaseReportExportInput): string {
  const { claim, explanation, dossier, graphPayload, claims, uploadedFileName, portfolioReport, portfolioMarkdown } = input
  const scoreFinal = num(explanation?.score_final ?? claim.score_final)
  const nivelRiesgo = explanation?.nivel_riesgo || claim.nivel_riesgo || 'Sin clasificar'
  const explicacion = sanitizeAiText(explanation?.explicacion || claim.explicacion || '')
  const accion = sanitizeAiText(explanation?.accion_sugerida || claim.accion_sugerida || '')

  const rawComponents = explanation?.componentes_score ?? {
    reglas: claim.score_reglas,
    modelo: claim.score_modelo,
    anomalia: claim.score_anomalia,
    nlp: claim.score_nlp,
    grafo: claim.score_grafo,
    categorico: claim.score_categorico,
  }

  const components = {
    score_reglas: rawComponents.reglas ?? claim.score_reglas,
    score_modelo: rawComponents.modelo ?? claim.score_modelo,
    score_anomalia: rawComponents.anomalia ?? claim.score_anomalia,
    score_nlp: rawComponents.nlp ?? claim.score_nlp,
    score_grafo: rawComponents.grafo ?? claim.score_grafo,
    score_categorico: rawComponents.categorico ?? claim.score_categorico,
  }

  const rows = buildContributionRows(components)
  const insights = buildChartInsights(claim, claims, graphPayload)
  const alertas = (explanation?.alertas?.length ? explanation.alertas : claim.alertas_activadas instanceof Array ? claim.alertas_activadas : []) as unknown[]

  const lines: string[] = [
    '# Reporte demo — RastroSeguro',
    '',
    `**Caso:** ${claim.id_siniestro}`,
    `**Generado:** ${new Date().toISOString()}`,
    '',
    '## Score objetivo',
    '',
    `- Puntaje final: **${Math.round(scoreFinal)}/100**`,
    `- Nivel: **${getRiskLabel(nivelRiesgo)}**`,
    `- Recomendación: ${accion || 'Revisión humana'}`,
    '',
    '### Contribución ponderada',
    '',
    '| Componente | Valor | Peso | Contribución |',
    '| --- | --- | --- | --- |',
    ...rows.map((r) => `| ${r.label} | ${Math.round(r.value)} | ${r.weightPct}% | ${r.contribution} |`),
    '',
    explicacion ? `**Explicación:** ${explicacion}` : '',
    '',
    '## Recorrido por etapas',
    '',
    '### Paso 1 — Carga',
    uploadedFileName ? `- Archivo cargado: \`${uploadedFileName}\`` : '- Dataset activo en el sistema.',
    `- Total casos en sesión: ${claims.length}`,
    '',
    '### Paso 2 — Resumen técnico',
    `- Ramo: ${claim.ramo ?? 'N/D'} | Cobertura: ${claim.cobertura ?? 'N/D'}`,
    `- Monto reclamado: ${formatCurrency(claim.monto_reclamado)}`,
    `- Documentos completos: ${yes(claim.documentos_completos) ? 'Sí' : 'Pendiente o incompleto'}`,
    '',
    '### Paso 3 — Riesgo explicable',
    ...(alertas.length
      ? alertas.slice(0, 5).map((a) => `- ${alertToText(a)}`)
      : ['- Sin alertas principales registradas.']),
    '',
    '### Paso 4 — Relaciones y gráficos',
    `- Red: ${insights.graph}`,
    `- Entidades: ${insights.entities}`,
    `- Concentración: ${insights.ranking}`,
    `- Patrón araña: ${insights.spider}`,
    '',
    '## Gráficos explicados',
    '',
    `- **Red del caso:** ${insights.graph}`,
    `- **Entidades recurrentes:** ${insights.entities}`,
    `- **Concentración proveedor:** ${insights.ranking}`,
    `- **Patrón araña:** ${insights.spider}`,
    '',
  ]

  if (dossier) {
    lines.push(
      '## Evidencias del expediente',
      '',
      dossier.headline || '',
      '',
      ...(dossier.evidence?.slice(0, 5).map((e, i) => `${i + 1}. **${e.senal || e.codigo}:** ${e.mensaje || ''} (+${Math.round(num(e.puntos))})`) ?? []),
      '',
      dossier.ethical_guardrail || '',
      '',
    )
  }

  if (portfolioReport?.summary) {
    const s = portfolioReport.summary
    lines.push(
      '## Anexo — Portafolio',
      '',
      `- Total siniestros: ${s.total_siniestros}`,
      `- Casos rojos: ${s.casos_rojos} (${s.porcentaje_rojo}%)`,
      `- Monto en casos rojos: ${formatCurrency(s.monto_reclamado_casos_rojos)}`,
      '',
      portfolioReport.ethics_note || '',
      '',
    )
  } else if (portfolioMarkdown) {
    lines.push('## Anexo — Portafolio', '', portfolioMarkdown, '')
  }

  lines.push(
    '---',
    '',
    'Documento generado por RastroSeguro. Este resultado solo apoya la revisión humana y no toma decisiones automáticas.',
  )

  return lines.filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
}

export function downloadCaseReportMarkdown(content: string, claimId: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-demo-${claimId}.md`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
