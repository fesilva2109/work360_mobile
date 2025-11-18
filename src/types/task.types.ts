export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";

// Conforme a especificação do prompt.
export interface Tarefa {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  prioridade: Prioridade;
  estimativaMinutos?: number; // Opcional, como no formulário.
}

/**
 * DTO para criação de uma nova tarefa.
 * O `usuarioId` será inferido pelo backend a partir do token.
 */
export type CreateTarefaDTO = Omit<Tarefa, 'id' | 'usuarioId'>;

/**
 * DTO para atualização de uma tarefa existente.
 */
export type UpdateTarefaDTO = Partial<Omit<Tarefa, 'id' | 'usuarioId'>>;