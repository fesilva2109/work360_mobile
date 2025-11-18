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
  riscoBurnout: number; // (de 0.0 a 1.0)
  tendenciaProdutividade: string;
  tendenciaFoco: string;
  insights: string;
  recomendacaoIA: string;
  resumoGeral: string;
  criadoEm: string;
}

export interface GenerateReportParams {
  usuarioId: number;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
}