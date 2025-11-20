import api from './api';
import { Reuniao, CreateReuniaoDTO, UpdateReuniaoDTO, SpringPage } from '../types/models';

class MeetingService {
  //Cria uma nova reunião.

  async createMeeting(meetingData: CreateReuniaoDTO): Promise<Reuniao> {
    try {
      console.log('[MeetingService] Criando nova reunião...', meetingData);
      const { data } = await api.post<Reuniao>('/reunioes', meetingData);
      console.log('[MeetingService] Reunião criada com sucesso:', data);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar reunião';
      console.error('[MeetingService] Erro ao criar reunião:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Busca todas as reuniões de forma paginada.

  async getMeetings(pageNumber = 0): Promise<Reuniao[]> {
    try {
      console.log(`[MeetingService] Buscando reuniões para a página: ${pageNumber}`);
      const { data } = await api.get<SpringPage<Reuniao>>('/reunioes', {
        params: { page: pageNumber },
      });
      console.log(`[MeetingService] ${data.content.length} reuniões encontradas.`);
      return data.content;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar reuniões';
      console.error('[MeetingService] Erro ao buscar reuniões:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  //Busca uma reunião específica pelo seu ID.

  async getMeetingById(meetingId: number): Promise<Reuniao> {
    try {
      console.log(`[MeetingService] Buscando reunião com ID: ${meetingId}`);
      const { data } = await api.get<Reuniao>(`/reunioes/${meetingId}`);
      console.log('[MeetingService] Reunião encontrada.');
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao buscar a reunião';
      console.error(`[MeetingService] Erro ao buscar reunião ${meetingId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  //Busca todas as reuniões associadas a um usuário.

  async getMeetingsByUserId(userId: number, pageNumber = 0): Promise<Reuniao[]> {
    try {
      console.log(`[MeetingService] Buscando reuniões para o usuário ID: ${userId}`);
      const { data } = await api.get<SpringPage<Reuniao>>('/reunioes', { 
        params: { usuarioId: userId, page: pageNumber } 
      });
      console.log(`[MeetingService] ${data.content.length} reuniões encontradas para o usuário.`);
      return data.content;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar reuniões do usuário';
      console.error('[MeetingService] Erro ao buscar reuniões do usuário:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  //Atualiza uma reunião existente.

  async updateMeeting(meetingId: number, meetingData: UpdateReuniaoDTO): Promise<Reuniao> {
    try {
      console.log(`[MeetingService] Atualizando reunião com ID: ${meetingId}`, meetingData);
      const { data } = await api.put<Reuniao>(`/reunioes/${meetingId}`, meetingData);
      console.log('[MeetingService] Reunião atualizada com sucesso:', data);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar a reunião';
      console.error(`[MeetingService] Erro ao atualizar reunião ${meetingId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  //Deleta uma reunião.

  async deleteMeeting(meetingId: number): Promise<void> {
    try {
      console.log(`[MeetingService] Deletando reunião com ID: ${meetingId}`);
      await api.delete(`/reunioes/${meetingId}`);
      console.log('[MeetingService] Reunião deletada com sucesso.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao deletar a reunião';
      console.error(`[MeetingService] Erro ao deletar reunião ${meetingId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new MeetingService();