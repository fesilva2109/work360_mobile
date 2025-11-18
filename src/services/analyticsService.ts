import api from './api';
import { AnalyticsMetrica, Usuario } from '../types/models';

class AnalyticsService {
  /**
   * Busca as métricas de hoje para um usuário específico.
   * @param userId - O ID do usuário.
   */
  async getTodaysMetrics(userId: number): Promise<AnalyticsMetrica> {
    const defaultMetrics: AnalyticsMetrica = {
      id: 0,
      usuarioId: userId,
      data: new Date().toISOString().split('T')[0],
      minutosFoco: 0,
      minutosReuniao: 0,
      tarefasConcluidasNoDia: 0,
      periodoMaisProdutivo: 'N/A',
    };

    try {
      console.log(`[AnalyticsService] Buscando métricas de hoje para o usuário ID: ${userId}`);
      // This now correctly calls /analytics/metricas/{id}/hoje
      const { data } = await api.get<AnalyticsMetrica>(`/analytics/metricas/${userId}/hoje`);
      console.log('[AnalyticsService] Métricas de hoje obtidas com sucesso.');
      return data;
    } catch (error: any) {
      console.warn(`[AnalyticsService] Falha ao buscar métricas de hoje (URL: ${error.config?.url}). Retornando valores padrão.`, error.message);
      // Retorna um objeto padrão para não quebrar o dashboard.
      return defaultMetrics;
    }
  }
}

export default new AnalyticsService();