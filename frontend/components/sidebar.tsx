'use client'

import Link from 'next/link'
import { useAppState } from '@/lib/app-context'
import { ArrowRight, LayoutDashboard, LockKeyhole, Shield, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId } = useAppState()
  const inFlow = currentStep > 0
  const flowReady = isDataLoaded && selectedClaimId !== null

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-[var(--surface-low)] p-4 lg:flex">
      <div className="mb-8 flex flex-col gap-1">
        <Link href="/" onClick={() => setCurrentStep(0)} className="font-display text-2xl font-bold tracking-tight text-primary">RastroSeguro</Link>
        <span className="font-display text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Risk Intelligence Unit</span>
      </div>

      <nav className="flex-1 space-y-4">
        <button
          onClick={() => setCurrentStep(0)}
          className={cn(
            'font-display flex w-full items-center gap-3 rounded px-3 py-3 text-left text-[15px] font-semibold transition-colors',
            currentStep === 0
              ? 'border-l-4 border-primary bg-[var(--secondary-container)] font-bold text-[var(--on-secondary-container)]'
              : 'text-muted-foreground opacity-75 hover:bg-[var(--surface-high)] hover:opacity-100'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Command Center
        </button>

        <div className="rounded border border-border bg-[var(--surface-high)] p-3">
          <p className="label-mono-md font-bold uppercase text-foreground">Flujo de análisis IA</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Inicia la carga, resumen técnico, evaluación de riesgo y grafo por siniestro.
          </p>
          <button
            onClick={() => setCurrentStep(1)}
            className="mt-4 flex w-full items-center justify-center gap-2 bg-primary px-3 py-2.5 label-mono-md font-bold uppercase text-white hover:opacity-85"
          >
            {inFlow ? 'Volver al flujo' : 'Iniciar análisis'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full', flowReady ? 'bg-[var(--tertiary-fixed-dim)]' : 'bg-border')} />
            {flowReady ? `Caso activo: ${selectedClaimId}` : 'Sin caso activo todavía'}
          </div>
        </div>
      </nav>

      <div className="mt-auto space-y-2 border-t border-border pt-6">
        <button className="font-display flex w-full items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-muted-foreground opacity-80 hover:opacity-100">
          <Shield className="h-4 w-4" /> Security Logs
        </button>
        <button className="font-display flex w-full items-center gap-3 px-3 py-2.5 text-[14px] font-semibold text-muted-foreground opacity-80 hover:opacity-100">
          <Terminal className="h-4 w-4" /> Documentation
        </button>
        <div className="mt-4 rounded border border-border bg-[var(--surface-high)] p-3">
          <div className="mb-1 flex items-center gap-2 text-[var(--on-secondary-container)]"><LockKeyhole className="h-3.5 w-3.5" /><span className="label-mono">Ethical Disclaimer</span></div>
          <p className="label-mono leading-tight text-muted-foreground">La IA alerta y explica. No acusa ni rechaza reclamos.</p>
        </div>
      </div>
    </aside>
  )
}
