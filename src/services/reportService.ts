import api from './api';
import { Relatorio } from '../types/models';

class ReportService {
  async getReports(usuarioId: number): Promise<Relatorio[]> {
    const { data } = await api.get<Relatorio[]>(`/relatorios`, {
      params: { usuario_id: usuarioId }
    });
    return data.sort((a, b) =>
      new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
  }

  async getLatestReport(usuarioId: number): Promise<Relatorio | null> {
    const reports = await this.getReports(usuarioId);
    return reports[0] || null;
  }

  async getReportById(id: number): Promise<Relatorio> {
    const { data } = await api.get<Relatorio>(`/relatorios/${id}`);
    return data;
  }

  async generateReport(usuarioId: number): Promise<Relatorio> {
    const { data } = await api.post<Relatorio>('/relatorios/gerar', {
      usuario_id: usuarioId,
    });
    return data;
  }

  async getReportsByPeriod(usuarioId: number, dataInicio: string, dataFim: string): Promise<Relatorio[]> {
    const { data } = await api.get<Relatorio[]>(`/relatorios`, {
      params: { usuario_id: usuarioId }
    });

    return data.filter(r => {
      const reportDate = new Date(r.data_inicio);
      const startDate = new Date(dataInicio);
      const endDate = new Date(dataFim);
      return reportDate >= startDate && reportDate <= endDate;
    });
  }
}

export default new ReportService();
