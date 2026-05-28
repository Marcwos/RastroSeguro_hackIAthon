'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ClaimData, mockClaims } from '@/lib/claims-data'

interface AppState {
  currentStep: number
  setCurrentStep: (step: number) => void
  selectedClaimId: string | null
  setSelectedClaimId: (id: string | null) => void
  selectedClaim: ClaimData | null
  isDataLoaded: boolean
  setIsDataLoaded: (loaded: boolean) => void
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  showChat: boolean
  setShowChat: (show: boolean) => void
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [showChat, setShowChat] = useState(false)

  const selectedClaim = selectedClaimId 
    ? mockClaims.find(c => c.id_siniestro === selectedClaimId) || null 
    : null

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message])
  }

  const clearChatMessages = () => {
    setChatMessages([])
  }

  return (
    <AppContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedClaimId,
        setSelectedClaimId,
        selectedClaim,
        isDataLoaded,
        setIsDataLoaded,
        uploadedFile,
        setUploadedFile,
        chatMessages,
        addChatMessage,
        clearChatMessages,
        showChat,
        setShowChat,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider')
  }
  return context
}
