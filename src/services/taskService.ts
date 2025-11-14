import api from './api';
import { Tarefa } from '../types/models';

class TaskService {
  async getTasks(usuarioId: number): Promise<Tarefa[]> {
    const { data } = await api.get<Tarefa[]>('/tarefas', {
      params: { usuario_id: usuarioId }
    });
    return data;
  }

  async getTaskById(id: number): Promise<Tarefa> {
    const { data } = await api.get<Tarefa>(`/tarefas/${id}`);
    return data;
  }

  async createTask(tarefa: Omit<Tarefa, 'id'>): Promise<Tarefa> {
    const { data } = await api.post<Tarefa>('/tarefas', {
      ...tarefa,
      status: tarefa.status || 'PENDENTE',
      criado_em: new Date().toISOString(),
    });
    return data;
  }

  async updateTask(id: number, tarefa: Partial<Tarefa>): Promise<Tarefa> {
    const { data } = await api.put<Tarefa>(`/tarefas/${id}`, tarefa);
    return data;
  }

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tarefas/${id}`);
  }

  async getTasksByStatus(usuarioId: number, status: string): Promise<Tarefa[]> {
    const { data } = await api.get<Tarefa[]>('/tarefas', {
      params: { usuario_id: usuarioId, status }
    });
    return data;
  }

  async getTasksByPriority(usuarioId: number, prioridade: string): Promise<Tarefa[]> {
    const { data } = await api.get<Tarefa[]>('/tarefas', {
      params: { usuario_id: usuarioId, prioridade }
    });
    return data;
  }
}

export default new TaskService();
