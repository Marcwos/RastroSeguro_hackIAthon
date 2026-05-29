'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppState } from '@/lib/app-context'
import { ApiClientError, askAgent, getQuickQuestions, type AgentResponse } from '@/lib/api'
import { AgentResult } from '@/components/agent/agent-result'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Command as CommandIcon, CornerDownLeft, Loader2, Search, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'

const JUDGE_PROMPTS = [
  '¿Qué proveedores concentran el 80% de las alertas rojas?',
  '¿Cuáles son los 10 siniestros con mayor riesgo de posible fraude?',
  'Recomienda qué casos debería revisar primero el analista.',
]

const EXPLORE_PROMPTS = [
  'Genera un resumen ejecutivo de los casos críticos.',
  '¿Qué ramos tienen mayor porcentaje de casos sospechosos?',
  '¿Qué ciudades presentan mayor concentración de alertas?',
  '¿Qué documentos faltan en los casos críticos?',
]

export function CommandBar() {
  const {
    showCommandBar,
    setShowCommandBar,
    selectedClaimId,
    setSelectedClaimId,
    setCurrentStep,
  } = useAppState()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  const [apiPrompts, setApiPrompts] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!showCommandBar) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 60)
    void getQuickQuestions()
      .then((q) => setApiPrompts(q.slice(0, 3)))
      .catch(() => setApiPrompts([]))
    return () => window.clearTimeout(id)
  }, [showCommandBar])

  const close = useCallback(() => {
    setShowCommandBar(false)
  }, [setShowCommandBar])

  const runQuery = useCallback(
    async (text: string) => {
      const question = text.trim()
      if (!question || isLoading) return
      setIsLoading(true)
      setError(null)
      setLastQuestion(question)
      try {
        const contextual = selectedClaimId ? `${question}\n\nContexto: siniestro ${selectedClaimId}.` : question
        const result = await askAgent(contextual)
        setResponse(result)
      } catch (err) {
        setResponse(null)
        setError(
          err instanceof ApiClientError
            ? `${err.message}${err.hint ? ` ${err.hint}` : ''}`
            : 'No se pudo consultar al agente antifraude.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, selectedClaimId],
  )

  const handleOpenClaim = useCallback(
    (id: string) => {
      setSelectedClaimId(id)
      setCurrentStep(3)
      close()
    },
    [setSelectedClaimId, setCurrentStep, close],
  )

  const suggestions = useMemo(() => {
    const explore = [...EXPLORE_PROMPTS]
    for (const q of apiPrompts) if (!explore.includes(q) && !JUDGE_PROMPTS.includes(q)) explore.unshift(q)
    return { judge: JUDGE_PROMPTS, explore: explore.slice(0, 4) }
  }, [apiPrompts])

  return (
    <AnimatePresence>
      {showCommandBar && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-label="Consultar al agente antifraude"
            initial={reduceMotion ? false : { opacity: 0, y: -16, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="relative z-10 flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-border/60"
          >
            <div className="flex items-center gap-3 border-b border-border bg-[var(--surface-container)] px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary-container)] text-[var(--on-secondary-container)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <form
                className="flex flex-1 items-center"
                onSubmit={(e) => {
                  e.preventDefault()
                  void runQuery(input)
                }}
              >
                <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta en lenguaje natural sobre tus siniestros…"
                  className="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </form>
              {selectedClaimId && (
                <span className="hidden shrink-0 rounded-full border border-border bg-[var(--surface-low)] px-2.5 py-1 label-mono text-[11px] text-muted-foreground sm:inline">
                  Caso {selectedClaimId}
                </span>
              )}
              <button
                type="button"
                onClick={close}
                className="focus-ring shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-[var(--surface-high)] hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface-low)]">
              {isLoading && (
                <div className="flex items-center gap-3 px-4 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando con el motor antifraude…
                </div>
              )}

              {!isLoading && error && (
                <div className="m-4 rounded-lg border border-destructive bg-[var(--error-container)] p-3 text-sm text-[var(--on-error-container)]">
                  {error}
                </div>
              )}

              {!isLoading && !error && response && (
                <div className="space-y-2 p-4">
                  {lastQuestion && (
                    <p className="label-mono text-[11px] uppercase text-muted-foreground">{lastQuestion}</p>
                  )}
                  <AgentResult response={response} onOpenClaim={handleOpenClaim} />
                </div>
              )}

              {!isLoading && !error && !response && (
                <div className="space-y-4 p-4">
                  <PromptGroup
                    icon={<Zap className="h-3.5 w-3.5 text-[var(--risk-amarillo)]" />}
                    title="Pruebas de fuego del jurado"
                    prompts={suggestions.judge}
                    onPick={(q) => {
                      setInput(q)
                      void runQuery(q)
                    }}
                  />
                  <PromptGroup
                    icon={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                    title="Exploración rápida"
                    prompts={suggestions.explore}
                    onPick={(q) => {
                      setInput(q)
                      void runQuery(q)
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Respuestas trazables del motor RastroSeguro.
              </span>
              <span className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
                <kbd className="inline-flex items-center gap-1 rounded border border-border bg-[var(--surface-low)] px-1.5 py-0.5">
                  <CornerDownLeft className="h-3 w-3" /> Enviar
                </kbd>
                <kbd className="inline-flex items-center gap-1 rounded border border-border bg-[var(--surface-low)] px-1.5 py-0.5">
                  <CommandIcon className="h-3 w-3" />K
                </kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PromptGroup({
  icon,
  title,
  prompts,
  onPick,
}: {
  icon: React.ReactNode
  title: string
  prompts: string[]
  onPick: (q: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 label-mono text-[11px] uppercase text-muted-foreground">
        {icon}
        {title}
      </p>
      <div className="space-y-1.5">
        {prompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className={cn(
              'focus-ring flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors',
              'hover:border-primary hover:bg-[var(--surface-container)]',
            )}
          >
            <span className="flex-1">{q}</span>
            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
