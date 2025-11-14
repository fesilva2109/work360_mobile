import api from './api';
import { DadosIoT } from '../types/models';

class IoTService {
  async sendSensorData(dados: Omit<DadosIoT, 'id' | 'timestamp'>): Promise<DadosIoT> {
    const { data } = await api.post<DadosIoT>('/iot/sensordata', {
      ...dados,
      timestamp: new Date().toISOString(),
    });
    return data;
  }

  async getSensorHistory(usuarioId: number): Promise<DadosIoT[]> {
    const { data } = await api.get<DadosIoT[]>('/iot/sensordata', {
      params: { usuarioId }
    });
    return data;
  }

  async getLatestSensorData(usuarioId: number): Promise<DadosIoT | null> {
    const history = await this.getSensorHistory(usuarioId);
    return history[0] || null;
  }
}

export default new IoTService();
