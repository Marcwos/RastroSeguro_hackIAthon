'use client'

import { useEffect } from 'react'
import { useAppState } from '@/lib/app-context'
import { alertToText } from '@/lib/api'
import { getRiskColor, getRiskLabel } from '@/lib/claims-data'
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileText, Gavel, Info, Link2, MapPinned, ReceiptText, ShieldAlert, TrendingDown } from 'lucide-react'

export function StepAnalysis() {
  const { selectedClaim, selectedClaimId, selectedExplanation, isLoadingExplanation, apiError, apiHint, loadClaimExplanation, setCurrentStep, setShowChat } = useAppState()
  useEffect(() => {
    if (selectedClaim && selectedClaimId && selectedExplanation?.id_siniestro !== selectedClaimId) {
      void loadClaimExplanation(selectedClaimId)
    }
  }, [loadClaimExplanation, selectedClaim, selectedClaimId, selectedExplanation?.id_siniestro])

  if (!selectedClaim) return <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground"><p>No hay caso seleccionado</p><button onClick={() => setCurrentStep(1)} className="bg-primary px-4 py-2 text-sm text-white">Volver al Paso 1</button></div>
  const scoreFinal = Number(selectedExplanation?.score_final ?? selectedClaim.score_final ?? 0)
  const nivelRiesgo = selectedExplanation?.nivel_riesgo || selectedClaim.nivel_riesgo || 'Sin clasificar'
  const explicacion = selectedExplanation?.explicacion || selectedClaim.explicacion || 'La explicación se cargará desde el motor antifraude cuando el API esté disponible.'
  const accion = selectedExplanation?.accion_sugerida || selectedClaim.accion_sugerida || 'Revisar el caso con criterio humano.'
  const componentes = selectedExplanation?.componentes_score
  const alertas = (selectedExplanation?.alertas?.length ? selectedExplanation.alertas : selectedClaim.alertas_activadas instanceof Array ? selectedClaim.alertas_activadas : []) as unknown[]
  const riskColor = getRiskColor(nivelRiesgo)
  const circumference = 2 * Math.PI * 88
  const dashOffset = circumference - (scoreFinal / 100) * circumference
  const rows = [
    ['Reglas de negocio', componentes?.reglas ?? selectedClaim.score_reglas ?? 0, `Se activaron reglas por fechas, monto o documentación del siniestro.`, Gavel],
    ['Modelo supervisado', componentes?.modelo ?? selectedClaim.score_modelo ?? 0, 'El modelo de Carlos aporta señal predictiva sobre comportamiento histórico.', ReceiptText],
    ['Anomalías', componentes?.anomalia ?? selectedClaim.score_anomalia ?? 0, 'Hay señales que no encajan totalmente con la dinámica reportada.', ShieldAlert],
    ['Narrativa del reclamo', componentes?.nlp ?? selectedClaim.score_nlp ?? 0, 'La descripción comparte frases o estructura con casos previamente revisados.', FileText],
    ['Relaciones recurrentes', componentes?.grafo ?? selectedClaim.score_grafo ?? 0, `Proveedor o entidades conectadas a otros reclamos observados.`, Link2],
    ['Categórico', componentes?.categorico ?? selectedClaim.score_categorico ?? 0, 'Variables cualitativas del caso aportan contexto al score.', TrendingDown],
  ] as const

  return (
    <section className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><span className="label-mono uppercase tracking-widest text-muted-foreground">Intelligence Report</span><h1 className="display-heading text-3xl lg:text-4xl">Paso 3: Evaluación de Riesgo del Siniestro</h1><p className="mt-1 text-muted-foreground">Score explicable para priorizar revisión humana; no confirma fraude.</p></div>
          <div className="flex items-center gap-2 border border-border bg-[var(--surface-high)] px-4 py-2"><Info className="h-4 w-4" /><span className="label-mono">{isLoadingExplanation ? 'CONSULTANDO API...' : 'ANÁLISIS IA DESDE FASTAPI'}</span></div>
        </header>

        {apiError && (
          <div className="border border-destructive bg-[var(--error-container)] p-4 text-[var(--on-error-container)]">
            <p className="font-semibold">{apiError}</p>
            {apiHint && <p className="mt-1 text-sm">{apiHint}</p>}
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="institutional-card col-span-12 flex flex-col items-center gap-8 p-8 md:flex-row lg:col-span-8">
            <div className="relative shrink-0"><svg className="h-48 w-48 -rotate-90"><circle cx="96" cy="96" r="88" fill="transparent" stroke="#e0e3e5" strokeWidth="12"/><circle cx="96" cy="96" r="88" fill="transparent" stroke={riskColor} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={dashOffset}/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-5xl">{Math.round(scoreFinal)}</span><span className="label-mono text-muted-foreground">DE 100</span></div></div>
            <div className="space-y-4"><span className="bg-destructive px-4 py-1 label-mono-md font-bold uppercase text-white">Risk Level: {getRiskLabel(nivelRiesgo)}</span><p className="text-base leading-relaxed">{explicacion}</p><div className="border-l-4 border-destructive bg-[var(--error-container)] p-4 text-[var(--on-error-container)]"><div className="mb-1 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /><span className="label-mono-md font-bold uppercase">Acción Recomendada</span></div><p className="text-sm">{accion}</p></div></div>
          </div>

          <div className="institutional-card col-span-12 flex flex-col justify-between bg-[var(--surface-container)] p-6 lg:col-span-4"><div className="space-y-3"><Info className="h-5 w-5" /><h3 className="font-display text-xl font-semibold">Marco Legal</h3><p className="text-sm italic text-muted-foreground">“Este score es una estimación de riesgo y no constituye una decisión final.”</p></div><button className="mt-6 flex w-full items-center justify-center gap-2 bg-primary py-3 label-mono-md text-white"><Download className="h-4 w-4" />Descargar Certificado Técnico</button></div>

          <div className="institutional-card col-span-12 overflow-hidden lg:col-span-8"><div className="section-header flex justify-between"><span>Hallazgos y patrones que explican el score</span><MapPinned className="h-4 w-4 text-muted-foreground" /></div><div className="overflow-x-auto"><table className="zebra w-full text-left"><thead><tr className="border-b border-border bg-[var(--surface-low)]"><th className="label-mono px-4 py-3 text-muted-foreground">PATRÓN DE RIESGO</th><th className="label-mono px-4 py-3 text-muted-foreground">OBSERVACIÓN / INSIGHT</th><th className="label-mono px-4 py-3 text-right text-muted-foreground">IMPACTO</th></tr></thead><tbody>{rows.map(([label, value, desc, Icon]) => <tr key={label} className="border-b border-border last:border-b-0"><td className="px-4 py-4"><div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className="label-mono-md">{label}</span></div></td><td className="px-4 py-4 text-sm text-muted-foreground">{desc}</td><td className={`px-4 py-4 text-right label-mono-md font-bold ${value < 0 ? 'text-[var(--on-tertiary-fixed)]' : 'text-destructive'}`}>{value > 0 ? '+' : ''}{value} pts</td></tr>)}</tbody></table></div></div>

          <div className="institutional-card col-span-12 p-6 lg:col-span-4"><h3 className="label-mono-md mb-4 font-bold uppercase">Alertas principales</h3><div className="space-y-3">{(alertas.length ? alertas : ['Documentación completa y sin alertas críticas']).map((a, i) => <div key={`${i}-${alertToText(a)}`} className="border border-border bg-[var(--surface-low)] p-3"><p className="label-mono text-muted-foreground">ALERTA {String(i + 1).padStart(2, '0')}</p><p className="mt-1 text-sm">{alertToText(a)}</p></div>)}</div></div>
        </div>

        <footer className="flex items-center justify-between border-t border-border pt-6"><button onClick={() => setCurrentStep(2)} className="flex items-center gap-2 px-4 py-2 label-mono-md text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Anterior</button><p className="label-mono uppercase text-muted-foreground">El score prioriza revisión humana, no acusa ni rechaza.</p><button onClick={() => setShowChat(true)} className="flex items-center gap-2 bg-primary px-6 py-2 label-mono-md text-white">Finalizar<CheckCircle2 className="h-4 w-4" /></button></footer>
      </div>
    </section>
  )
}
