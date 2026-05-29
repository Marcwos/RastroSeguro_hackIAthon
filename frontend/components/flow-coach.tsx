'use client'

import { ArrowRight, Bot, CheckCircle2, Circle, LockKeyhole, UploadCloud } from 'lucide-react'
import { useAppState } from '@/lib/app-context'
import { cn } from '@/lib/utils'

const analystSteps = [
  { step: 1, label: 'Cargar datos', helper: 'Sube o selecciona el CSV.' },
  { step: 2, label: 'Validar caso', helper: 'Revisa datos clave antes del score.' },
  { step: 3, label: 'Explicar riesgo', helper: 'Entiende reglas, ML, NLP y grafo.' },
  { step: 4, label: 'Ver relaciones', helper: 'Encuentra patrones conectados.' },
  { step: 5, label: 'Cerrar expediente', helper: 'Deja evidencia accionable.' },
]

const executiveSteps = [
  { step: 0, label: 'Panorama', helper: 'KPIs y concentraciones.' },
  { step: 6, label: 'Impacto', helper: 'Prioridad e impacto de negocio.' },
  { step: 5, label: 'Caso foco', helper: 'Detalle trazable del siniestro.' },
]

function getCurrentAction({
  currentStep,
  flowReady,
  isAnalyst,
  selectedClaimId,
}: {
  currentStep: number
  flowReady: boolean
  isAnalyst: boolean
  selectedClaimId: string | null
}) {
  if (isAnalyst) {
    if (!flowReady) {
      return {
        title: 'Empieza cargando datos',
        body: 'Sube un CSV o sincroniza el API. Cuando exista un caso activo se habilitan resumen, riesgo, grafo y expediente.',
        action: 'Ir a carga',
        target: 1,
      }
    }
    if (currentStep === 1) {
      return {
        title: `Continua con ${selectedClaimId}`,
        body: 'El archivo ya esta listo. Pasa al resumen tecnico para confirmar datos antes de analizar el riesgo.',
        action: 'Ver resumen',
        target: 2,
      }
    }
    if (currentStep === 2) {
      return { title: 'Siguiente: explicar riesgo', body: 'Revisa que los datos del caso sean correctos y abre el score explicable.', action: 'Analizar riesgo', target: 3 }
    }
    if (currentStep === 3) {
      return { title: 'Siguiente: relaciones', body: 'Complementa el score con conexiones de proveedor, narrativa y patrones similares.', action: 'Ver grafo', target: 4 }
    }
    return { title: 'Cierra con evidencia', body: 'Usa el expediente para resumir hallazgos, alertas y recomendacion para revision humana.', action: 'Abrir expediente', target: 5 }
  }

  if (!flowReady) {
    return {
      title: 'Vista lista para datos',
      body: 'El panel muestra el panorama cuando el analista carga o sincroniza siniestros. Mientras tanto puedes revisar impacto y simulador.',
      action: 'Ver impacto',
      target: 6,
    }
  }

  if (currentStep === 5) {
    return { title: `Caso foco: ${selectedClaimId}`, body: 'Revisa el detalle trazable y vuelve al panorama para comparar contra la cartera.', action: 'Volver al panel', target: 0 }
  }

  return {
    title: 'Convierte KPIs en decision',
    body: `Hay un caso activo (${selectedClaimId}). Puedes entrar al expediente o consultar al agente para explicar el riesgo.`,
    action: 'Abrir caso',
    target: 5,
  }
}

export function FlowCoach() {
  const { currentStep, setCurrentStep, isDataLoaded, selectedClaimId, userRole, setShowCommandBar } = useAppState()
  if (!userRole) return null

  const isAnalyst = userRole === 'analyst'
  const flowReady = isDataLoaded && selectedClaimId !== null
  const steps = isAnalyst ? analystSteps : executiveSteps
  const currentAction = getCurrentAction({ currentStep, flowReady, isAnalyst, selectedClaimId })
  const currentIndex = Math.max(0, steps.findIndex((item) => item.step === currentStep))
  const progress = flowReady ? Math.round(((currentIndex + 1) / steps.length) * 100) : isAnalyst ? 8 : 34

  return (
    <section className="border-b border-border bg-[var(--surface-lowest)] px-4 py-4 lg:px-8" aria-label="Guia de uso">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="institutional-card overflow-hidden">
          <div className="grid gap-4 p-4 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div className="min-w-0">
              <p className="label-mono-md uppercase text-muted-foreground">Que hacer ahora</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{currentAction.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{currentAction.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentAction.target)}
                  className="focus-ring inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 label-mono-md font-bold uppercase text-primary-foreground hover:opacity-95"
                >
                  {currentAction.action}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommandBar(true)}
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 label-mono-md font-bold uppercase text-foreground hover:bg-[var(--surface-container)]"
                >
                  <Bot className="h-4 w-4" aria-hidden />
                  Preguntar a IA
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="label-mono text-muted-foreground">Avance del flujo</span>
                <span className="label-mono-md font-bold text-foreground">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-container)]">
                <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
              <ol className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {steps.map((item, index) => {
                  const locked = isAnalyst ? item.step > 1 && !flowReady : item.step === 5 && !flowReady
                  const active = currentStep === item.step
                  const complete = flowReady && index < currentIndex
                  return (
                    <li key={item.step}>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => setCurrentStep(item.step)}
                        title={locked ? 'Carga o sincroniza datos para habilitar este paso' : item.helper}
                        className={cn(
                          'focus-ring flex h-full min-h-16 w-full items-start gap-2 rounded-md border px-3 py-2 text-left transition-[background-color,border-color,color]',
                          active ? 'border-primary bg-[var(--secondary-container)] text-[var(--on-secondary-container)]' : 'border-border bg-background text-foreground hover:border-primary',
                          locked && 'cursor-not-allowed opacity-45 hover:border-border',
                        )}
                      >
                        {locked ? (
                          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        ) : complete ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--risk-verde)]" aria-hidden />
                        ) : active ? (
                          <UploadCloud className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{item.label}</span>
                          <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{locked ? 'Primero activa un caso.' : item.helper}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
