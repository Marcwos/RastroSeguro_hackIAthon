'use client'

import { FileSearch, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppState } from '@/lib/app-context'
import { StepCaseReportTab } from '@/components/steps/step-case-report-tab'
import { StepDossier } from '@/components/steps/step-dossier'

export function StepCaseClosure() {
  const { userRole, setCurrentStep } = useAppState()
  const isExecutive = userRole === 'executive'

  return (
    <section className="px-3 py-5 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header>
          <span className="label-mono uppercase tracking-widest text-muted-foreground">
            {isExecutive ? 'Resumen ejecutivo' : 'Cierre del caso'}
          </span>
          <h1 className="display-heading text-3xl lg:text-4xl">
            {isExecutive ? 'Reporte ejecutivo del caso' : 'Paso 5: Reporte final'}
          </h1>
          <p className="mt-2 max-w-3xl text-base text-readable text-muted-foreground">
            {isExecutive
              ? 'Resumen del caso seleccionado, senales principales, impacto y expediente de respaldo para decision.'
              : 'Consolidacion del puntaje, recorrido por etapas, graficos explicados y exportacion del reporte del caso.'}
          </p>
        </header>

        <Tabs defaultValue="report" className="w-full">
          <TabsList>
            <TabsTrigger value="report" className="gap-2">
              <FileText className="h-4 w-4" />
              Reporte
            </TabsTrigger>
            <TabsTrigger value="dossier" className="gap-2">
              <FileSearch className="h-4 w-4" />
              Expediente
            </TabsTrigger>
          </TabsList>
          <TabsContent value="report" className="mt-4">
            <StepCaseReportTab compact={isExecutive} />
          </TabsContent>
          <TabsContent value="dossier" className="mt-4">
            <StepDossier embedded />
          </TabsContent>
        </Tabs>

        <footer className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep(isExecutive ? 0 : 4)}
            className="label-mono-md text-muted-foreground hover:text-primary"
          >
            {isExecutive ? '← Volver al panel' : '← Volver a relaciones'}
          </button>
        </footer>
      </div>
    </section>
  )
}
