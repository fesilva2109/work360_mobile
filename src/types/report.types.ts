//Relatório de produtividade, que é atribuido à uma análise de IA.

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
  riscoBurnout: number | null;
  tendenciaProdutividade: string;
  tendenciaFoco: string;
  insights: string | null;
  recomendacaoIA: string | null;
  resumoGeral: string | null;
  criadoEm: string;
}

//Parâmetros necessários para solicitar a geração de um novo relatório.

export interface GenerateReportParams {
  usuarioId: number;
  dataInicio: string; 
  dataFim: string;
}