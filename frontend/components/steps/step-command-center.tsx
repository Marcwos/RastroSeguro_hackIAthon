'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, BarChart3, Bot, Building2, CircleDollarSign, MapPin, FileSearch, GitBranch, ShieldCheck, Target, UploadCloud, UsersRound } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAppState } from '@/lib/app-context'
import { ClaimSummary } from '@/lib/api'
import { formatCurrency, getRiskColor, getRiskLabel } from '@/lib/claims-data'

const num = (value: unknown) => Number(value ?? 0)
const riskOrder = ['critico', 'alto', 'medio', 'bajo']

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

function groupRows(claims: ClaimSummary[], key: keyof ClaimSummary, limit = 6) {
  const rows = new Map<string, { name: string; total: number; risk: number }>()
  claims.forEach((claim) => {
    const name = String(claim[key] || 'No informado')
    const current = rows.get(name) || { name, total: 0, risk: 0 }
    current.total += 1
    current.risk += num(claim.score_final)
    rows.set(name, current)
  })
  return [...rows.values()]
    .map((row) => ({ ...row, avgRisk: row.total ? Math.round(row.risk / row.total) : 0 }))
    .sort((a, b) => b.avgRisk - a.avgRisk || b.total - a.total)
    .slice(0, limit)
}

function GlobalRelationshipMap({ claims, onAnalyze }: { claims: ClaimSummary[]; onAnalyze: (claim: ClaimSummary) => void }) {
  const [hoveredClaim, setHoveredClaim] = useState<ClaimSummary | null>(null)
  const topClaims = [...claims].sort((a, b) => num(b.score_final) - num(a.score_final)).slice(0, 9)
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

  useEffect(() => {
    if (!claims.length) void loadClaims()
  }, [claims.length, loadClaims])

  const analytics = useMemo(() => {
    const total = claims.length
    const totalAmount = claims.reduce((acc, claim) => acc + num(claim.monto_reclamado), 0)
    const averageScore = total ? Math.round(claims.reduce((acc, claim) => acc + num(claim.score_final), 0) / total) : 0
    const counts = claims.reduce<Record<string, number>>((acc, claim) => {
      const risk = normalizeRisk(claim.nivel_riesgo)
      acc[risk] = (acc[risk] || 0) + 1
      return acc
    }, {})
    const riskDistribution = riskOrder
      .map((risk) => ({ name: getRiskLabel(risk), risk, total: counts[risk] || 0, fill: getRiskColor(risk) }))
      .filter((row) => row.total > 0)
    const providerRows = groupRows(claims, 'id_proveedor')
    const branchRows = groupRows(claims, 'ramo')
    const cityRows = groupRows(claims, 'ciudad')
    const topCases = [...claims].sort((a, b) => num(b.score_final) - num(a.score_final)).slice(0, 10)
    const criticalCount = claims.filter((claim) => ['critico', 'alto'].includes(normalizeRisk(claim.nivel_riesgo))).length
    const mediumCount = counts.medio || 0
    return { total, totalAmount, averageScore, riskDistribution, providerRows, branchRows, cityRows, topCases, criticalCount, mediumCount, topProvider: providerRows[0]?.name || 'N/D' }
  }, [claims])

  const analyzeClaim = (claim: ClaimSummary) => {
    setSelectedClaimId(claim.id_siniestro)
    setIsDataLoaded(true)
    setCurrentStep(2)
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
              <button onClick={() => void loadClaims()} className="inline-flex items-center justify-center gap-2 border border-[var(--primary-fixed-dim)] px-5 py-3 label-mono-md font-bold uppercase text-white hover:bg-white/10">
                Sincronizar datos
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
              <div className="section-header flex items-center justify-between"><span>Top 10 casos prioritarios</span><span>{isLoadingClaims ? 'Sincronizando...' : 'Ordenado por score final'}</span></div>
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
