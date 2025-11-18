import api from './api';
import { Reuniao } from '../types/models';

class MeetingService {

  async getMeetingsByUserId(userId: number): Promise<Reuniao[]> {
    try {
      console.log(`[MeetingService] Buscando reuniões para o usuário ID: ${userId}`);
      // Ajustado para usar query parameter, conforme a especificação do backend.
      const { data } = await api.get<Reuniao[]>('/reunioes', { params: { usuarioId: userId } });
      console.log(`[MeetingService] ${data.length} reuniões encontradas para o usuário.`);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar reuniões do usuário';
      console.error('[MeetingService] Erro ao buscar reuniões do usuário:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new MeetingService();