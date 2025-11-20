import api from './api';
import { AnalyticsMetrica } from '../types/models';
import { CreateEventoDTO } from '../types/analytics.types';

class AnalyticsService {
  //Busca as métricas simples do dia para o Dashboard.

  async getTodaysMetrics(userId: number): Promise<AnalyticsMetrica> {
    try {
      console.log(`[AnalyticsService] Buscando métricas de hoje para o usuário ID: ${userId}`);
      const { data } = await api.get<AnalyticsMetrica>(`/analytics/metricas/${userId}/hoje`);
      console.log('[AnalyticsService] Métricas de hoje obtidas com sucesso.');
      return data;
    } catch (error: any) {
      console.warn(`[AnalyticsService] Falha ao buscar métricas de hoje (URL: ${error.config?.url}). Retornando valores padrão.`, error.message);

      return {
        minutosFoco: 0,
        tarefasConcluidasNoDia: 0,
      } as AnalyticsMetrica;
    }
  }

  //Registra um evento de produtividade no backend.

  async createEvento(eventoData: CreateEventoDTO): Promise<void> {
    try {
      console.log(`[AnalyticsService] Registrando evento: ${eventoData.tipoEvento}`);
      await api.post('/analytics/eventos', eventoData);
      console.log('[AnalyticsService] Evento registrado com sucesso.');
    } catch (error: any) {
      console.error('[AnalyticsService] Falha ao registrar evento:', error.message);
    }
  }
}

export default new AnalyticsService();