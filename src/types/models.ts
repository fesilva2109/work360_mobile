export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Tarefa {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  estimativaMinutos: number;
  concluida: boolean;
}

export interface Reuniao {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  data: string; 
  link?: string;
}

export type CreateReuniaoDTO = Omit<Reuniao, 'id'>;

export type UpdateReuniaoDTO = Partial<CreateReuniaoDTO>;

export interface AnalyticsMetrica {
  id: number;
  usuarioId: number;
  data: string; 
  minutosFoco: number;
  minutosReuniao: number;
  tarefasConcluidasNoDia: number;
  periodoMaisProdutivo: string;
}

export type TipoEvento = 
  | 'START_FOCUS'
  | 'END_FOCUS'
  | 'TASK_COMPLETE'
  | 'REUNIAO_INICIADA';

export interface AnalyticsEvento {
  id?: number;
  usuarioId: number;
  tarefaId?: number;
  reuniaoId?: number;
  tipoEvento: TipoEvento;
  timestamp: string;
}

export interface RecomendacaoIA {
  focoIdeal: string;
  pausasRecomendadas: number;
  riscoBurnout: string;
  sugestoes: string[];
}

export interface ResumoIA {
  statusGeral: string;
  principalForca: string;
  principalRisco: string;
}

export interface RelatorioGerado {
  id: number;
  usuarioId: number;
  dataInicio: string;
  dataFim: string;
  tarefasConcluidas: number;
  tarefasPendentes: number;
  reunioesRealizadas: number;
  minutosFocoTotal: number;
  percentualConclusao: number;
  riscoBurnout: number;
  tendenciaProdutividade: string;
  tendenciaFoco: string;
  insights: string[];
  recomendacaoIA: RecomendacaoIA;
  resumoGeral: ResumoIA; 
  criadoEm: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";

export type CreateTarefaDTO = Omit<Tarefa, 'id' | 'concluida'>;
export type UpdateTarefaDTO = Omit<Tarefa, 'id'>;

export interface SpringPage<T> {
  content: T[];
}


export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
