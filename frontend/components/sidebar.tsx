'use client'

import Link from 'next/link'
import { useAppState } from '@/lib/app-context'
import { Upload, FileCheck2, BrainCircuit, Share2, Shield, Terminal, LockKeyhole } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { step: 1, label: 'Information Upload', icon: Upload },
  { step: 2, label: 'Case Summary', icon: FileCheck2 },
  { step: 3, label: 'Risk Analysis', icon: BrainCircuit },
  { step: 4, label: 'Graph Intelligence', icon: Share2 },
]

export function Sidebar() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId } = useAppState()
  const canNavigateTo = (step: number) => step === 1 || (isDataLoaded && selectedClaimId !== null)

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-[var(--surface-low)] p-4 lg:flex">
      <div className="mb-8 flex flex-col gap-1">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-primary">RastroSeguro</Link>
        <span className="font-display text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">Risk Intelligence Unit</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = currentStep === item.step
          const enabled = canNavigateTo(item.step)
          return (
            <button
              key={item.step}
              onClick={() => enabled && setCurrentStep(item.step)}
              disabled={!enabled}
              className={cn(
                'font-display text-[15px] font-semibold flex w-full items-center gap-3 rounded px-3 py-3 text-left transition-colors',
                active && 'border-l-4 border-primary bg-[var(--secondary-container)] font-bold text-[var(--on-secondary-container)]',
                !active && enabled && 'text-muted-foreground opacity-75 hover:bg-[var(--surface-high)] hover:opacity-100',
                !enabled && 'cursor-not-allowed text-muted-foreground opacity-35'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-border pt-6">
        <button className="font-display text-[14px] font-semibold flex w-full items-center gap-3 px-3 py-2.5 text-muted-foreground opacity-80 hover:opacity-100">
          <Shield className="h-4 w-4" /> Security Logs
        </button>
        <button className="font-display text-[14px] font-semibold flex w-full items-center gap-3 px-3 py-2.5 text-muted-foreground opacity-80 hover:opacity-100">
          <Terminal className="h-4 w-4" /> Documentation
        </button>
        <div className="mt-4 rounded border border-border bg-[var(--surface-high)] p-3">
          <div className="mb-1 flex items-center gap-2 text-[var(--on-secondary-container)]"><LockKeyhole className="h-3.5 w-3.5" /><span className="label-mono">Ethical Disclaimer</span></div>
          <p className="label-mono text-muted-foreground leading-tight">La IA alerta y explica. No acusa ni rechaza reclamos.</p>
        </div>
      </div>
    </aside>
  )
}
