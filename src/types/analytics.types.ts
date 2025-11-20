export type TipoEvento =
  | 'FOCO_INICIO'      // Corrigido de START_FOCUS
  | 'FOCO_FIM'         // Corrigido de END_FOCUS
  | 'TAREFA_CONCLUIDA' // Corrigido de TASK_COMPLETE
  | 'REUNIAO_INICIO'   // Corrigido de REUNIAO_INICIADA
  | 'REUNIAO_FIM';

export interface AnalyticsEvento {
  id?: number; // Opcional na criação
  usuarioId: number;
  tarefaId?: number;
  reuniaoId?: number;
  tipoEvento: TipoEvento;
  timestamp?: string; // Opcional na criação
}

export type CreateEventoDTO = Omit<AnalyticsEvento, 'id' | 'timestamp'>;