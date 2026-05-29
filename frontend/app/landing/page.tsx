import type { Metadata } from 'next'
import { LandingPageContent } from '@/components/landing/landing-page-content'

export const metadata: Metadata = {
  title: 'RastroSeguro | Inteligencia antifraude',
  description:
    'RastroSeguro prioriza siniestros con senales de posible fraude y explica por que, para que el equipo humano revise primero donde mas importa.',
}

export default function LandingPage() {
  return <LandingPageContent />
}
