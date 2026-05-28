'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppState } from '@/lib/app-context'
import { ApiClientError, askAgent, getQuickQuestions } from '@/lib/api'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

function shortenQuestion(text: string, max = 72): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function contextualQuickQuestions(claimId: string | null): string[] {
  if (claimId) {
    return [
      `¿Por qué el siniestro ${claimId} tiene este score?`,
      '¿Qué alertas principales explican el riesgo?',
      '¿Hay narrativas similares o conexiones en el grafo?',
      '¿Qué acción recomienda el motor para este caso?',
    ]
  }
  return [
    '¿Cuáles son los siniestros con mayor riesgo?',
    '¿Qué proveedores concentran más alertas?',
    '¿Qué ramos tienen más casos sospechosos?',
    'Genera un resumen ejecutivo de casos críticos.',
  ]
}

export function AIAssistant() {
  const { showChat, setShowChat, selectedClaimId, chatMessages, addChatMessage } = useAppState()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiQuickQuestions, setApiQuickQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickQuestions = useMemo(() => {
    const base = contextualQuickQuestions(selectedClaimId)
    if (!apiQuickQuestions.length) return base
    const merged = [...base]
    for (const q of apiQuickQuestions) {
      if (!merged.includes(q)) merged.push(q)
    }
    return merged.slice(0, 5)
  }, [apiQuickQuestions, selectedClaimId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  useEffect(() => {
    if (!showChat) return
    void getQuickQuestions()
      .then((questions) => setApiQuickQuestions(questions.slice(0, 3)))
      .catch(() => setApiQuickQuestions([]))
  }, [showChat])

  useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: selectedClaimId
          ? `Conectado al agente antifraude. Puedo explicar el siniestro ${selectedClaimId}, sus alertas y patrones.`
          : 'Conectado al agente antifraude. Selecciona un siniestro en el flujo o haz una pregunta general.',
        timestamp: new Date(),
      })
    }
  }, [showChat, chatMessages.length, selectedClaimId, addChatMessage])

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return

    addChatMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    })

    setInput('')
    setIsTyping(true)

    try {
      const contextualQuestion = selectedClaimId
        ? `${text}\n\nContexto: siniestro ${selectedClaimId}.`
        : text
      const response = await askAgent(contextualQuestion)
      const message = response.message || 'El agente respondió sin texto, pero la consulta fue procesada.'
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
      })
    } catch (error) {
      const message = error instanceof ApiClientError
        ? `${error.message}${error.hint ? `\n\n${error.hint}` : ''}`
        : 'No se pudo consultar al agente antifraude.'
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!showChat && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:opacity-90"
            aria-label="Abrir asistente de riesgo"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChat && (
          <motion.div
            role="dialog"
            aria-label="Asistente de riesgo"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed z-[100] flex flex-col overflow-hidden border border-border bg-card shadow-2xl',
              'bottom-0 right-0 left-0 h-[min(85vh,720px)] rounded-t-2xl',
              'sm:bottom-6 sm:left-auto sm:right-6 sm:h-[min(72vh,640px)] sm:w-[min(100%,420px)] sm:rounded-2xl',
              'lg:w-[440px]',
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-[var(--primary-container)] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">Asistente de Riesgo</p>
                  {selectedClaimId && (
                    <p className="label-mono truncate text-xs text-[var(--primary-fixed-dim)]">
                      Caso {selectedClaimId}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="shrink-0 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Cerrar asistente"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--surface-low)]">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex gap-2.5', message.role === 'user' ? 'flex-row-reverse' : '')}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        message.role === 'assistant' ? 'bg-[var(--secondary-container)]' : 'bg-primary text-primary-foreground',
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4 text-[var(--on-secondary-container)]" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-3 py-2.5 text-sm leading-relaxed',
                        message.role === 'assistant'
                          ? 'border border-border bg-card text-foreground'
                          : 'bg-primary text-primary-foreground',
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--secondary-container)]">
                      <Bot className="h-4 w-4 text-[var(--on-secondary-container)]" />
                    </div>
                    <div className="rounded-lg border border-border bg-card px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 border-t border-border bg-card">
                <div className="max-h-[140px] overflow-y-auto px-3 pt-3">
                  <p className="label-mono mb-2 text-[10px] uppercase text-muted-foreground">Preguntas sugeridas</p>
                  <div className="space-y-1.5">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        title={q}
                        onClick={() => handleSend(q)}
                        disabled={isTyping}
                        className="w-full rounded-md border border-border bg-[var(--surface-low)] px-3 py-2 text-left text-xs leading-snug text-foreground transition-colors hover:border-primary hover:bg-[var(--surface-container)] disabled:opacity-50"
                      >
                        {shortenQuestion(q, 90)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      rows={2}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          void handleSend()
                        }
                      }}
                      placeholder="Escribe tu duda…"
                      className="min-h-[44px] max-h-28 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || isTyping}
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
                        input.trim() && !isTyping
                          ? 'bg-primary text-primary-foreground hover:opacity-90'
                          : 'cursor-not-allowed bg-muted text-muted-foreground',
                      )}
                      aria-label="Enviar mensaje"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    Prioriza revisión humana; no acusa fraude automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
