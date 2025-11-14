import api from './api';

interface ClassificarTarefaRequest {
  titulo: string;
  descricao?: string;
}

interface ClassificarTarefaResponse {
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  estimativa: number;
  categoria: string;
  sugestoes: string[];
}

interface ProdutividadeRequest {
  usuario_id: number;
  periodo: string;
}

interface ProdutividadeResponse {
  score: number;
  tendencia: 'CRESCENTE' | 'ESTAVEL' | 'DECRESCENTE';
  recomendacoes: string[];
  pontos_fortes: string[];
  areas_melhoria: string[];
}

interface ResumoRequest {
  usuario_id: number;
  data_inicio: string;
  data_fim: string;
}

interface ResumoResponse {
  resumo: string;
  principais_realizacoes: string[];
  desafios: string[];
  proximos_passos: string[];
}

class IAService {
  async classificarTarefa(request: ClassificarTarefaRequest): Promise<ClassificarTarefaResponse> {
    const { data } = await api.post<ClassificarTarefaResponse>('/ia/classificar-tarefa', request);
    return data;
  }

  async analisarProdutividade(request: ProdutividadeRequest): Promise<ProdutividadeResponse> {
    const { data } = await api.post<ProdutividadeResponse>('/ia/produtividade', request);
    return data;
  }

  async gerarResumo(request: ResumoRequest): Promise<ResumoResponse> {
    const { data } = await api.post<ResumoResponse>('/ia/resumo', request);
    return data;
  }
}

export default new IAService();
