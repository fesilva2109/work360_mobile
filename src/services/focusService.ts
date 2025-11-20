import api from './api';
import { FocusSession } from '../types/focus.types';

class FocusService {
  //Inicia uma nova sessão de foco para um usuário no backend.

  async startSession(usuarioId: number): Promise<FocusSession> {
    try {
      console.log(`[FocusService] Iniciando sessão de foco para o usuário ID: ${usuarioId}`);
      const { data } = await api.post<FocusSession>('/focus/start', { usuarioId });
      console.log('[FocusService] Sessão iniciada com sucesso:', data);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao iniciar a sessão de foco.';
      console.error('[FocusService] Erro:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  //Encerra uma sessão de foco que já foi iniciada.

  async stopSession(sessionId: number): Promise<FocusSession> {
    try {
      console.log(`[FocusService] Encerrando sessão de foco ID: ${sessionId}`);
      const { data } = await api.post<FocusSession>(`/focus/stop/${sessionId}`);
      console.log('[FocusService] Sessão encerrada com sucesso:', data);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao encerrar a sessão de foco.';
      console.error('[FocusService] Erro:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new FocusService();