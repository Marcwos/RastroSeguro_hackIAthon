'use client'

import Link from 'next/link'
import { useAppState } from '@/lib/app-context'
import { ArrowRight, FileSearch, LayoutDashboard, LockKeyhole, Shield, Star, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId } = useAppState()
  const inFlow = currentStep > 0
  const flowReady = isDataLoaded && selectedClaimId !== null

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-[var(--surface-low)] p-4 lg:flex">
      <div className="mb-8 flex flex-col gap-1">
        <Link href="/" onClick={() => setCurrentStep(0)} className="font-display text-2xl font-bold tracking-tight text-primary">
          RastroSeguro
        </Link>
        <span className="font-display text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Unidad de inteligencia de riesgo
        </span>
      </div>

      <nav className="flex-1 space-y-4" aria-label="Navegación principal">
        <button
          type="button"
          onClick={() => setCurrentStep(0)}
          className={cn(
            'focus-ring font-display flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-[15px] font-semibold transition-colors',
            currentStep === 0
              ? 'border-l-4 border-primary bg-[var(--secondary-container)] font-bold text-[var(--on-secondary-container)]'
              : 'text-foreground hover:bg-[var(--surface-high)]',
          )}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
          Command Center
        </button>

        <div className="rounded-md border border-border bg-[var(--surface-high)] p-3">
          <p className="label-mono-md font-bold uppercase text-foreground">Flujo de análisis IA</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Inicia la carga, resumen técnico, evaluación de riesgo y grafo por siniestro.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="focus-ring mt-4 flex w-full items-center justify-center gap-2 bg-primary px-3 py-2.5 label-mono-md font-bold uppercase text-primary-foreground hover:opacity-95"
          >
            {inFlow ? 'Volver al flujo' : 'Iniciar análisis'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('h-2 w-2 shrink-0 rounded-full', flowReady ? 'bg-[var(--tertiary-fixed-dim)]' : 'bg-border')} />
            {flowReady ? `Caso activo: ${selectedClaimId}` : 'Sin caso activo todavía'}
          </div>
        </div>

        <div className="space-y-2">
          <button
            disabled={!flowReady}
            onClick={() => flowReady && setCurrentStep(5)}
            className={cn(
              'font-display flex w-full items-center gap-3 rounded px-3 py-3 text-left text-[15px] font-semibold transition-colors',
              currentStep === 5
                ? 'border-l-4 border-primary bg-[var(--secondary-container)] font-bold text-[var(--on-secondary-container)]'
                : 'text-muted-foreground opacity-75 hover:bg-[var(--surface-high)] hover:opacity-100',
              !flowReady && 'cursor-not-allowed opacity-40 hover:bg-transparent'
            )}
          >
            <FileSearch className="h-4 w-4" />
            Expediente antifraude
          </button>
          <button
            onClick={() => setCurrentStep(6)}
            className={cn(
              'font-display flex w-full items-center gap-3 rounded px-3 py-3 text-left text-[15px] font-semibold transition-colors',
              currentStep === 6
                ? 'border-l-4 border-primary bg-[var(--secondary-container)] font-bold text-[var(--on-secondary-container)]'
                : 'text-muted-foreground opacity-75 hover:bg-[var(--surface-high)] hover:opacity-100'
            )}
          >
            <Star className="h-4 w-4" />
            Demo ejecutiva
          </button>
        </div>
      </nav>

      <div className="mt-auto space-y-2 border-t border-border pt-6">
        <button type="button" className="focus-ring font-display flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-semibold text-muted-foreground hover:bg-[var(--surface-high)] hover:text-foreground">
          <Shield className="h-4 w-4" aria-hidden /> Registros de seguridad
        </button>
        <button type="button" className="focus-ring font-display flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-semibold text-muted-foreground hover:bg-[var(--surface-high)] hover:text-foreground">
          <Terminal className="h-4 w-4" aria-hidden /> Documentación
        </button>
        <div className="mt-4 rounded-md border border-border bg-[var(--surface-high)] p-3">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="label-mono-md font-bold">Aviso ético</span>
          </div>
          <p className="text-sm leading-snug text-muted-foreground">La IA alerta y explica. No acusa ni rechaza reclamos.</p>
        </div>
      </div>
    </aside>
  )
}
