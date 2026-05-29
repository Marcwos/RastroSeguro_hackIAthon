'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { Bell, CircleUserRound, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId, setShowCommandBar, userRole, resetUserRole } = useAppState()
  const isAnalyst = userRole === 'analyst'
  const roleLabel = isAnalyst ? 'Analista' : 'Ejecutivo'
  const flowReady = isDataLoaded && selectedClaimId !== null
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K')

  const tabs = useMemo(() => {
    if (isAnalyst) {
      return [
        { step: 1, label: 'Carga', enabled: true },
        { step: 2, label: 'Resumen', enabled: flowReady },
        { step: 3, label: 'Riesgo', enabled: flowReady },
        { step: 4, label: 'Grafo', enabled: flowReady },
      ]
    }
    return [
      { step: 0, label: 'Dashboard', enabled: true },
      { step: 6, label: 'Demo', enabled: true },
      { step: 5, label: 'Caso', enabled: flowReady },
    ]
  }, [flowReady, isAnalyst])

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)) {
      setShortcutLabel('⌘ K')
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 items-center gap-5">
        <span className="font-display text-xl font-bold tracking-tight text-primary lg:hidden">RastroSeguro</span>
        <div className="hidden items-center gap-2 xl:flex">
          <span className="label-mono-md uppercase text-muted-foreground">{isAnalyst ? 'Navegación analista' : 'Navegación ejecutiva'}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary-fixed-dim)]" />
          <span className="label-mono text-muted-foreground">{isAnalyst ? 'Carga y revisión' : 'KPIs e impacto'}</span>
        </div>
        <nav className="hidden items-center gap-5 md:flex" aria-label="Navegación superior por perfil">
          {tabs.map((tab) => (
            <button
              key={tab.step}
              disabled={!tab.enabled}
              aria-current={currentStep === tab.step ? 'page' : undefined}
              onClick={() => tab.enabled && setCurrentStep(tab.step)}
              className={cn(
                'focus-ring rounded-sm pb-1 font-display text-[15px] font-semibold transition-colors',
                currentStep === tab.step ? 'border-b-2 border-primary text-primary' : 'text-foreground hover:text-primary',
                !tab.enabled && 'cursor-not-allowed text-muted-foreground hover:text-muted-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowCommandBar(true)}
          className="focus-ring hidden items-center gap-2 rounded-lg border border-border bg-[var(--surface-low)] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:flex"
          aria-label="Preguntar al agente antifraude"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Preguntar a la IA</span>
          <kbd className="label-mono rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">{shortcutLabel}</kbd>
        </button>
        <button
          type="button"
          onClick={() => setShowCommandBar(true)}
          className="focus-ring rounded-md p-1.5 text-foreground hover:bg-[var(--surface-container)] sm:hidden"
          aria-label="Preguntar al agente antifraude"
        >
          <Search className="h-5 w-5" />
        </button>
        <ThemeToggle />
        <button type="button" aria-label="Notificaciones" className="focus-ring rounded-md p-1.5 text-foreground hover:bg-[var(--surface-container)]">
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={resetUserRole}
          className="focus-ring flex items-center gap-2 rounded-md px-2 py-1 hover:bg-[var(--surface-container)]"
          title="Cambiar perfil de usuario"
        >
          <CircleUserRound className="h-5 w-5 text-foreground" aria-hidden />
          <span className="font-display hidden text-sm font-semibold text-foreground sm:inline">{roleLabel}</span>
        </button>
      </div>
    </header>
  )
}
