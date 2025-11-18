export type TipoEvento =
  | 'START_FOCUS'
  | 'END_FOCUS'
  | 'TASK_COMPLETE'
  | 'REUNIAO_INICIADA';

export interface AnalyticsEvento {
  id?: number; // Opcional na criação
  usuarioId: number;
  tarefaId?: number;
  reuniaoId?: number;
  tipoEvento: TipoEvento;
  timestamp?: string; // Opcional na criação
}

export type CreateEventoDTO = Omit<AnalyticsEvento, 'id' | 'timestamp'>;

export interface AnalyticsMetrica {
  id: number;
  usuarioId: number;
  data: string; // YYYY-MM-DD
  minutosFoco: number;
  minutosReuniao: number;
  tarefasConcluidasNoDia: number;
  periodoMaisProdutivo: string;
}