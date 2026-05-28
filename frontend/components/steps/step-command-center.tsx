'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, BarChart3, Bot, Building2, CircleDollarSign, FileText, FlaskConical, MapPin, FileSearch, GitBranch, Loader2, ShieldCheck, Target, UploadCloud, UsersRound } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAppState } from '@/lib/app-context'
import { ClaimSummary, ExecutiveReport, RiskAggregateRow, SimulationResponse, getBranchRiskDistribution, getCityRiskDistribution, getExecutiveReport, getProviderRiskRanking, simulateClaim } from '@/lib/api'
import { formatCurrency, getRiskColor, getRiskLabel } from '@/lib/claims-data'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const num = (value: unknown) => Number(value ?? 0)
function normalizeRisk(level?: string | null) {
  const value = String(level || '').toLowerCase()
  if (['critico', 'crítico', 'rojo'].includes(value)) return 'critico'
  if (['alto', 'high'].includes(value)) return 'alto'
  if (['medio', 'amarillo', 'medium'].includes(value)) return 'medio'
  if (['bajo', 'verde', 'low'].includes(value)) return 'bajo'
  return 'medio'
}

function countAlerts(claim: ClaimSummary) {
  const alerts = claim.alertas_activadas
  if (Array.isArray(alerts)) return alerts.length
  if (typeof alerts === 'string') return alerts ? 1 : 0
  return 0
}

function normalizeBackendRows(rows: RiskAggregateRow[] | null, key: 'id_proveedor' | 'ramo' | 'ciudad') {
  return (rows || []).map((row) => ({
    name: String(row.name || row[key] || 'No informado'),
    total: Number(row.total_siniestros || 0),
    risk: Number(row.score_promedio || 0) * Number(row.total_siniestros || 0),
    avgRisk: Math.round(Number(row.score_promedio || 0)),
    casosRojos: Number(row.casos_rojos || 0),
  }))
}

