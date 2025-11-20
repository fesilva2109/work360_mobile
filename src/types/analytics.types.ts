//Define os tipos de eventos que podem ser registrados para análise de produtividade.

export type TipoEvento =
  | 'FOCO_INICIO'
  | 'FOCO_FIM'
  | 'TAREFA_CONCLUIDA'
  | 'REUNIAO_INICIO'
  | 'REUNIAO_FIM';

export interface AnalyticsEvento {
  id?: number;
  usuarioId: number;
  tarefaId?: number;
  reuniaoId?: number;
  tipoEvento: TipoEvento;
  timestamp?: string;
}

// DTO para criar um novo evento de analytics. 
export type CreateEventoDTO = Omit<AnalyticsEvento, 'id' | 'timestamp'>;