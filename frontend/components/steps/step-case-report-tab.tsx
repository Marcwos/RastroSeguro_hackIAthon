'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  ClipboardList,
  Download,
  FileText,
  GitBranch,
  Loader2,
  UploadCloud,
} from 'lucide-react'
import { useAppState } from '@/lib/app-context'
import {
  ClaimDossier,
  ExecutiveReport,
  getClaimDossier,
  getExecutiveReport,
} from '@/lib/api'
import { formatCurrency } from '@/lib/claims-data'
import { safeGraphPayload } from '@/components/graph/graph-utils'
import { buildChartInsights } from '@/lib/graph-insights'
import { buildCaseReportMarkdown, downloadCaseReportMarkdown, downloadCaseReportPdf } from '@/lib/case-report-export'
import { ScoreObjectiveCard } from '@/components/report/score-objective-card'
import { ChartInsight } from '@/components/report/chart-insight'
import { alertToText } from '@/lib/api'
import { sanitizeAiText } from '@/lib/utils'

const num = (v: unknown) => Number(v ?? 0)

function yes(value: unknown) {
  return ['si', 'sí', 'true', '1', 'yes', 'completo'].includes(String(value ?? '').trim().toLowerCase()) || value === true
}

export function StepCaseReportTab({ compact = false }: { compact?: boolean }) {
  const {
    selectedClaim,
    selectedClaimId,
    selectedExplanation,
    loadClaimExplanation,
    claims,
    uploadedFile,
    isDataLoaded,
    userRole,
    setShowChat,
  } = useAppState()

  const [dossier, setDossier] = useState<ClaimDossier | null>(null)
  const [portfolio, setPortfolio] = useState<ExecutiveReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingMd, setExportingMd] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const isExecutive = userRole === 'executive'

  useEffect(() => {
    if (selectedClaimId && selectedExplanation?.id_siniestro !== selectedClaimId) {
      void loadClaimExplanation(selectedClaimId)
    }
  }, [loadClaimExplanation, selectedClaimId, selectedExplanation?.id_siniestro])

  useEffect(() => {
    if (!selectedClaimId) return
    setLoading(true)
    Promise.all([getClaimDossier(selectedClaimId), getExecutiveReport(10)])
      .then(([dossierData, reportData]) => {
        setDossier(dossierData)
        setPortfolio(reportData)
      })
      .catch(() => {
        setDossier(null)
        setPortfolio(null)
      })
      .finally(() => setLoading(false))
  }, [selectedClaimId])

  const graphPayload = useMemo(() => {
    const hasCurrentExplanation = selectedExplanation?.id_siniestro === selectedClaimId
    const details = hasCurrentExplanation
      ? (selectedExplanation?.detalles_avanzados as Record<string, unknown> | undefined)?.grafo
      : null
    return safeGraphPayload(
      details
        ? { ...(details as Record<string, unknown>), id_siniestro: selectedClaim?.id_siniestro, score_grafo: selectedClaim?.score_grafo }
        : null,
      selectedClaim?.id_siniestro || 'SIN-NA',
    )
  }, [selectedClaim, selectedClaimId, selectedExplanation])

  const chartInsights = useMemo(
    () => buildChartInsights(selectedClaim, claims, graphPayload),
    [selectedClaim, claims, graphPayload],
  )

  if (!selectedClaim || !selectedClaimId) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <FileText className="h-12 w-12" />
        <p>Selecciona un caso para generar el reporte demo.</p>
      </div>
    )
  }

  const alertas = (selectedExplanation?.alertas?.length
    ? selectedExplanation.alertas
    : selectedClaim.alertas_activadas instanceof Array
      ? selectedClaim.alertas_activadas
      : []) as unknown[]

  const handleExportMarkdown = async () => {
    setExportingMd(true)
    try {
      const markdown = buildCaseReportMarkdown({
        claim: selectedClaim,
        explanation: selectedExplanation,
        dossier,
        graphPayload,
        claims,
        uploadedFileName: uploadedFile?.name ?? null,
        portfolioReport: portfolio,
      })
      downloadCaseReportMarkdown(markdown, selectedClaim.id_siniestro)
    } finally {
      setExportingMd(false)
    }
  }

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      await downloadCaseReportPdf({
        claim: selectedClaim,
        explanation: selectedExplanation,
        dossier,
        graphPayload,
        claims,
        uploadedFileName: uploadedFile?.name ?? null,
        portfolioReport: portfolio,
      })
    } finally {
      setExportingPdf(false)
    }
  }

  const executiveTakeaway = sanitizeAiText(
    dossier?.executive_takeaway || dossier?.investigation_summary || selectedExplanation?.explicacion || '',
  )

  return (
    <div className="space-y-4">
      {loading && (
        <div className="institutional-card flex items-center gap-2 p-4 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Consolidando reporte...
        </div>
      )}

      {isExecutive && executiveTakeaway && (
        <section className="dark-panel dark-panel-border border p-5">
          <p className="label-mono-md uppercase text-white/70">Lectura ejecutiva</p>
          <p className="dark-panel-heading mt-2 text-lg text-white">{executiveTakeaway}</p>
        </section>
      )}

      <ScoreObjectiveCard
        claim={selectedClaim}
        explanation={selectedExplanation}
        mainDriverComponent={dossier?.main_driver?.componente}
        mainDriverValue={dossier?.main_driver?.valor}
        compact={compact || isExecutive}
      />

      <section className="institutional-card overflow-hidden">
        <div className="section-header">Recorrido por etapas (1–4)</div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <StageCard
            step={1}
            icon={UploadCloud}
            title="Carga"
            text={uploadedFile?.name ? `Archivo: ${uploadedFile.name}` : isDataLoaded ? 'Cartera activa en el sistema.' : 'Datos del portafolio disponibles.'}
          />
          <StageCard
            step={2}
            icon={ClipboardList}
            title="Resumen"
            text={`${selectedClaim.ramo ?? 'Ramo N/D'} · ${formatCurrency(selectedClaim.monto_reclamado)} · Docs: ${yes(selectedClaim.documentos_completos) ? 'completos' : 'pendientes'}`}
          />
          <StageCard
            step={3}
            icon={FileText}
            title="Riesgo"
            text={
              alertas.length
                ? alertas.slice(0, 2).map((a) => alertToText(a)).join('; ')
                : sanitizeAiText(selectedExplanation?.explicacion || selectedClaim.explicacion || 'Sin alertas principales.')
            }
          />
          <StageCard
            step={4}
            icon={GitBranch}
            title="Relaciones"
            text={chartInsights.graph}
          />
        </div>
      </section>

      <section className="institutional-card overflow-hidden">
        <div className="section-header">Gráficos explicados</div>
        <div className="space-y-2 p-4">
          <ChartInsight text={`Red del caso: ${chartInsights.graph}`} />
          <ChartInsight text={`Recurrencias: ${chartInsights.recurrence}`} />
          <ChartInsight text={`Comparación con la cartera: ${chartInsights.spider}`} />
        </div>
      </section>

      {portfolio?.summary && (
        <section className="institutional-card overflow-hidden">
          <div className="section-header">Contexto portafolio</div>
          <div className="grid gap-3 p-4 md:grid-cols-4">
            <Kpi label="Total" value={portfolio.summary.total_siniestros.toLocaleString()} />
            <Kpi label="Casos rojos" value={portfolio.summary.casos_rojos.toLocaleString()} />
            <Kpi label="% rojo" value={`${portfolio.summary.porcentaje_rojo}%`} />
            <Kpi label="Monto rojo" value={formatCurrency(portfolio.summary.monto_reclamado_casos_rojos)} />
          </div>
          {portfolio.top_casos?.length ? (
            <div className="border-t border-border px-4 pb-4">
              <p className="label-mono-md mb-2 font-bold uppercase text-muted-foreground">Principales casos del portafolio</p>
              <div className="flex flex-wrap gap-2">
                {portfolio.top_casos.slice(0, 5).map((c) => (
                  <span key={String(c.id_siniestro)} className="rounded-md border border-border bg-[var(--surface-low)] px-2 py-1 font-mono text-xs">
                    {String(c.id_siniestro)} · {Math.round(num(c.score_final))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleExportPdf()}
          disabled={exportingPdf || exportingMd}
          className="focus-ring inline-flex items-center gap-2 bg-primary px-5 py-2.5 label-mono-md text-primary-foreground"
        >
          {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Descargar PDF
        </button>
        <button
          type="button"
          onClick={() => void handleExportMarkdown()}
          disabled={exportingPdf || exportingMd}
          className="focus-ring inline-flex items-center gap-2 border border-border px-5 py-2.5 label-mono-md text-foreground hover:bg-[var(--surface-container)]"
        >
          {exportingMd ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Descargar texto (.md)
        </button>
        <button
          type="button"
          onClick={() => setShowChat(true)}
          className="focus-ring inline-flex items-center gap-2 border border-border px-5 py-2.5 label-mono-md text-foreground hover:bg-[var(--surface-container)]"
        >
          <Bot className="h-4 w-4" />
          Preguntar al asistente
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function StageCard({
  step,
  icon: Icon,
  title,
  text,
}: {
  step: number
  icon: typeof UploadCloud
  title: string
  text: string
}) {
  return (
    <div className="rounded-md border border-border bg-[var(--surface-low)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{step}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="label-mono-md font-bold uppercase">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[var(--surface-low)] p-3">
      <p className="label-mono text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-semibold">{value}</p>
    </div>
  )
}
