import { ClaimGraphPayload, GraphEdge, GraphNode } from './graph-types'

export function buildClaimGraph(payload: ClaimGraphPayload): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    {
      id: payload.id_siniestro,
      label: payload.id_siniestro,
      type: 'claim',
      risk: payload.alerta_red ? 'high' : 'normal',
      count: 1,
    },
  ]

  const edges: GraphEdge[] = []

  for (const connection of payload.connections) {
    const recurring = payload.recurring_entities.find((entity) => entity.key === connection.key)
    nodes.push({
      id: connection.key,
      label: connection.value,
      type: (connection.type as GraphNode['type']) || 'ciudad',
      risk: recurring ? 'high' : 'normal',
      count: recurring?.total_siniestros ?? 1,
    })

    edges.push({
      id: `${payload.id_siniestro}-${connection.key}`,
      source: payload.id_siniestro,
      target: connection.key,
      label: connection.type,
      weight: recurring?.total_siniestros ?? 1,
    })
  }

  return { nodes, edges }
}

export function safeGraphPayload(value: unknown, fallbackClaimId = 'SIN-NA'): ClaimGraphPayload {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>

  const explanation = raw.explanation ?? raw.explicacion
  const connections = raw.connections ?? raw.conexiones
  const recurringEntities = raw.recurring_entities ?? raw.entidades_recurrentes

  return {
    id_siniestro: String(raw.id_siniestro || fallbackClaimId),
    score_grafo: Number(raw.score_grafo || 0),
    alerta_red: Boolean(raw.alerta_red),
    explanation: String(explanation || 'Sin hallazgos de red relevantes.'),
    connections: Array.isArray(connections) ? (connections as ClaimGraphPayload['connections']) : [],
    recurring_entities: Array.isArray(recurringEntities)
      ? (recurringEntities as ClaimGraphPayload['recurring_entities'])
      : [],
  }
}
