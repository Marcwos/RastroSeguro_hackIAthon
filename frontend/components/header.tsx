'use client'

import { useAppState } from '@/lib/app-context'
import { Bell, CircleUserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { step: 1, label: 'Upload Data' },
  { step: 2, label: 'Fact Summary' },
  { step: 3, label: 'Risk Analysis' },
]

export function Header() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId } = useAppState()
  const canNavigateTo = (step: number) => step === 1 || (isDataLoaded && selectedClaimId)

  return (
    <header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between border-b border-border bg-background px-4 lg:px-8">
      <div className="flex items-center gap-8">
        <span className="font-display text-2xl font-bold tracking-tight text-primary lg:hidden">RastroSeguro</span>
        <nav className="hidden items-center gap-6 md:flex">
          {tabs.map((tab) => (
            <button
              key={tab.step}
              disabled={!canNavigateTo(tab.step)}
              onClick={() => canNavigateTo(tab.step) && setCurrentStep(tab.step)}
              className={cn(
                'font-display text-[15px] font-semibold pb-1 transition-colors',
                currentStep === tab.step ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-primary',
                !canNavigateTo(tab.step) && 'cursor-not-allowed opacity-40 hover:text-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded p-1.5 text-foreground hover:bg-[var(--surface-container)]"><Bell className="h-5 w-5" /></button>
        <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-[var(--surface-container)]">
          <CircleUserRound className="h-5 w-5" />
          <span className="font-display text-sm font-semibold hidden sm:inline">Operator_Admin</span>
        </div>
      </div>
    </header>
  )
}
