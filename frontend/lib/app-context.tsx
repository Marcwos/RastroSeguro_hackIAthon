'use client'

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'
import { ApiClientError, ClaimExplanation, ClaimSummary, getClaimExplanation, getClaims, getHealth, uploadClaimsCsv } from '@/lib/api'

export type UserRole = 'analyst' | 'executive'

interface AppState {
  currentStep: number
  setCurrentStep: (step: number) => void
  userRole: UserRole | null
  selectUserRole: (role: UserRole) => void
  resetUserRole: () => void
  claims: ClaimSummary[]
  loadClaims: () => Promise<void>
  loadClaimExplanation: (id: string) => Promise<ClaimExplanation | null>
  uploadCsvAndRefresh: (file: File) => Promise<boolean>
  selectedClaimId: string | null
  setSelectedClaimId: (id: string | null) => void
  selectedClaim: ClaimSummary | null
  selectedExplanation: ClaimExplanation | null
  isApiReady: boolean
  isLoadingClaims: boolean
  isLoadingExplanation: boolean
  apiError: string | null
  apiHint: string | null
  isDataLoaded: boolean
  setIsDataLoaded: (loaded: boolean) => void
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
  showChat: boolean
  setShowChat: (show: boolean) => void
  showCommandBar: boolean
  setShowCommandBar: (show: boolean) => void
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [claims, setClaims] = useState<ClaimSummary[]>([])
  const [selectedClaimId, setSelectedClaimIdState] = useState<string | null>(null)
  const [selectedExplanation, setSelectedExplanation] = useState<ClaimExplanation | null>(null)
  const [isApiReady, setIsApiReady] = useState(false)
  const [isLoadingClaims, setIsLoadingClaims] = useState(false)
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiHint, setApiHint] = useState<string | null>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showCommandBar, setShowCommandBar] = useState(false)


  const selectUserRole = useCallback((role: UserRole) => {
    setUserRole(role)
    setCurrentStep(role === 'analyst' ? 1 : 0)
  }, [])

  const resetUserRole = useCallback(() => {
    setUserRole(null)
    setCurrentStep(0)
  }, [])

  const selectedClaim = useMemo(
    () => selectedClaimId ? claims.find(c => c.id_siniestro === selectedClaimId) || null : null,
    [claims, selectedClaimId]
  )

  const setSelectedClaimId = useCallback((id: string | null) => {
    setSelectedClaimIdState(id)
    setSelectedExplanation(null)
  }, [])

  const rememberApiError = (error: unknown) => {
    if (error instanceof ApiClientError) {
      setApiError(error.message)
      setApiHint(error.hint || null)
      return
    }
    setApiError('Ocurrió un error inesperado conectando con RastroSeguro.')
    setApiHint(null)
  }

  const loadClaims = useCallback(async () => {
    setIsLoadingClaims(true)
    setApiError(null)
    setApiHint(null)
    try {
      await getHealth()
      const records = await getClaims(50)
      setIsApiReady(true)
      setClaims(records)
      setIsDataLoaded(records.length > 0)
      setSelectedClaimIdState((prev) => {
        if (!records.length) return null
        if (prev && records.some((claim) => claim.id_siniestro === prev)) return prev
        return records[0].id_siniestro
      })
      if (records.length === 0) {
        setApiError('El API respondió sin siniestros priorizados.')
        setApiHint('Verifica que el scoring haya generado datos procesados.')
      }
    } catch (error) {
      setIsApiReady(false)
      setClaims([])
      setIsDataLoaded(false)
      rememberApiError(error)
    } finally {
      setIsLoadingClaims(false)
    }
  }, [])

  const loadClaimExplanation = useCallback(async (id: string) => {
    setIsLoadingExplanation(true)
    setApiError(null)
    setApiHint(null)
    try {
      const explanation = await getClaimExplanation(id)
      setSelectedExplanation(explanation)
      return explanation
    } catch (error) {
      rememberApiError(error)
      return null
    } finally {
      setIsLoadingExplanation(false)
    }
  }, [])

  const uploadCsvAndRefresh = useCallback(async (file: File) => {
    setApiError(null)
    setApiHint(null)
    setIsLoadingClaims(true)
    try {
      await uploadClaimsCsv(file)
      await loadClaims()
      setUploadedFile(file)
      setIsDataLoaded(true)
      return true
    } catch (error) {
      rememberApiError(error)
      return false
    } finally {
      setIsLoadingClaims(false)
    }
  }, [loadClaims])

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
        userRole,
        selectUserRole,
        resetUserRole,
        claims,
        loadClaims,
        loadClaimExplanation,
        uploadCsvAndRefresh,
        selectedClaimId,
        setSelectedClaimId,
        selectedClaim,
        selectedExplanation,
        isApiReady,
        isLoadingClaims,
        isLoadingExplanation,
        apiError,
        apiHint,
        isDataLoaded,
        setIsDataLoaded,
        uploadedFile,
        setUploadedFile,
        chatMessages,
        addChatMessage,
        clearChatMessages,
        showChat,
        setShowChat,
        showCommandBar,
        setShowCommandBar,
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
