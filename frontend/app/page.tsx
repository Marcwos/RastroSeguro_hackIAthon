'use client'

import { AppProvider, useAppState } from '@/lib/app-context'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { StepUpload } from '@/components/steps/step-upload'
import { StepSummary } from '@/components/steps/step-summary'
import { StepAnalysis } from '@/components/steps/step-analysis'
import { AIAssistant } from '@/components/ai-assistant'

function MainContent() {
  const { currentStep } = useAppState()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          {currentStep === 1 && <StepUpload />}
          {currentStep === 2 && <StepSummary />}
          {currentStep === 3 && <StepAnalysis />}
        </main>
      </div>
      <AIAssistant />
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
