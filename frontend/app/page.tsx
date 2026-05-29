'use client'

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
import { useEffect } from 'react'

function MainContent() {
  const { currentStep, showCommandBar, setShowCommandBar } = useAppState()

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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          {currentStep === 0 && <StepCommandCenter />}
          {currentStep === 1 && <StepUpload />}
          {currentStep === 2 && <StepSummary />}
          {currentStep === 3 && <StepAnalysis />}
          {currentStep === 4 && <StepIntelligence />}
          {currentStep === 5 && <StepDossier />}
          {currentStep === 6 && <StepExecutiveDemo />}
        </main>
      </div>
      <AIAssistant />
      <CommandBar />
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  )
}
