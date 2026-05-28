// Mock data for RastroSeguro demo claims
export interface ClaimData {
  id_siniestro: string
  ramo: string
  cobertura: string
  ciudad: string
  id_proveedor: string
  monto_reclamado: number
  suma_asegurada: number
  score_reglas: number
  score_modelo: number
  score_anomalia: number
  score_nlp: number
  score_grafo: number
  score_categorico: number
  score_final: number
  nivel_riesgo: 'bajo' | 'medio' | 'alto' | 'critico'
  alertas_activadas: string[]
  explicacion: string
  accion_sugerida: string
  narrativa: string
  fecha_ocurrencia: string
  fecha_reporte: string
  dias_desde_inicio_poliza: number
  documentos: {
    nombre: string
    tipo: string
    estado: 'completo' | 'pendiente' | 'inconsistente'
  }[]
  ubicacion?: {
    sector: string
    confirmada: boolean
  }
  telemetria?: boolean
}

export const mockClaims: ClaimData[] = [
  {
    id_siniestro: 'SIN-0112',
    ramo: 'Automóvil',
    cobertura: 'Todo Riesgo',
    ciudad: 'Medellín',
    id_proveedor: 'PROV-0045',
    monto_reclamado: 12500,
    suma_asegurada: 15000,
    score_reglas: 24,
    score_modelo: 35,
    score_anomalia: 5,
    score_nlp: 8,
    score_grafo: 15,
    score_categorico: 0,
    score_final: 87,
    nivel_riesgo: 'critico',
    alertas_activadas: [
      'Incumplimiento de 3 reglas de negocio críticas',
      'Vector de comportamiento inusual detectado',
      'Sentimiento y patrones de texto sospechosos',
      'Conexión con 2 entidades de riesgo previo'
    ],
    explicacion: 'El siniestro presenta múltiples señales de riesgo: proximidad al inicio de póliza, proveedor con historial de alertas, y narrativa similar a casos previos marcados.',
    accion_sugerida: 'Escalar a revisión antifraude especializada de forma inmediata.',
    narrativa: 'El asegurado reporta una colisión múltiple ocurrida a las 23:45 del viernes en el sector de El Poblado. Según la declaración, un vehículo de terceros omitió un semáforo en rojo impactando lateralmente. Se adjunta informe policial y registro fotográfico de daños en el guardabarros izquierdo y sistema de iluminación frontal. La narrativa coincide preliminarmente con los registros geográficos del dispositivo telemático del vehículo.',
    fecha_ocurrencia: '2024-01-15',
    fecha_reporte: '2024-01-16',
    dias_desde_inicio_poliza: 12,
    documentos: [
      { nombre: 'Declaración.pdf', tipo: 'declaracion', estado: 'completo' },
      { nombre: 'Evidencia_Daños.jpg', tipo: 'foto', estado: 'completo' },
      { nombre: 'Telemetría_GPS.log', tipo: 'telemetria', estado: 'completo' }
    ],
    ubicacion: {
      sector: 'Sector El Poblado, Medellín',
      confirmada: true
    },
    telemetria: true
  },
  {
    id_siniestro: 'SIN-0045',
    ramo: 'Automóvil',
    cobertura: 'Robo Total',
    ciudad: 'Bogotá',
    id_proveedor: 'PROV-0012',
    monto_reclamado: 45000,
    suma_asegurada: 48000,
    score_reglas: 32,
    score_modelo: 28,
    score_anomalia: 12,
    score_nlp: 6,
    score_grafo: 8,
    score_categorico: 6,
    score_final: 92,
    nivel_riesgo: 'critico',
    alertas_activadas: [
      'Robo total reportado 5 días después del inicio de póliza',
      'Monto cercano al 94% de la suma asegurada',
      'Proveedor en lista de observación',
      'Sin reporte policial adjunto'
    ],
    explicacion: 'Caso de robo total ocurrido muy cerca del inicio de vigencia de la póliza. El monto reclamado es casi igual a la suma asegurada. El proveedor tiene historial de casos observados.',
    accion_sugerida: 'Revisión antifraude urgente con investigación de campo.',
    narrativa: 'El asegurado declara que el vehículo fue sustraído de su residencia durante la madrugada. No hay testigos ni cámaras de seguridad en la zona. El vehículo no ha sido recuperado.',
    fecha_ocurrencia: '2024-01-10',
    fecha_reporte: '2024-01-12',
    dias_desde_inicio_poliza: 5,
    documentos: [
      { nombre: 'Declaración.pdf', tipo: 'declaracion', estado: 'completo' },
      { nombre: 'Denuncia_Policial.pdf', tipo: 'denuncia', estado: 'pendiente' }
    ],
    ubicacion: {
      sector: 'Chapinero, Bogotá',
      confirmada: false
    },
    telemetria: false
  },
  {
    id_siniestro: 'SIN-0201',
    ramo: 'Automóvil',
    cobertura: 'Daños Propios',
    ciudad: 'Cali',
    id_proveedor: 'PROV-0078',
    monto_reclamado: 3200,
    suma_asegurada: 22000,
    score_reglas: 8,
    score_modelo: 12,
    score_anomalia: 2,
    score_nlp: 0,
    score_grafo: 3,
    score_categorico: 0,
    score_final: 25,
    nivel_riesgo: 'bajo',
    alertas_activadas: [],
    explicacion: 'Siniestro menor con documentación completa y consistente. Sin señales de riesgo significativas.',
    accion_sugerida: 'Continuar con flujo normal de procesamiento.',
    narrativa: 'Daño menor en parachoques trasero por colisión leve en estacionamiento. Hay testigos y registro en cámaras del centro comercial.',
    fecha_ocurrencia: '2024-01-08',
    fecha_reporte: '2024-01-08',
    dias_desde_inicio_poliza: 180,
    documentos: [
      { nombre: 'Declaración.pdf', tipo: 'declaracion', estado: 'completo' },
      { nombre: 'Fotos_Daños.zip', tipo: 'foto', estado: 'completo' },
      { nombre: 'Video_CCTV.mp4', tipo: 'video', estado: 'completo' }
    ],
    ubicacion: {
      sector: 'Centro Comercial Unicentro, Cali',
      confirmada: true
    },
    telemetria: true
  },
  {
    id_siniestro: 'SIN-0330',
    ramo: 'Hogar',
    cobertura: 'Incendio',
    ciudad: 'Barranquilla',
    id_proveedor: 'PROV-0091',
    monto_reclamado: 28000,
    suma_asegurada: 30000,
    score_reglas: 20,
    score_modelo: 18,
    score_anomalia: 8,
    score_nlp: 4,
    score_grafo: 5,
    score_categorico: 3,
    score_final: 58,
    nivel_riesgo: 'medio',
    alertas_activadas: [
      'Monto cercano al 93% de suma asegurada',
      'Reporte tardío (5 días después)',
      'Proveedor de reparación con 2 casos previos observados'
    ],
    explicacion: 'Siniestro de hogar con algunas señales de riesgo moderado. Requiere revisión documental adicional antes de procesar.',
    accion_sugerida: 'Escalar a Unidad Antifraude para revisión documental.',
    narrativa: 'Se reporta incendio parcial en cocina debido a cortocircuito. Los bomberos atendieron la emergencia. El proveedor de reparaciones es recomendado por un vecino.',
    fecha_ocurrencia: '2024-01-05',
    fecha_reporte: '2024-01-10',
    dias_desde_inicio_poliza: 95,
    documentos: [
      { nombre: 'Declaración.pdf', tipo: 'declaracion', estado: 'completo' },
      { nombre: 'Informe_Bomberos.pdf', tipo: 'informe', estado: 'completo' },
      { nombre: 'Cotización_Reparación.pdf', tipo: 'cotizacion', estado: 'inconsistente' }
    ]
  },
  {
    id_siniestro: 'SIN-0418',
    ramo: 'Salud',
    cobertura: 'Hospitalización',
    ciudad: 'Medellín',
    id_proveedor: 'CLIN-0023',
    monto_reclamado: 8500,
    suma_asegurada: 50000,
    score_reglas: 4,
    score_modelo: 8,
    score_anomalia: 0,
    score_nlp: 2,
    score_grafo: 0,
    score_categorico: 0,
    score_final: 14,
    nivel_riesgo: 'bajo',
    alertas_activadas: [],
    explicacion: 'Reclamo de salud con documentación médica completa y coherente. Sin señales de alerta.',
    accion_sugerida: 'Continuar con flujo normal de procesamiento.',
    narrativa: 'Hospitalización por procedimiento quirúrgico programado. Documentación médica completa con historia clínica, autorización previa y facturas de la clínica.',
    fecha_ocurrencia: '2024-01-12',
    fecha_reporte: '2024-01-14',
    dias_desde_inicio_poliza: 365,
    documentos: [
      { nombre: 'Historia_Clinica.pdf', tipo: 'medico', estado: 'completo' },
      { nombre: 'Factura_Clinica.pdf', tipo: 'factura', estado: 'completo' },
      { nombre: 'Autorizacion_Previa.pdf', tipo: 'autorizacion', estado: 'completo' }
    ]
  },
  {
    id_siniestro: 'SIN-0502',
    ramo: 'Automóvil',
    cobertura: 'Responsabilidad Civil',
    ciudad: 'Bogotá',
    id_proveedor: 'PROV-0045',
    monto_reclamado: 15000,
    suma_asegurada: 20000,
    score_reglas: 28,
    score_modelo: 22,
    score_anomalia: 6,
    score_nlp: 12,
    score_grafo: 10,
    score_categorico: 4,
    score_final: 72,
    nivel_riesgo: 'medio',
    alertas_activadas: [
      'Narrativa con 85% de similitud con SIN-0381',
      'Mismo proveedor que caso SIN-0112',
      'Tercero no identificado',
      'Sin testigos'
    ],
    explicacion: 'El siniestro presenta narrativa muy similar a un caso previo y está conectado al mismo proveedor de otro caso de alto riesgo.',
    accion_sugerida: 'Escalar a Unidad Antifraude para revisión documental y comparación con casos relacionados.',
    narrativa: 'El asegurado reporta que un vehículo desconocido lo impactó y huyó de la escena. No hay testigos ni cámaras. El tercero no fue identificado.',
    fecha_ocurrencia: '2024-01-18',
    fecha_reporte: '2024-01-20',
    dias_desde_inicio_poliza: 45,
    documentos: [
      { nombre: 'Declaración.pdf', tipo: 'declaracion', estado: 'completo' },
      { nombre: 'Fotos_Daños.jpg', tipo: 'foto', estado: 'completo' }
    ],
    ubicacion: {
      sector: 'Usaquén, Bogotá',
      confirmada: false
    }
  }
]

