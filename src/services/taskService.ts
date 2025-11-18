import api from './api';
import { Tarefa, Usuario } from '../types/models';

type TarefaFormData = Omit<Tarefa, 'id' | 'usuarioId'>;
type TarefaUpdatePayload = Partial<Omit<Tarefa, 'id' | 'usuarioId'>>; // For updating

class TaskService {
  /**
   * Cria uma nova tarefa no backend.
   * @param userId - O ID do usuário que está criando a tarefa.
   * @param formData - Os dados da tarefa vindos do formulário.
   */
  async createTask(userId: number, formData: TarefaFormData): Promise<Tarefa> {
    try {
      // Assemble the final payload that the backend expects, combining the user ID
      // with the form data into a single flat object.
      const taskData = {
        ...formData,
        usuarioId: userId,
      };

      console.log('[TaskService] Criando nova tarefa...', taskData);
      const { data } = await api.post<Tarefa>('/tarefas', taskData);
      console.log('[TaskService] Tarefa criada com sucesso:', data);
      return data;
    } catch (error: any) {
      // Tratamento de erro robusto que lida com ambos os casos (erro de servidor e de rede)
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao criar tarefa';
      console.error('[TaskService] Erro ao criar tarefa:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca todas as tarefas (geralmente para um admin).
   */
  async getTasks(): Promise<Tarefa[]> {
    try {
      console.log('[TaskService] Buscando todas as tarefas...');
      const { data } = await api.get<Tarefa[]>('/tarefas');
      console.log(`[TaskService] ${data.length} tarefas encontradas.`);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar tarefas';
      console.error('[TaskService] Erro ao buscar tarefas:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca as tarefas de um usuário específico.
   * NOTA: O backend precisa de um endpoint como `/usuarios/{id}/tarefas`.
   * Se o endpoint for diferente, a URL abaixo precisa ser ajustada.
   */
  async getTasksByUserId(userId: number): Promise<Tarefa[]> {
    try {
      console.log(`[TaskService] Buscando tarefas para o usuário ID: ${userId}`);
      // Ajustado para usar query parameter, conforme a especificação do backend.
      const { data } = await api.get<Tarefa[]>('/tarefas', { params: { usuarioId: userId } });
      console.log(`[TaskService] ${data.length} tarefas encontradas para o usuário.`);
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar tarefas do usuário';
      console.error('[TaskService] Erro ao buscar tarefas do usuário:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Busca uma tarefa específica pelo seu ID.
   */
  async getTaskById(taskId: number): Promise<Tarefa> {
    try {
      console.log(`[TaskService] Buscando tarefa com ID: ${taskId}`);
      const { data } = await api.get<Tarefa>(`/tarefas/${taskId}`);
      console.log('[TaskService] Tarefa encontrada.');
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar a tarefa';
      console.error(`[TaskService] Erro ao buscar tarefa ${taskId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Atualiza uma tarefa existente.
   */
  async updateTask(taskId: number, taskData: TarefaUpdatePayload): Promise<Tarefa> {
    try {
      console.log(`[TaskService] Atualizando tarefa com ID: ${taskId}`);
      const { data } = await api.put<Tarefa>(`/tarefas/${taskId}`, taskData);
      console.log('[TaskService] Tarefa atualizada com sucesso.');
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao atualizar a tarefa';
      console.error(`[TaskService] Erro ao atualizar tarefa ${taskId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Deleta uma tarefa.
   */
  async deleteTask(taskId: number): Promise<void> {
    try {
      console.log(`[TaskService] Deletando tarefa com ID: ${taskId}`);
      await api.delete(`/tarefas/${taskId}`);
      console.log('[TaskService] Tarefa deletada com sucesso.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao deletar a tarefa';
      console.error(`[TaskService] Erro ao deletar tarefa ${taskId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new TaskService();
