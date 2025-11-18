import api from './api';
import { RelatorioGerado } from '../types/models';

interface GerarRelatorioRequest {
  usuarioId: number;
  dataInicio: string; // Formato YYYY-MM-DD
  dataFim: string; // Formato YYYY-MM-DD
}

class ReportService {
  /**
   * Etapa 1: Inicia a geração de um relatório base no backend.
   * Retorna o relatório parcial, contendo o ID necessário para a próxima etapa.
   * @param params - Contém usuarioId, dataInicio e dataFim.
   */
  async gerarRelatorioBase(
    params: GerarRelatorioRequest
  ): Promise<RelatorioGerado> {
    console.log('[ReportService] Etapa 1: Gerando relatório base...');
    const { data } = await api.post<RelatorioGerado>('/relatorios/gerar', null, {
      params: {
        usuarioId: params.usuarioId,
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
      },
    });
    console.log(`[ReportService] Relatório base criado com ID: ${data.id}`);
    return data;
  }

  /**
   * Etapa 2: Solicita o enriquecimento do relatório pela IA.
   * @param relatorioId - O ID do relatório gerado na Etapa 1.
   */
  async enriquecerRelatorioComIA(
    relatorioId: number
  ): Promise<RelatorioGerado> {
    console.log(`[ReportService] Etapa 2: Enriquecendo relatório ID ${relatorioId} com IA...`);
    const { data } = await api.get<RelatorioGerado>(`/ia/relatorio/${relatorioId}`);
    console.log('[ReportService] Relatório enriquecido com sucesso.');
    return data;
  }
}

export default new ReportService();
