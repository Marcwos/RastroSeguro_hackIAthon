'use client'

import { useEffect, useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { Bell, CircleUserRound, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

const tabs = [
  { step: 1, label: 'Carga' },
  { step: 2, label: 'Resumen' },
  { step: 3, label: 'Riesgo' },
  { step: 4, label: 'Grafo' },
]

export function Header() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId, setShowCommandBar } = useAppState()
  const canNavigateTo = (step: number) => step === 1 || (isDataLoaded && selectedClaimId)
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K')

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)) {
      setShortcutLabel('⌘ K')
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-8">
        <span className="font-display text-xl font-bold tracking-tight text-primary lg:hidden">RastroSeguro</span>
        {currentStep === 0 ? (
          <div className="hidden items-center gap-2 md:flex">
            <span className="label-mono-md uppercase text-muted-foreground">Command Center</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tertiary-fixed-dim)]" />
            <span className="label-mono text-muted-foreground">Vista ejecutiva</span>
          </div>
        ) : (
          <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
            {tabs.map((tab) => (
              <button
                key={tab.step}
                disabled={!canNavigateTo(tab.step)}
                aria-current={currentStep === tab.step ? 'page' : undefined}
                onClick={() => canNavigateTo(tab.step) && setCurrentStep(tab.step)}
                className={cn(
                  'focus-ring font-display text-[15px] font-semibold rounded-sm pb-1 transition-colors',
                  currentStep === tab.step ? 'border-b-2 border-primary text-primary' : 'text-foreground hover:text-primary',
                  !canNavigateTo(tab.step) && 'cursor-not-allowed text-muted-foreground hover:text-muted-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
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
        <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-[var(--surface-container)]">
          <CircleUserRound className="h-5 w-5 text-foreground" aria-hidden />
          <span className="font-display text-sm font-semibold hidden sm:inline text-foreground">Operador</span>
        </div>
      </div>
    </header>
  )
}
