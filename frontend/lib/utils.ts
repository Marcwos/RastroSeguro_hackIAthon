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
    .replace(/\bIA\b/g, 'asistente')
    .replace(/\bFastAPI\b/gi, 'el sistema')
    .replace(/\bbackend\b/gi, 'el sistema')
    .replace(/\bAPI\b/g, 'el sistema')
    .replace(/\bscore\b/gi, 'puntaje')
    .replace(/\bgrafo\b/gi, 'red de relaciones')
    .replace(/\bthread\b/gi, 'conversación')
    .replace(/\bsession\b/gi, 'conversación')
    .replace(/\bsessions\b/gi, 'conversaciones')
    .replace(/\bruntime\b/gi, 'modo de respuesta')
    .replace(/\bclassic\b/gi, 'estándar')
    .replace(/\bdriver\b/gi, 'señal')
    .replace(/\bdrivers\b/gi, 'señales')
    .replace(/\bpattern\b/gi, 'patrón')
    .replace(/\bpatterns\b/gi, 'patrones')
    .replace(/\bradar\b/gi, 'resumen de señales')
    .replace(/\btimeline\b/gi, 'línea de tiempo')
    .replace(/\bdemo\b/gi, 'muestra')
    .replace(/\bsimulator\b/gi, 'simulador')
    .replace(/\bdriver principal\b/gi, 'señal principal')
    .replace(/\bdataset\b/gi, 'cartera')
    .replace(/\bCSV\b/g, 'archivo de datos')
}
