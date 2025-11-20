/**
 * Representa uma sessão de foco, mapeada da tabela TB_FOCUS_SESSION do Oracle.
 * Os nomes dos campos estão em camelCase para corresponder à serialização JSON do backend.
 */
export interface FocusSession {
  id: number;
  usuarioId: number;
  startTime: string; // ISO Date String
  endTime?: string; // ISO Date String (pode ser nulo se a sessão estiver em andamento)
  avgBpm?: number;
  avgNoiseDb?: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO';
}