export const demoCases = [
  { id: 'SIN-0112', label: 'Caso demo: Colisión Frontal Múltiple' },
  { id: 'SIN-0045', label: 'Caso demo: Robo Total Sospechoso' },
  { id: 'SIN-0201', label: 'Caso demo: Daño Menor Normal' },
  { id: 'SIN-0330', label: 'Caso demo: Incendio Hogar' },
  { id: 'SIN-0418', label: 'Caso demo: Hospitalización Normal' },
  { id: 'SIN-0502', label: 'Caso demo: RC con Narrativa Similar' }
]

export function getClaimById(id: string): ClaimData | undefined {
  return mockClaims.find(claim => claim.id_siniestro === id)
}

export function getRiskColor(nivel: string): string {
  switch (nivel) {
    case 'bajo':
      return '#10b981'
    case 'medio':
      return '#f59e0b'
    case 'alto':
      return '#ef4444'
    case 'critico':
      return '#dc2626'
    default:
      return '#6b7280'
  }
}

export function getRiskLabel(nivel: string): string {
  switch (nivel) {
    case 'bajo':
      return 'Bajo'
    case 'medio':
      return 'Medio'
    case 'alto':
      return 'Alto'
    case 'critico':
      return 'Crítico'
    default:
      return 'Desconocido'
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
