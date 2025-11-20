export interface FocusSession {
  id: number;
  usuarioId: number;
  startTime: string; 
  endTime?: string; 
  avgBpm?: number;
  avgNoiseDb?: number; 
  status: 'EM_ANDAMENTO' | 'CONCLUIDO'; 
}