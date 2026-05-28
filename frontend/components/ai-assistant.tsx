'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppState, ChatMessage } from '@/lib/app-context'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const quickQuestions = [
  '¿Por qué este caso tiene ese score?',
  'Ver relaciones del caso'
]

function generateAIResponse(question: string, claim: any): string {
  const q = question.toLowerCase()
  
  if (q.includes('score') || q.includes('por qué')) {
    return `Revisé las señales disponibles del caso. El score de ${claim.score_final}/100 se debe a:\n\n• **Reglas**: ${claim.score_reglas} pts - ${claim.alertas_activadas[0] || 'Reglas de negocio aplicadas'}\n• **Monto y comportamiento**: ${claim.score_modelo} pts - Patrón de comportamiento inusual\n• **Narrativa**: ${claim.score_nlp} pts - Análisis de narrativa\n• **Relaciones**: ${claim.score_relaciones} pts - Conexiones con entidades de riesgo\n\nLa acción recomendada es: ${claim.accion_sugerida}`
  }
  
  if (q.includes('relaciones') || q.includes('relaciones')) {
    return `El análisis de relaciones revela:\n\n• El proveedor ${claim.id_proveedor} está conectado a ${Math.ceil(claim.score_relaciones / 5)} casos previos de alto riesgo\n• La ciudad ${claim.ciudad} tiene concentración moderada de alertas\n• El patrón de conexión sugiere revisar casos relacionados\n\nRecomiendo verificar el historial del proveedor.`
  }
  
  if (q.includes('alerta') || q.includes('revisar')) {
    return `Las alertas principales para este caso son:\n\n${claim.alertas_activadas.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\nEl analista debería priorizar: ${claim.accion_sugerida}`
  }
  
  return `Basándome en el análisis del siniestro ${claim.id_siniestro}:\n\n${claim.explicacion}\n\n¿En qué sección del score te gustaría profundizar?`
}

export function AIAssistant() {
  const { showChat, setShowChat, selectedClaim, chatMessages, addChatMessage } = useAppState()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Add initial message when opening for the first time
  useEffect(() => {
    if (showChat && chatMessages.length === 0 && selectedClaim) {
      addChatMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Revisé las señales disponibles del caso. ¿En qué sección del score te gustaría profundizar?`,
        timestamp: new Date()
      })
    }
  }, [showChat, chatMessages.length, selectedClaim, addChatMessage])

  const handleSend = (text: string = input) => {
    if (!text.trim() || !selectedClaim) return

    // Add user message
    addChatMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    })

    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(text, selectedClaim)
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      })
      setIsTyping(false)
    }, 1000 + Math.random() * 500)
  }

  const handleQuickQuestion = (question: string) => {
    handleSend(question)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!showChat && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-blue-500 transition-colors z-50"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[500px] glass-panel rounded-2xl shadow-2xl shadow-black/40 border border-slate-700/50 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-semibold text-white">Asistente de Riesgo</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant' ? 'bg-blue-500/20' : 'bg-slate-700'
                  )}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[80%] rounded-xl px-3 py-2',
                    message.role === 'assistant' 
                      ? 'bg-slate-800/80 text-slate-200' 
                      : 'bg-blue-600 text-white'
                  )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="bg-slate-800/80 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 py-2 border-t border-slate-700/50">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu duda..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    input.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-600 text-center mt-2">
                Pregúntale al asistente
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