function ReportDialog({ report, loading, onLoad }: { report: ExecutiveReport | null; loading: boolean; onLoad: () => void }) {
  const summary = report?.summary
  return (
    <Dialog onOpenChange={(open) => { if (open && !report && !loading) onLoad() }}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white hover:bg-white/10">
          <FileText className="h-4 w-4" /> Reporte ejecutivo
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reporte ejecutivo RastroSeguro</DialogTitle>
          <DialogDescription>Resumen generado desde el backend `/api/report` para sustentar la demo y auditoría.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Generando reporte...</div>
        ) : report && summary ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ['Total', summary.total_siniestros],
                ['Rojos', summary.casos_rojos],
                ['% rojo', `${summary.porcentaje_rojo}%`],
                ['Monto rojo', formatCurrency(summary.monto_reclamado_casos_rojos)],
              ].map(([label, value]) => (
                <div key={label} className="border border-border bg-[var(--surface-low)] p-3">
                  <p className="label-mono text-muted-foreground">{label}</p>
                  <p className="font-display text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <p className="border-l-4 border-primary pl-3 text-sm italic text-muted-foreground">{report.ethics_note}</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <ReportTable title="Top casos" rows={report.top_casos || []} primary="id_siniestro" secondary="score_final" />
              <ReportTable title="Top proveedores" rows={report.top_proveedores || []} primary="id_proveedor" secondary="score_promedio" />
              <ReportTable title="Riesgo por ramo" rows={report.riesgo_por_ramo || []} primary="ramo" secondary="score_promedio" />
              <ReportTable title="Top ciudades" rows={report.top_ciudades || []} primary="ciudad" secondary="score_promedio" />
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">No se pudo cargar el reporte. Verifica que el API esté activo.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ReportTable({ title, rows, primary, secondary }: { title: string; rows: unknown[]; primary: string; secondary: string }) {
  return (
    <div className="border border-border">
      <div className="section-header">{title}</div>
      <div className="divide-y divide-border">
        {rows.slice(0, 5).map((raw, index) => {
          const row = (raw || {}) as Record<string, unknown>
          return (
            <div key={`${title}-${index}`} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="font-mono font-semibold">{String(row[primary] || 'N/D')}</span>
              <span className="label-mono-md text-muted-foreground">{String(row[secondary] ?? row.total_siniestros ?? '')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SimulatorDialog() {
  const [form, setForm] = useState({
    ramo: 'vehiculo',
    ciudad: 'Ambato',
    monto_reclamado: '18000',
    suma_asegurada: '20000',
    proveedor: 'PROV-001',
    dias_desde_inicio_poliza: '3',
    documentos_presentes: 'false',
    narrativa: 'Vehículo impactado por tercero no identificado durante la noche. No existen testigos directos.',
  })
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }))
  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await simulateClaim({
        ...form,
        monto_reclamado: Number(form.monto_reclamado),
        suma_asegurada: Number(form.suma_asegurada),
        dias_desde_inicio_poliza: Number(form.dias_desde_inicio_poliza),
        documentos_presentes: form.documentos_presentes === 'true',
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo simular el siniestro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white hover:bg-white/10">
          <FlaskConical className="h-4 w-4" /> Simular caso
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Simulador de nuevo siniestro</DialogTitle>
          <DialogDescription>Prueba de fuego conectada a `POST /api/simulator/claim`; evalúa reglas, modelo, NLP y grafo sin persistir datos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ramo" value={form.ramo} onChange={(v) => update('ramo', v)} />
              <Field label="Ciudad" value={form.ciudad} onChange={(v) => update('ciudad', v)} />
              <Field label="Monto reclamado" value={form.monto_reclamado} onChange={(v) => update('monto_reclamado', v)} />
              <Field label="Suma asegurada" value={form.suma_asegurada} onChange={(v) => update('suma_asegurada', v)} />
              <Field label="Proveedor" value={form.proveedor} onChange={(v) => update('proveedor', v)} />
              <Field label="Días desde inicio póliza" value={form.dias_desde_inicio_poliza} onChange={(v) => update('dias_desde_inicio_poliza', v)} />
            </div>
            <label className="block">
              <span className="label-mono-md font-bold uppercase text-muted-foreground">Narrativa</span>
              <Textarea value={form.narrativa} onChange={(e) => update('narrativa', e.target.value)} className="mt-1 min-h-[110px]" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.documentos_presentes === 'true'} onChange={(e) => update('documentos_presentes', String(e.target.checked))} />
              Documentación completa
            </label>
            <button onClick={run} disabled={loading} className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 label-mono-md font-bold uppercase text-white disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Ejecutar simulación
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="institutional-card overflow-hidden">
            <div className="section-header">Resultado simulado</div>
            {result ? (
              <div className="space-y-4 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="label-mono text-muted-foreground">SCORE FINAL</p>
                    <p className="font-display text-5xl font-semibold">{Math.round(num(result.score_final))}</p>
                  </div>
                  <span className="px-3 py-2 label-mono-md font-bold uppercase text-white" style={{ backgroundColor: getRiskColor(normalizeRisk(result.nivel_riesgo)) }}>{getRiskLabel(normalizeRisk(result.nivel_riesgo))}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.explicacion}</p>
                <div>
                  <p className="label-mono-md mb-2 font-bold uppercase">Próximos pasos</p>
                  <ul className="space-y-2 text-sm">
                    {(result.ui?.recommended_next_steps || [result.accion_sugerida || 'Revisión humana.']).map((step) => <li key={step} className="border border-border bg-[var(--surface-low)] p-2">{step}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center p-8 text-center text-sm text-muted-foreground">Complete el formulario y ejecute una simulación para ver score, alertas y recomendación.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="label-mono-md font-bold uppercase text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  )
}

function GlobalRelationshipMap({ claims, onAnalyze }: { claims: ClaimSummary[]; onAnalyze: (claim: ClaimSummary) => void }) {
  const [hoveredClaim, setHoveredClaim] = useState<ClaimSummary | null>(null)
  const topClaims = claims.slice(0, 9)
  const center = { x: 260, y: 150 }
  const satellites = topClaims.map((claim, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(topClaims.length, 1) - Math.PI / 2
    const radius = index % 2 === 0 ? 112 : 86
    return {
      claim,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      color: getRiskColor(normalizeRisk(claim.nivel_riesgo)),
    }
  })
  const activeClaim = hoveredClaim

  return (
    <div className="relative h-[360px] overflow-hidden bg-[var(--primary-container)] text-white">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      <svg viewBox="0 0 520 320" className="absolute inset-0 h-full w-full">
        {satellites.map((node) => (
          <line key={`line-${node.claim.id_siniestro}`} x1={center.x} y1={center.y} x2={node.x} y2={node.y} stroke="rgba(218,226,253,.35)" strokeWidth="1" />
        ))}
        <circle cx={center.x} cy={center.y} r="44" fill="#dae2fd" opacity=".14" />
        <circle cx={center.x} cy={center.y} r="30" fill="#dae2fd" opacity=".22" />
        <text x={center.x} y={center.y - 4} textAnchor="middle" className="fill-white text-[11px] font-bold">DATASET</text>
        <text x={center.x} y={center.y + 12} textAnchor="middle" className="fill-[#bec6e0] text-[9px]">RIESGO</text>
        {satellites.map((node) => {
          const isActive = hoveredClaim?.id_siniestro === node.claim.id_siniestro
          const score = Math.round(num(node.claim.score_final))
          return (
            <g
              key={node.claim.id_siniestro}
              className="cursor-pointer"
              onClick={() => onAnalyze(node.claim)}
              onMouseEnter={() => setHoveredClaim(node.claim)}
              onMouseLeave={() => setHoveredClaim(null)}
            >
              <circle cx={node.x} cy={node.y} r={isActive ? '30' : '26'} fill="none" stroke={node.color} opacity={isActive ? '.58' : '.35'} strokeWidth="6" />
              <circle cx={node.x} cy={node.y} r={isActive ? '23' : '20'} fill={node.color} opacity=".95" />
              <text x={node.x} y={node.y - 2} textAnchor="middle" className="fill-white text-[7px] font-bold">
                {node.claim.id_siniestro.replace('SIN-', 'SIN')}
              </text>
              <text x={node.x} y={node.y + 9} textAnchor="middle" className="fill-white text-[8px] font-bold">
                {score}/100
              </text>
            </g>
          )
        })}
      </svg>
      <div className="absolute left-4 top-4">
        <p className="label-mono-md uppercase text-[var(--primary-fixed)]">Mapa global de relaciones</p>
        <p className="mt-1 max-w-xs text-xs text-[var(--primary-fixed-dim)]">Cada nodo representa un siniestro prioritario. Pase el cursor para ver detalles o haga click para analizar.</p>
      </div>
      {activeClaim && (
        <div className="absolute right-4 top-4 w-[240px] border border-white/20 bg-[#0b1020]/90 p-4 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label-mono text-[var(--primary-fixed-dim)]">CASO EN FOCO</p>
              <p className="font-display text-xl font-semibold">{activeClaim.id_siniestro}</p>
            </div>
            <span className="px-2 py-1 label-mono-md font-bold uppercase text-white" style={{ backgroundColor: getRiskColor(normalizeRisk(activeClaim.nivel_riesgo)) }}>
              {Math.round(num(activeClaim.score_final))}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--primary-fixed-dim)]">
            <div><span className="label-mono block text-white/60">RAMO</span>{activeClaim.ramo || 'N/D'}</div>
            <div><span className="label-mono block text-white/60">CIUDAD</span>{activeClaim.ciudad || 'N/D'}</div>
            <div className="col-span-2"><span className="label-mono block text-white/60">PROVEEDOR</span>{activeClaim.id_proveedor || activeClaim.beneficiario || 'N/D'}</div>
            <div><span className="label-mono block text-white/60">MONTO</span>{formatCurrency(activeClaim.monto_reclamado)}</div>
            <div><span className="label-mono block text-white/60">NIVEL</span>{getRiskLabel(normalizeRisk(activeClaim.nivel_riesgo))}</div>
          </div>
          <p className="mt-3 text-[11px] text-[var(--primary-fixed-dim)]">Click en el nodo para abrir el flujo de análisis de este caso.</p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex gap-3 text-xs text-[var(--primary-fixed-dim)]">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" /> Alto/Crítico</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medio</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Bajo</span>
      </div>
    </div>
  )
}

export function StepCommandCenter() {
  const { claims, loadClaims, isLoadingClaims, apiError, apiHint, setCurrentStep, setSelectedClaimId, setIsDataLoaded } = useAppState()
  const [providerRanking, setProviderRanking] = useState<RiskAggregateRow[] | null>(null)
  const [cityRanking, setCityRanking] = useState<RiskAggregateRow[] | null>(null)
  const [branchRanking, setBranchRanking] = useState<RiskAggregateRow[] | null>(null)
  const [report, setReport] = useState<ExecutiveReport | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [historyCode, setHistoryCode] = useState('')
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    if (!claims.length) void loadClaims()
  }, [claims.length, loadClaims])

  const loadCommandCenterData = async () => {
    setReportLoading(true)
    try {
      const [providers, cities, branches, executiveReport] = await Promise.all([
        getProviderRiskRanking(10).catch(() => null),
        getCityRiskDistribution().catch(() => null),
        getBranchRiskDistribution().catch(() => null),
        getExecutiveReport(10).catch(() => null),
      ])
      setProviderRanking(providers)
      setCityRanking(cities)
      setBranchRanking(branches)
      setReport(executiveReport)
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    void loadCommandCenterData()
  }, [])

  const analytics = useMemo(() => {
    const summary = report?.summary
    const providerRows = normalizeBackendRows(providerRanking, 'id_proveedor')
    const branchRows = normalizeBackendRows(branchRanking, 'ramo')
    const cityRows = normalizeBackendRows(cityRanking, 'ciudad')
    const riskDistribution = summary
      ? [
          { name: 'Crítico', risk: 'critico', total: summary.casos_rojos || 0, fill: getRiskColor('rojo') },
          { name: 'Medio', risk: 'medio', total: summary.casos_amarillos || 0, fill: getRiskColor('amarillo') },
          { name: 'Bajo', risk: 'bajo', total: summary.casos_verdes || 0, fill: getRiskColor('verde') },
        ].filter((row) => row.total > 0)
      : []
    const topCases = claims.slice(0, 10)
    return {
      total: summary?.total_siniestros ?? 0,
      totalAmount: summary?.monto_total_reclamado ?? 0,
      averageScore: Math.round(Number(summary?.score_promedio_portafolio ?? 0)),
      riskDistribution,
      providerRows,
      branchRows,
      cityRows,
      topCases,
      criticalCount: summary?.casos_rojos ?? 0,
      mediumCount: summary?.casos_amarillos ?? 0,
      topProvider: providerRows[0]?.name || 'N/D',
    }
  }, [claims, branchRanking, cityRanking, providerRanking, report])

  const analyzeClaim = (claim: ClaimSummary) => {
    setSelectedClaimId(claim.id_siniestro)
    setIsDataLoaded(true)
    setCurrentStep(2)
  }

  const searchInHistory = () => {
    const query = historyCode.trim().toUpperCase().replace('_', '-')
    if (!query) return
    const found = claims.find((c) => String(c.id_siniestro || '').toUpperCase() === query)
    if (!found) {
      setHistoryError(`No se encontró ${query}`)
      return
    }
    setHistoryError(null)
    analyzeClaim(found)
  }

  const kpis = [
    { label: 'Siniestros evaluados', value: analytics.total.toString(), note: 'Dataset priorizado', Icon: FileSearch },
    { label: 'Casos alto/crítico', value: analytics.criticalCount.toString(), note: 'Revisión prioritaria', Icon: AlertTriangle },
    { label: 'Monto expuesto', value: formatCurrency(analytics.totalAmount), note: 'Total reclamado', Icon: CircleDollarSign },
    { label: 'Score promedio', value: `${analytics.averageScore}/100`, note: 'Riesgo global', Icon: Target },
  ]

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
          <div className="border border-border bg-[var(--primary-container)] p-8 text-white">
            <div className="flex items-center gap-2 text-[var(--primary-fixed)]">
              <GitBranch className="h-5 w-5" />
              <span className="label-mono-md uppercase">RastroSeguro Intelligence Layer</span>
            </div>
            <h1 className="display-heading mt-4 text-4xl lg:text-5xl">Command Center Antifraude</h1>
            <p className="mt-3 max-w-2xl text-base text-[var(--primary-fixed-dim)]">
              Panorama ejecutivo de riesgo, concentración de alertas y casos prioritarios antes de iniciar el flujo de análisis con IA.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setCurrentStep(1)} className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3 label-mono-md font-bold uppercase text-primary hover:bg-[var(--surface-high)]">
                Iniciar flujo de análisis <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => { void loadClaims(); void loadCommandCenterData() }} className="inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white hover:bg-white/10">
                Sincronizar datos
              </button>
              <ReportDialog report={report} loading={reportLoading} onLoad={() => void loadCommandCenterData()} />
              <SimulatorDialog />
              <button onClick={() => setCurrentStep(6)} className="inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white hover:bg-white/10">
                Demo ejecutiva
              </button>
            </div>
          </div>
          <div className="institutional-card p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-8 w-8 text-green-700" />
              <div>
                <p className="label-mono-md font-bold uppercase">Marco ético</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  La solución genera alertas explicables para revisión humana. No acusa fraude, no rechaza reclamos y no sustituye al analista.
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-[var(--surface-low)] p-3"><p className="label-mono text-muted-foreground">Proveedor foco</p><p className="truncate font-semibold">{analytics.topProvider}</p></div>
              <div className="bg-[var(--surface-low)] p-3"><p className="label-mono text-muted-foreground">Casos medios</p><p className="font-semibold">{analytics.mediumCount}</p></div>
            </div>
          </div>
        </header>

        {apiError && (
          <div className="border border-destructive bg-[var(--error-container)] p-4 text-[var(--on-error-container)]">
            <p className="font-semibold">{apiError}</p>
            {apiHint && <p className="mt-1 text-sm">{apiHint}</p>}
          </div>
        )}

        {!claims.length && !isLoadingClaims ? (
          <div className="institutional-card flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="font-display text-2xl font-semibold">Sin datos para visualizar</h2>
              <p className="mt-2 text-sm text-muted-foreground">Conecte el API o cargue un CSV para activar el Command Center.</p>
            </div>
            <button onClick={() => setCurrentStep(1)} className="bg-primary px-5 py-3 label-mono-md font-bold uppercase text-white">Ir a carga de datos</button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.Icon
                return (
                  <div key={kpi.label} className="institutional-card p-5">
                    <div className="flex items-center justify-between">
                      <p className="label-mono-md uppercase text-muted-foreground">{kpi.label}</p>
                      <Icon className="h-5 w-5 text-[var(--on-secondary-container)]" />
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold">{kpi.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{kpi.note}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="institutional-card col-span-12 overflow-hidden xl:col-span-7">
                <div className="section-header flex items-center gap-2"><GitBranch className="h-4 w-4" />Grafo ejecutivo de casos</div>
                <GlobalRelationshipMap claims={claims} onAnalyze={analyzeClaim} />
              </div>
              <div className="institutional-card col-span-12 overflow-hidden xl:col-span-5">
                <div className="section-header flex items-center gap-2"><BarChart3 className="h-4 w-4" />Distribución por semáforo</div>
                <div className="p-4">
                  <ChartContainer config={{ total: { label: 'Casos', color: '#131b2e' } }} className="h-[280px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                      <Pie data={analytics.riskDistribution} dataKey="total" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                        {analytics.riskDistribution.map((entry) => <Cell key={entry.risk} fill={entry.fill} />)}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="grid grid-cols-3 gap-2">
                    {analytics.riskDistribution.map((row) => (
                      <div key={row.risk} className="bg-[var(--surface-low)] p-2 text-center">
                        <p className="label-mono" style={{ color: row.fill }}>{row.name}</p>
                        <p className="font-display text-xl font-semibold">{row.total}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="institutional-card col-span-12 overflow-hidden lg:col-span-4">
                <div className="section-header flex items-center gap-2"><Building2 className="h-4 w-4" />Riesgo por proveedor</div>
                <div className="p-4">
                  <ChartContainer config={{ avgRisk: { label: 'Score promedio', color: '#dc2626' } }} className="h-[240px] w-full">
                    <BarChart data={analytics.providerRows} layout="vertical" margin={{ left: 8, right: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={82} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgRisk" radius={4} fill="var(--color-avgRisk)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
              <div className="institutional-card col-span-12 overflow-hidden lg:col-span-4">
                <div className="section-header flex items-center gap-2"><UsersRound className="h-4 w-4" />Riesgo por ramo</div>
                <div className="p-4">
                  <ChartContainer config={{ avgRisk: { label: 'Score promedio', color: '#f59e0b' } }} className="h-[240px] w-full">
                    <BarChart data={analytics.branchRows} margin={{ left: 4, right: 4 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgRisk" radius={4} fill="var(--color-avgRisk)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
              <div className="institutional-card col-span-12 overflow-hidden lg:col-span-4">
                <div className="section-header flex items-center gap-2"><MapPin className="h-4 w-4" />Riesgo por ciudad</div>
                <div className="p-4">
                  <ChartContainer config={{ avgRisk: { label: 'Score promedio', color: '#505f76' } }} className="h-[240px] w-full">
                    <BarChart data={analytics.cityRows} margin={{ left: 4, right: 4 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgRisk" radius={4} fill="var(--color-avgRisk)" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>

            <div className="institutional-card overflow-hidden">
              <div className="section-header flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><span>Top 10 casos prioritarios (Historial)</span><span>{isLoadingClaims ? 'Sincronizando...' : 'Ordenado por score final'}</span></div>
              <div className="border-b border-border bg-[var(--surface-low)] p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <input
                    value={historyCode}
                    onChange={(e) => setHistoryCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchInHistory()}
                    placeholder="Buscar en historial por código (SIN-046)"
                    className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary md:max-w-sm"
                  />
                  <button onClick={searchInHistory} className="border border-border px-3 py-2 label-mono-md text-muted-foreground hover:text-primary">Buscar</button>
                </div>
                {historyError && <p className="mt-2 text-xs text-destructive">{historyError}</p>}
              </div>
              <div className="overflow-x-auto">
                <table className="zebra w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-[var(--surface-low)]">
                      {['ID', 'Ramo', 'Ciudad', 'Proveedor', 'Monto', 'Score', 'Nivel', 'Alertas', 'Acción'].map((header) => (
                        <th key={header} className="label-mono px-4 py-2 text-muted-foreground">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topCases.map((claim) => {
                      const risk = normalizeRisk(claim.nivel_riesgo)
                      return (
                        <tr key={claim.id_siniestro} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-mono text-sm font-semibold">{claim.id_siniestro}</td>
                          <td className="px-4 py-3 text-sm">{claim.ramo || 'N/D'}</td>
                          <td className="px-4 py-3 text-sm">{claim.ciudad || 'N/D'}</td>
                          <td className="px-4 py-3 font-mono text-xs">{claim.id_proveedor || claim.beneficiario || 'N/D'}</td>
                          <td className="px-4 py-3 font-mono text-xs">{formatCurrency(claim.monto_reclamado)}</td>
                          <td className="px-4 py-3"><span className="font-display text-lg font-semibold">{Math.round(num(claim.score_final))}</span></td>
                          <td className="px-4 py-3"><span className="px-2 py-1 label-mono-md font-bold uppercase text-white" style={{ backgroundColor: getRiskColor(risk) }}>{getRiskLabel(risk)}</span></td>
                          <td className="px-4 py-3 text-sm">{countAlerts(claim)}</td>
                          <td className="px-4 py-3"><button onClick={() => analyzeClaim(claim)} className="bg-primary px-3 py-2 label-mono-md text-white hover:opacity-80">Analizar</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Priorización rápida', text: 'Ordena casos por riesgo para enfocar revisión humana.' },
                { title: 'Patrones visibles', text: 'Expone concentración por proveedor, ramo y ciudad.' },
                { title: 'Explicabilidad', text: 'Conecta la vista ejecutiva con el análisis IA trazable por caso.' },
              ].map((item) => (
                <div key={item.title} className="institutional-card p-5">
                  <Bot className="h-5 w-5 text-[var(--on-secondary-container)]" />
                  <h3 className="mt-3 font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
