'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppState } from '@/lib/app-context'
import { AgentChatMessage, AgentChatSection, AgentChatSessionSummary, ApiClientError, chatAgent, getAgentSessions, getAgentThread, getQuickQuestions } from '@/lib/api'
import { AgentResult } from '@/components/agent/agent-result'
import { History, MessageCircle, Plus, X, Send, Bot, User } from 'lucide-react'
import { cn, sanitizeAiText } from '@/lib/utils'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const THREAD_STORAGE_KEY = 'rastroseguro-agent-thread-id'
const USER_STORAGE_KEY = 'rastroseguro-agent-user-id'

function shortenQuestion(text: string, max = 72): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}


function normalizeAssistantText(text: string): string {
  return sanitizeAiText(
    text
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  )
}

function contextualQuickQuestions(claimId: string | null): string[] {
  if (claimId) {
    return [
      `¿Por qué el siniestro ${claimId} tiene este puntaje de riesgo?`,
      '¿Qué alertas principales explican el riesgo?',
      '¿Hay narrativas similares o conexiones en la red de relaciones?',
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

function toUiMessage(message: AgentChatMessage) {
  const normalizedContent = message.role === 'assistant'
    ? normalizeAssistantText(message.content)
    : message.content
  const response = message.role === 'assistant' && (message.intent || message.data !== undefined)
    ? {
        ok: typeof message.metadata?.ok === 'boolean' ? Boolean(message.metadata.ok) : true,
        intent: message.intent || undefined,
        message: normalizedContent,
        data: message.data,
        source: message.source || undefined,
        llm: typeof message.metadata?.llm === 'object' ? message.metadata.llm as Record<string, unknown> : undefined,
        runtime: typeof message.metadata?.runtime === 'object' ? message.metadata.runtime as Record<string, unknown> : undefined,
      }
    : undefined
  return {
    id: message.id,
    sectionId: message.section_id || null,
    role: message.role,
    content: normalizedContent,
    timestamp: new Date(message.timestamp),
    response,
  } as const
}

function ensureLocalUserId(): string {
  try {
    const saved = window.localStorage.getItem(USER_STORAGE_KEY)
    if (saved) return saved
    const generated = crypto.randomUUID()
    window.localStorage.setItem(USER_STORAGE_KEY, generated)
    return generated
  } catch {
    return 'anonymous'
  }
}

export function AIAssistant() {
  const { showChat, setShowChat, selectedClaimId, setSelectedClaimId, setIsDataLoaded, setCurrentStep, userRole, chatMessages, addChatMessage, replaceChatMessages } = useAppState()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiQuickQuestions, setApiQuickQuestions] = useState<string[]>([])
  const [userId, setUserId] = useState('anonymous')
  const [threadId, setThreadId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<AgentChatSessionSummary[]>([])
  const [sections, setSections] = useState<AgentChatSection[]>([])
  const [showSessionHistory, setShowSessionHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

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
    const resolvedUserId = ensureLocalUserId()
    setUserId(resolvedUserId)
    try {
      const savedThreadId = window.localStorage.getItem(`${THREAD_STORAGE_KEY}:${resolvedUserId}`)
      if (savedThreadId) {
        setThreadId(savedThreadId)
      }
    } catch {
      setThreadId(null)
    }
  }, [])

  useEffect(() => {
    try {
      if (threadId) {
        window.localStorage.setItem(`${THREAD_STORAGE_KEY}:${userId}`, threadId)
      } else {
        window.localStorage.removeItem(`${THREAD_STORAGE_KEY}:${userId}`)
      }
    } catch {
      // Ignore storage restrictions in embedded browsers.
    }
  }, [threadId, userId])

  const refreshSessions = () => {
    void getAgentSessions(userId)
      .then(setSessions)
      .catch(() => setSessions([]))
  }

  useEffect(() => {
    if (!showChat) return
    void getQuickQuestions()
      .then((questions) => setApiQuickQuestions(questions.slice(0, 3)))
      .catch(() => setApiQuickQuestions([]))
    refreshSessions()
  }, [showChat, userId])

  useEffect(() => {
    if (!showChat || !threadId) return
    void getAgentThread(threadId, userId)
      .then((session) => {
        setSections(session.sections)
        replaceChatMessages(session.history.map(toUiMessage))
      })
      .catch(() => {
        setThreadId(null)
        setSections([])
      })
  }, [showChat, threadId, userId, replaceChatMessages])

  useEffect(() => {
    if (showChat && chatMessages.length === 0 && !threadId) {
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

  const openClaim = (id: string) => {
    setSelectedClaimId(id)
    setIsDataLoaded(true)
    setCurrentStep(userRole === 'executive' ? 5 : 3)
    setShowChat(false)
  }

  const startNewSession = () => {
    setThreadId(null)
    setSections([])
    setShowSessionHistory(false)
    replaceChatMessages([])
  }

  const openSession = (sessionId: string) => {
    setThreadId(sessionId)
    setShowSessionHistory(false)
  }

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
      const session = await chatAgent({
        message: text,
        userId,
        threadId,
        selectedClaimId,
        runtime: 'classic',
      })
      setThreadId(session.thread_id)
      setSections(session.sections)
      replaceChatMessages(session.history.map((message) => {
        const mapped = toUiMessage(message)
        if (message.id === session.history[session.history.length - 1]?.id && mapped.role === 'assistant') {
          return {
            ...mapped,
            response: session.reply,
          }
        }
        return mapped
      }))
      refreshSessions()
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

  const sectionTitleById = useMemo(() => {
    return new Map(sections.map((section) => [section.section_id, section.title]))
  }, [sections])

  return (
    <>
      <AnimatePresence>
        {!showChat && (
          <motion.button
            type="button"
            initial={reduceMotion ? false : { y: 12, opacity: 0, scale: 0.95 }}
            animate={reduceMotion ? undefined : {
              y: 0,
              opacity: 1,
              scale: [1, 1.06, 1],
              boxShadow: ['0 0 0 0 rgba(79,70,229,0.35)', '0 0 0 12px rgba(79,70,229,0)', '0 0 0 0 rgba(79,70,229,0)'],
            }}
            transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, repeatDelay: 1.2 }}
            exit={reduceMotion ? undefined : { y: 12, opacity: 0 }}
            onClick={() => setShowChat(true)}
            className="focus-ring fixed bottom-5 left-1/2 z-[100] flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-lg"
            aria-label="Abrir asistente de riesgo"
          >
            <MessageCircle className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChat && (
          <motion.div
            role="dialog"
            aria-label="Asistente de riesgo"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className={cn(
              'fixed bottom-20 left-1/2 z-[100] flex -translate-x-1/2 flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-border/60 dark:shadow-black/40',
              'h-[min(62vh,520px)] w-[min(94vw,560px)] rounded-2xl',
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-[var(--surface-container)] px-4 py-3 text-foreground">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary-container)] text-[var(--on-secondary-container)]">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">Asistente de Riesgo</p>
                  {selectedClaimId && (
                    <p className="label-mono truncate text-xs text-muted-foreground">
                      Caso {selectedClaimId}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSessionHistory((value) => !value)}
                  className="focus-ring rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[var(--surface-high)] hover:text-foreground"
                  aria-label="Historial de sesiones"
                  title="Historial"
                >
                  <History className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={startNewSession}
                  className="focus-ring rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[var(--surface-high)] hover:text-foreground"
                  aria-label="Nueva sesion"
                  title="Nueva sesion"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowChat(false)}
                  className="focus-ring rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[var(--surface-high)] hover:text-foreground"
                  aria-label="Cerrar asistente"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              {showSessionHistory && (
                <div className="shrink-0 border-b border-border bg-card px-3 py-2">
                  <div className="flex max-h-24 gap-2 overflow-x-auto">
                    {sessions.map((session) => (
                      <button
                        key={session.thread_id}
                        type="button"
                        onClick={() => openSession(session.thread_id)}
                        className={cn(
                          'focus-ring min-w-[180px] rounded-md border px-3 py-2 text-left text-xs transition-colors',
                          session.thread_id === threadId
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-[var(--surface-low)] text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span className="block truncate font-medium">{session.title}</span>
                        <span className="label-mono mt-1 block text-[10px]">{session.message_count} mensajes</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--surface-low)]">
                {chatMessages.map((message, index) => {
                  const previous = chatMessages[index - 1]
                  const shouldShowSection = message.sectionId && message.sectionId !== previous?.sectionId
                  return (
                    <div key={message.id} className="space-y-3">
                      {shouldShowSection && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="h-px flex-1 bg-border" />
                          <span className="max-w-[70%] truncate label-mono">
                            {sectionTitleById.get(message.sectionId || '') || 'Conversacion'}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      )}
                      <div
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
                            'rounded-lg px-3 py-2.5 text-sm leading-relaxed',
                            message.role === 'assistant'
                              ? 'border border-border bg-card text-card-foreground'
                              : 'max-w-[85%] bg-primary text-primary-foreground',
                            message.role === 'assistant' && message.response ? 'w-full max-w-[92%]' : 'max-w-[85%]',
                          )}
                        >
                          {message.role === 'assistant' && message.response ? (
                            <AgentResult response={message.response} onOpenClaim={openClaim} />
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

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
                <div className="max-h-[78px] overflow-y-auto px-3 pt-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {quickQuestions.slice(0, 3).map((q) => (
                      <button
                        key={q}
                        type="button"
                        title={q}
                        onClick={() => handleSend(q)}
                        disabled={isTyping}
                        className="focus-ring shrink-0 rounded-full border border-border bg-[var(--surface-low)] px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {shortenQuestion(q, 42)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3">
                  <div className="rounded-2xl border border-border bg-[var(--surface-low)] px-3 py-3">
                    <textarea
                      name="agent_question"
                      aria-label="Pregunta para el asistente de riesgo"
                      rows={2}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          void handleSend()
                        }
                      }}
                      placeholder="¿Qué puedo ayudarte a resolver?"
                      className="min-h-[42px] max-h-24 w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />

                    <div className="mt-2 flex items-center justify-between">
                      <span className="label-mono text-[10px] text-muted-foreground">
                        Enter envía · Shift+Enter salto de línea
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">Rastro IA</span>
                        <button
                          type="button"
                          onClick={() => void handleSend()}
                          disabled={!input.trim() || isTyping}
                          className={cn(
                            'focus-ring flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-[var(--surface-high)]',
                            (!input.trim() || isTyping) && 'cursor-not-allowed opacity-50',
                          )}
                          aria-label="Enviar mensaje"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
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
