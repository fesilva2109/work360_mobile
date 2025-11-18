export interface Usuario {
  id: number;
  nome: string;
  email: string;
  // senha não é armazenada no frontend, apenas enviada na criação/login
}

export interface Tarefa {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  estimativaMinutos: number;
}

export interface Reuniao {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  data: string; // ISO Datetime
  link?: string;
}

export interface AnalyticsMetrica {
  id: number;
  usuarioId: number;
  data: string; // YYYY-MM-DD
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
  insights: string[]; // Espera-se um array de strings
  recomendacaoIA: RecomendacaoIA; // Objeto aninhado
  resumoGeral: ResumoIA; // Objeto aninhado
  criadoEm: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string; // A API real retorna apenas o token
  // O usuário será buscado em um endpoint separado após o login
}
