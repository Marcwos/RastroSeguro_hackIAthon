'use client'

import { useEffect } from 'react'
import { AppProvider, useAppState } from '@/lib/app-context'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StepCommandCenter } from '@/components/steps/step-command-center'
import { StepUpload } from '@/components/steps/step-upload'
import { StepSummary } from '@/components/steps/step-summary'
import { StepAnalysis } from '@/components/steps/step-analysis'
import { StepIntelligence } from '@/components/steps/step-intelligence'
import { StepDossier } from '@/components/steps/step-dossier'
import { StepExecutiveDemo } from '@/components/steps/step-executive-demo'
import { AIAssistant } from '@/components/ai-assistant'
import { CommandBar } from '@/components/command-bar'
import { RoleSelector } from '@/components/role-selector'
import { MobileNav } from '@/components/mobile-nav'
import { FlowCoach } from '@/components/flow-coach'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const STEP_VIEWS: Record<number, React.ComponentType> = {
  0: StepCommandCenter,
  1: StepUpload,
  2: StepSummary,
  3: StepAnalysis,
  4: StepIntelligence,
  5: StepDossier,
  6: StepExecutiveDemo,
}

function MainContent() {
  const { currentStep, showCommandBar, setShowCommandBar, userRole, setCurrentStep } = useAppState()

  useEffect(() => {
    if (userRole === 'executive' && currentStep >= 1 && currentStep <= 4) {
      setCurrentStep(0)
    }
  }, [currentStep, setCurrentStep, userRole])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowCommandBar(!showCommandBar)
        return
      }
      if (event.key === 'Escape' && showCommandBar) {
        setShowCommandBar(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showCommandBar, setShowCommandBar])

  const reduceMotion = useReducedMotion()
  const StepView = STEP_VIEWS[currentStep] ?? StepCommandCenter

  if (!userRole) return <RoleSelector />

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />
        <FlowCoach />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-6px)' }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            >
              <StepView />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIAssistant />
      <CommandBar />
      <MobileNav />
    </div>
  )
}

export default function PlatformPage() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}
