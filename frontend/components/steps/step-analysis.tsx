'use client'

import { useEffect } from 'react'
import { useAppState } from '@/lib/app-context'
import { alertToText } from '@/lib/api'
import { getRiskBadgeClasses, getActionPanelClasses, getRiskColor, getRiskLabel } from '@/lib/claims-data'
import { AlertTriangle, ArrowLeft, Bot, BrainCircuit, CheckCircle2, Download, FileText, Gavel, Info, Link2, ReceiptText, ShieldAlert, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { safeGraphPayload } from '@/components/graph/graph-utils'

const num = (value: unknown) => Number(value ?? 0)

export function StepAnalysis() {
  const { selectedClaim, selectedClaimId, selectedExplanation, isLoadingExplanation, apiError, apiHint, loadClaimExplanation, setCurrentStep, setShowChat } = useAppState()

  useEffect(() => {
    if (selectedClaim && selectedClaimId && selectedExplanation?.id_siniestro !== selectedClaimId) {
      void loadClaimExplanation(selectedClaimId)
    }
  }, [loadClaimExplanation, selectedClaim, selectedClaimId, selectedExplanation?.id_siniestro])

  if (!selectedClaim) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>No hay caso seleccionado</p>
        <button onClick={() => setCurrentStep(1)} className="focus-ring bg-primary px-4 py-2 text-sm text-primary-foreground">Volver al Paso 1</button>
      </div>
    )
  }

  const scoreFinal = num(selectedExplanation?.score_final ?? selectedClaim.score_final)
  const nivelRiesgo = selectedExplanation?.nivel_riesgo || selectedClaim.nivel_riesgo || 'Sin clasificar'
  const explicacion = selectedExplanation?.explicacion || selectedClaim.explicacion || 'La explicación se cargará desde el motor antifraude cuando el API esté disponible.'
  const accion = selectedExplanation?.accion_sugerida || selectedClaim.accion_sugerida || 'Revisar el caso con criterio humano.'
  const componentes = selectedExplanation?.componentes_score
  const alertas = (selectedExplanation?.alertas?.length ? selectedExplanation.alertas : selectedClaim.alertas_activadas instanceof Array ? selectedClaim.alertas_activadas : []) as unknown[]
  const riskColor = getRiskColor(nivelRiesgo)
  const circumference = 2 * Math.PI * 88
  const dashOffset = circumference - (scoreFinal / 100) * circumference
  const hasCurrentExplanation = selectedExplanation?.id_siniestro === selectedClaimId
  const graphPayload = safeGraphPayload(
    hasCurrentExplanation ? ((selectedExplanation?.detalles_avanzados as Record<string, unknown> | undefined)?.grafo) : null,
    selectedClaim.id_siniestro,
  )

  const drivers = [
    { label: 'Reglas', value: num(componentes?.reglas ?? selectedClaim.score_reglas), desc: 'Reglas críticas activadas.', Icon: Gavel },
    { label: 'Modelo', value: num(componentes?.modelo ?? selectedClaim.score_modelo), desc: 'Señal histórica predictiva.', Icon: ReceiptText },
    { label: 'Anomalías', value: num(componentes?.anomalia ?? selectedClaim.score_anomalia), desc: 'Comportamiento fuera de patrón.', Icon: ShieldAlert },
    { label: 'Narrativa', value: num(componentes?.nlp ?? selectedClaim.score_nlp), desc: 'Texto similar a casos previos.', Icon: FileText },
    { label: 'Relaciones', value: num(componentes?.grafo ?? selectedClaim.score_grafo), desc: 'Entidades recurrentes.', Icon: Link2 },
    { label: 'Categórico', value: num(componentes?.categorico ?? selectedClaim.score_categorico), desc: 'Contexto cualitativo.', Icon: TrendingDown },
  ].sort((a, b) => b.value - a.value)

  const topDrivers = drivers.filter((d) => d.value > 0).slice(0, 3)
  const topAlerts = (alertas.length ? alertas : ['Sin alertas críticas principales.']).slice(0, 3)
  const topEntity = [...graphPayload.recurring_entities].sort((a, b) => b.total_siniestros - a.total_siniestros)[0]
  const relationSummary = topEntity
    ? `${topEntity.type} ${topEntity.value} aparece en ${topEntity.total_siniestros} siniestros.`
    : 'No se detectan entidades recurrentes fuertes en la red del caso.'

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="label-mono uppercase tracking-widest text-muted-foreground">Informe de inteligencia</span>
            <h1 className="display-heading text-3xl lg:text-4xl">Paso 3: Evaluación de Riesgo</h1>
            <p className="mt-2 text-base text-readable text-muted-foreground">Resumen ejecutivo: riesgo, razones principales y acción.</p>
          </div>
          <div className="flex items-center gap-2 border border-border bg-[var(--surface-high)] px-4 py-2">
            <Info className="h-4 w-4" />
            <span className="label-mono">{isLoadingExplanation ? 'CONSULTANDO API...' : 'ANÁLISIS IA DESDE FASTAPI'}</span>
          </div>
        </header>

        {apiError && (
          <div className="border border-destructive bg-[var(--error-container)] p-4 text-[var(--on-error-container)]">
            <p className="font-semibold">{apiError}</p>
            {apiHint && <p className="mt-1 text-sm">{apiHint}</p>}
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <section className="institutional-card col-span-12 p-6 lg:col-span-8">
            <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
              <div className="flex justify-center">
                <div className="relative shrink-0">
                  <svg className="h-48 w-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="var(--surface-high)" strokeWidth="12" />
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke={riskColor} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-5xl">{Math.round(scoreFinal)}</span>
                    <span className="label-mono text-muted-foreground">DE 100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('px-4 py-1 label-mono-md font-bold uppercase', getRiskBadgeClasses(nivelRiesgo))}>{getRiskLabel(nivelRiesgo)}</span>
                  <span className="border border-border bg-[var(--surface-low)] px-3 py-1 label-mono text-foreground">{selectedClaim.id_siniestro}</span>
                </div>
                <p className="text-base text-readable">{explicacion}</p>
                <div className={cn('p-4', getActionPanelClasses(nivelRiesgo))}>
                  <div className="mb-1 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /><span className="label-mono-md font-bold uppercase">Acción recomendada</span></div>
                  <p className="text-sm leading-relaxed">{accion}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="institutional-card col-span-12 p-6 lg:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="label-mono-md font-bold uppercase">Alertas clave</h3>
              <span className="label-mono text-muted-foreground">Top 3</span>
            </div>
            <div className="space-y-3">
              {topAlerts.map((a, i) => (
                <div key={`${i}-${alertToText(a)}`} className="border border-border bg-[var(--surface-low)] p-3">
                  <p className="label-mono text-muted-foreground">ALERTA {String(i + 1).padStart(2, '0')}</p>
                  <p className="mt-1 text-sm">{alertToText(a)}</p>
                </div>
              ))}
            </div>
            {alertas.length > 3 && <p className="mt-3 text-xs text-muted-foreground">+{alertas.length - 3} alertas adicionales disponibles en el detalle.</p>}
          </aside>

          <section className="institutional-card col-span-12 p-6">
            <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
              <div>
                <h2 className="label-mono-md font-bold uppercase">Top 3 razones del riesgo</h2>
                <p className="text-sm text-muted-foreground">Solo mostramos las señales más importantes para evitar ruido visual.</p>
              </div>
              <button onClick={() => setCurrentStep(4)} className="focus-ring self-start border border-border px-4 py-2 label-mono-md text-foreground hover:bg-[var(--surface-container)] md:self-auto">
                Ver análisis completo
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(topDrivers.length ? topDrivers : drivers.slice(0, 3)).map(({ label, value, desc, Icon }, idx) => (
                <div key={label} className="border border-border bg-[var(--surface-low)] p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className="label-mono-md font-bold">{idx + 1}. {label}</span></div>
                    <span className={value > 0 ? 'label-mono-md font-bold text-destructive' : 'label-mono-md text-muted-foreground'}>{value > 0 ? '+' : ''}{Math.round(value * 100) / 100}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="institutional-card col-span-12 p-6 lg:col-span-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="label-mono-md font-bold uppercase">Hipótesis principal de relaciones</h2>
                <p className="mt-2 text-base font-medium">{relationSummary}</p>
                <p className="mt-1 text-sm text-muted-foreground">La red no confirma fraude; sirve para decidir qué comparar primero.</p>
              </div>
              <button onClick={() => setCurrentStep(4)} className="focus-ring flex shrink-0 items-center justify-center gap-2 bg-primary px-5 py-3 label-mono-md text-primary-foreground">
                <BrainCircuit className="h-4 w-4" />Ver red completa
              </button>
            </div>
          </section>

          <aside className="institutional-card col-span-12 p-6 lg:col-span-4">
            <div className="flex items-start gap-3">
              <Info className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-display text-lg font-semibold">Nota legal</h3>
                <p className="mt-1 text-sm italic text-muted-foreground">El score prioriza revisión humana; no acusa ni rechaza automáticamente.</p>
              </div>
            </div>
            <button className="mt-5 flex w-full items-center justify-center gap-2 border border-border py-2 label-mono-md text-muted-foreground"><Download className="h-4 w-4" />Certificado técnico</button>
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t border-border pt-6">
          <button onClick={() => setCurrentStep(2)} className="focus-ring flex items-center gap-2 px-4 py-2 label-mono-md text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Anterior</button>
          <button onClick={() => setShowChat(true)} className="focus-ring flex items-center gap-2 bg-primary px-6 py-2 label-mono-md text-primary-foreground"><Bot className="h-4 w-4" />Consultar IA<CheckCircle2 className="h-4 w-4" /></button>
        </footer>
      </div>
    </section>
  )
}
