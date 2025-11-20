export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";

// Conforme a especificação do prompt.
export interface Tarefa {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  prioridade: Prioridade;
  estimativaMinutos?: number;
}

//DTO para criação de uma nova tarefa.

export type CreateTarefaDTO = Omit<Tarefa, 'id' | 'usuarioId'>;

// DTO para atualização de uma tarefa existente.

export type UpdateTarefaDTO = Partial<Omit<Tarefa, 'id' | 'usuarioId'>>;