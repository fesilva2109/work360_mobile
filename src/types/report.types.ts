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
  riscoBurnout: number | null; // (de 0.0 a 1.0, conforme Swagger)
  tendenciaProdutividade: string;
  tendenciaFoco: string;
  insights: string | null; // Swagger indica que é uma string, não um array
  recomendacaoIA: string | null; // Swagger indica que é uma string, não um objeto
  resumoGeral: string | null; // Swagger indica que é uma string, não um objeto
  criadoEm: string;
}

export interface GenerateReportParams {
  usuarioId: number;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
}