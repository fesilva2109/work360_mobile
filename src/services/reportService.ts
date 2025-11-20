import api from './api';
import { RelatorioGerado } from '../types/report.types';

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

  /**
   * Busca todos os relatórios salvos para um usuário.
   */
  async getUserReports(userId: number): Promise<RelatorioGerado[]> {
    try {
      console.log(`[ReportService] Buscando relatórios para o usuário ID: ${userId}`);
      // CONFIRMADO: Swagger indica que o endpoint é /relatorios/{usuarioId}
      const { data } = await api.get<RelatorioGerado[]>(`/relatorios/${userId}`);
      console.log(`[ReportService] ${data.length} relatórios encontrados.`);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar relatórios do usuário.';
      console.error('[ReportService] Erro:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Deleta um relatório específico pelo seu ID.
   */
  async deleteReport(reportId: number): Promise<void> {
    try {
      console.log(`[ReportService] Deletando relatório ID: ${reportId}`);
      await api.delete(`/relatorios/${reportId}`);
      console.log('[ReportService] Relatório deletado com sucesso.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar o relatório.';
      console.error('[ReportService] Erro:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new ReportService();
