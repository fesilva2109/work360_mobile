export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
}

export interface Tarefa {
  id: number;
  usuario_id: number;
  titulo: string;
  descricao?: string;
  prioridade?: 'ALTA' | 'MEDIA' | 'BAIXA';
  estimativa?: number;
  status?: 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDA';
  criado_em?: string;
}

export interface Reuniao {
  id: number;
  usuario_id: number;
  titulo: string;
  descricao?: string;
  data: string;
  link?: string;
}

export interface AnalyticsMetrica {
  id: number;
  usuario_id: number;
  data: string;
  minutos_foco: number;
  minutos_reuniao: number;
  tarefas_concluidas_no_dia: number;
  periodo_mais_produtivo?: string;
}

export interface AnalyticsEvento {
  id?: number;
  usuario_id: number;
  tarefa_id?: number;
  reuniao_id?: number;
  tipo_evento: 'TAREFA_CRIADA' | 'TAREFA_CONCLUIDA' | 'REUNIAO_INICIADA' | 'REUNIAO_FINALIZADA' | 'FOCO_INICIADO' | 'FOCO_FINALIZADO';
  timestamp: string;
}

export interface Relatorio {
  id: number;
  usuario_id: number;
  data_inicio: string;
  data_fim: string;
  tarefas_concluidas: number;
  tarefas_pendentes: number;
  reunioes_realizadas: number;
  minutos_foco_total: number;
  percentual_conclusao: number;
  risco_burnout: number;
  tendencia_produtividade: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  tendencia_foco: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  insights: string;
  recomendacaoIA: string;
  resumo_geral: string;
  criado_em: string;
  relatorio_anterior_id?: number;
}

export interface DadosIoT {
  id?: number;
  usuarioId: number;
  batimentosCardiacos: number;
  nivelRuidoDB: number;
  tempoFocoSegundos: number;
  timestamp?: string;
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
  token: string;
  usuario: Usuario;
}
