import api from './api';
import { Tarefa, CreateTarefaDTO, UpdateTarefaDTO, SpringPage } from '../types/models';


type TarefaUpdatePayload = Partial<Omit<Tarefa, 'id' | 'usuarioId'>>; // For updating

class TaskService {
  /**
   * Cria uma nova tarefa no backend.
   * @param userId - O ID do usuário que está criando a tarefa.
   * @param formData - Os dados da tarefa vindos do formulário.
   */
  async createTask(taskData: CreateTarefaDTO): Promise<Tarefa> {
    try {
      // Assemble the final payload that the backend expects, combining the user ID
      // with the form data into a single flat object.
      const headers = {
        'Content-Type': 'application/json',
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
  async getTasks(pageNumber = 0): Promise<Tarefa[]> {
    try {
      console.log(`[TaskService] Buscando tarefas para a página: ${pageNumber}`);
      // O backend retorna um objeto de paginação do Spring (Page<T>).
      // Precisamos especificar o tipo de retorno correto e extrair o array de 'content'.
      const { data } = await api.get<SpringPage<Tarefa>>('/tarefas', {
        params: { page: pageNumber }, // Spring usa 'page' por padrão
      });
      console.log(`[TaskService] ${data.content.length} tarefas encontradas nesta página.`);
      return data.content; // Retornamos apenas o array de tarefas
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar tarefas';
      console.error('[TaskService] Erro ao buscar tarefas:', errorMessage);
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
