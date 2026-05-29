'use client'

import Link from 'next/link'
import { useAppState } from '@/lib/app-context'
import { ArrowRight, BarChart3, ClipboardList, FileSearch, GitBranch, LayoutDashboard, LockKeyhole, RotateCcw, Shield, Star, Terminal, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

function NavButton({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  disabled?: boolean
  icon: typeof LayoutDashboard
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onClick()}
      className={cn(
        'font-display flex w-full items-center gap-3 rounded px-3 py-3 text-left text-[15px] font-semibold transition-colors',
        active
          ? 'border-l-4 border-primary bg-[var(--secondary-container)] font-bold text-[var(--on-secondary-container)]'
          : 'text-muted-foreground opacity-80 hover:bg-[var(--surface-high)] hover:text-foreground hover:opacity-100',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  )
}

export function Sidebar() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId, userRole, resetUserRole } = useAppState()
  const inFlow = currentStep > 0 && currentStep < 5
  const flowReady = isDataLoaded && selectedClaimId !== null
  const isAnalyst = userRole === 'analyst'
  const roleLabel = isAnalyst ? 'Analista antifraude' : 'Ejecutivo / jurado'

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-[var(--surface-low)] p-4 lg:flex">
      <div className="mb-8 flex flex-col gap-1">
        <Link href="/" onClick={() => setCurrentStep(0)} className="font-display text-2xl font-bold tracking-tight text-primary">
          RastroSeguro
        </Link>
        <span className="font-display text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Unidad de inteligencia de riesgo
        </span>
        <button
          type="button"
          onClick={resetUserRole}
          className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-border bg-[var(--surface-high)] px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {roleLabel}
        </button>
      </div>

      <nav className="flex-1 space-y-4" aria-label="Navegación principal">
        <NavButton active={currentStep === 0} icon={LayoutDashboard} label={isAnalyst ? 'Bandeja operativa' : 'Command Center'} onClick={() => setCurrentStep(0)} />

        {isAnalyst ? (
          <>
            <div className="rounded-md border border-border bg-[var(--surface-high)] p-3">
              <p className="label-mono-md font-bold uppercase text-foreground">Flujo del analista</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Carga CSV, valida datos y revisa siniestros con explicabilidad completa.
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="focus-ring mt-4 flex w-full items-center justify-center gap-2 bg-primary px-3 py-2.5 label-mono-md font-bold uppercase text-primary-foreground hover:opacity-95"
              >
                {inFlow ? 'Volver al flujo' : 'Cargar CSV'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', flowReady ? 'bg-[var(--tertiary-fixed-dim)]' : 'bg-border')} />
                {flowReady ? `Caso activo: ${selectedClaimId}` : 'Sin caso activo todavía'}
              </div>
            </div>

            <div className="space-y-2">
              <p className="label-mono-md px-3 font-bold uppercase text-muted-foreground">Revisión técnica</p>
              <NavButton active={currentStep === 1} icon={UploadCloud} label="Carga CSV" onClick={() => setCurrentStep(1)} />
              <NavButton active={currentStep === 2} disabled={!flowReady} icon={ClipboardList} label="Resumen técnico" onClick={() => setCurrentStep(2)} />
              <NavButton active={currentStep === 3} disabled={!flowReady} icon={BarChart3} label="Riesgo explicable" onClick={() => setCurrentStep(3)} />
              <NavButton active={currentStep === 4} disabled={!flowReady} icon={GitBranch} label="Grafo de relaciones" onClick={() => setCurrentStep(4)} />
              <NavButton active={currentStep === 5} disabled={!flowReady} icon={FileSearch} label="Expediente antifraude" onClick={() => setCurrentStep(5)} />
            </div>
          </>
        ) : (
          <>
            <div className="rounded-md border border-border bg-[var(--surface-high)] p-3">
              <p className="label-mono-md font-bold uppercase text-foreground">Vista ejecutiva</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Sin carga de CSV. Consume KPIs, impacto de negocio, casos críticos y narrativa para decisión.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', flowReady ? 'bg-[var(--tertiary-fixed-dim)]' : 'bg-border')} />
                {flowReady ? `Caso seleccionado: ${selectedClaimId}` : 'Esperando datos del analista'}
              </div>
            </div>

            <div className="space-y-2">
              <p className="label-mono-md px-3 font-bold uppercase text-muted-foreground">Decisión y demo</p>
              <NavButton active={currentStep === 6} icon={Star} label="Demo ejecutiva" onClick={() => setCurrentStep(6)} />
              <NavButton active={currentStep === 5} disabled={!flowReady} icon={FileSearch} label="Caso seleccionado" onClick={() => setCurrentStep(5)} />
            </div>
          </>
        )}
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
