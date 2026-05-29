import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Replaces technical jargon in AI-generated text with business-friendly Spanish.
 * Only modifies visible user-facing strings; does not alter code identifiers.
 */
export function sanitizeAiText(text?: string | null): string {
  if (!text) return ''
  return text
    .replace(/\bNLP\b/g, 'narrativa')
    .replace(/\bML\b/g, 'patrones del modelo')
    .replace(/\bFastAPI\b/gi, 'el sistema')
    .replace(/\bbackend\b/gi, 'el sistema')
    .replace(/\bAPI\b/g, 'el sistema')
    .replace(/\bscore\b/gi, 'puntaje')
    .replace(/\bgrafo\b/gi, 'red de relaciones')
    .replace(/\bdriver principal\b/gi, 'señal principal')
    .replace(/\bdataset\b/gi, 'cartera')
    .replace(/\bCSV\b/g, 'archivo de datos')
}
