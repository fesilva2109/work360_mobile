import api from './api';
import { Reuniao } from '../types/models';

class MeetingService {
  async getMeetings(usuarioId: number): Promise<Reuniao[]> {
    const { data } = await api.get<Reuniao[]>('/reunioes', {
      params: { usuario_id: usuarioId }
    });
    return data;
  }

  async getMeetingById(id: number): Promise<Reuniao> {
    const { data } = await api.get<Reuniao>(`/reunioes/${id}`);
    return data;
  }

  async createMeeting(reuniao: Omit<Reuniao, 'id'>): Promise<Reuniao> {
    const { data } = await api.post<Reuniao>('/reunioes', reuniao);
    return data;
  }

  async updateMeeting(id: number, reuniao: Partial<Reuniao>): Promise<Reuniao> {
    const { data } = await api.put<Reuniao>(`/reunioes/${id}`, reuniao);
    return data;
  }

  async deleteMeeting(id: number): Promise<void> {
    await api.delete(`/reunioes/${id}`);
  }

  async getMeetingsByDate(usuarioId: number, data: string): Promise<Reuniao[]> {
    const { data: reunioes } = await api.get<Reuniao[]>('/reunioes', {
      params: { usuario_id: usuarioId }
    });

    return reunioes.filter(r => r.data.startsWith(data));
  }

  async getUpcomingMeetings(usuarioId: number): Promise<Reuniao[]> {
    const { data: reunioes } = await api.get<Reuniao[]>('/reunioes', {
      params: { usuario_id: usuarioId }
    });

    const now = new Date();
    return reunioes
      .filter(r => new Date(r.data) >= now)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }
}

export default new MeetingService();
