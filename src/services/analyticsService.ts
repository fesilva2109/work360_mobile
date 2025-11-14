import api from './api';
import { AnalyticsEvento, AnalyticsMetrica } from '../types/models';

class AnalyticsService {
  async createEvent(evento: Omit<AnalyticsEvento, 'id'>): Promise<AnalyticsEvento> {
    const { data } = await api.post<AnalyticsEvento>('/analytics/eventos', {
      ...evento,
      timestamp: evento.timestamp || new Date().toISOString(),
    });
    return data;
  }

  async getMetrics(usuarioId: number): Promise<AnalyticsMetrica[]> {
    const { data } = await api.get<AnalyticsMetrica[]>(`/analytics/metricas`, {
      params: { usuario_id: usuarioId }
    });
    return data;
  }

  async getTodayMetrics(usuarioId: number): Promise<AnalyticsMetrica | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get<AnalyticsMetrica[]>(`/analytics/metricas`, {
        params: { usuario_id: usuarioId, data: today }
      });
      return data[0] || null;
    } catch (error) {
      return null;
    }
  }

  async getMetricsByPeriod(usuarioId: number, dataInicio: string, dataFim: string): Promise<AnalyticsMetrica[]> {
    const { data } = await api.get<AnalyticsMetrica[]>(`/analytics/metricas`, {
      params: { usuario_id: usuarioId }
    });

    return data.filter(m => {
      const metricDate = new Date(m.data);
      const startDate = new Date(dataInicio);
      const endDate = new Date(dataFim);
      return metricDate >= startDate && metricDate <= endDate;
    });
  }

  async updateTodayMetrics(usuarioId: number, updates: Partial<AnalyticsMetrica>): Promise<AnalyticsMetrica> {
    const today = new Date().toISOString().split('T')[0];
    const todayMetric = await this.getTodayMetrics(usuarioId);

    if (todayMetric) {
      const { data } = await api.put<AnalyticsMetrica>(`/analytics/metricas/${todayMetric.id}`, {
        ...todayMetric,
        ...updates,
      });
      return data;
    } else {
      const { data } = await api.post<AnalyticsMetrica>('/analytics/metricas', {
        usuario_id: usuarioId,
        data: today,
        minutos_foco: 0,
        minutos_reuniao: 0,
        tarefas_concluidas_no_dia: 0,
        ...updates,
      });
      return data;
    }
  }
}

export default new AnalyticsService();
