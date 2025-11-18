
import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import iotService from '../services/iotService';
import { useAuth } from './AuthContext';
import { DadosIoT } from '../types/models';

interface FocusContextData {
  isActive: boolean;
  isPaused: boolean;
  time: number;
  iotData: { heartRate: number; noiseLevel: number };
  startFocus: () => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  stopFocus: () => void;
}

const FocusContext = createContext<FocusContextData>({} as FocusContextData);

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [iotData, setIotData] = useState({ heartRate: 0, noiseLevel: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const iotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (iotTimerRef.current) {
      clearInterval(iotTimerRef.current);
      iotTimerRef.current = null;
    }
  };

  const startTimers = () => {
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    iotTimerRef.current = setInterval(async () => {
      if (!usuario) return;

      // Simular dados de sensores
      const newHeartRate = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // Batimentos entre 65 e 95 bpm
      const newNoiseLevel = Math.random() * (70 - 30) + 30; // Ruído entre 30 e 70 dB

      setIotData({ heartRate: newHeartRate, noiseLevel: newNoiseLevel });

      try {
        await iotService.sendSensorData({
          usuarioId: usuario.id,
          heartRate: newHeartRate,
          noiseLevel: newNoiseLevel,
        });
      } catch (error) {
        console.error("Erro ao enviar dados do sensor:", error);
        // Opcional: Adicionar um alerta para o usuário
      }
    }, 5000); // Envia dados a cada 5 segundos
  };

  const startFocus = () => {
    setTime(0);
    setIotData({ heartRate: 0, noiseLevel: 0 });
    setIsActive(true);
    setIsPaused(false);
    startTimers();
  };

  const pauseFocus = () => {
    setIsPaused(true);
    clearTimers();
  };

  const resumeFocus = () => {
    setIsPaused(false);
    startTimers();
  };

  const stopFocus = () => {
    setIsActive(false);
    setIsPaused(false);
    clearTimers();
    setTime(0);
    setIotData({ heartRate: 0, noiseLevel: 0 });
  };

  useEffect(() => {
    // Limpa os timers quando o componente é desmontado
    return () => clearTimers();
  }, []);

  return (
    <FocusContext.Provider
      value={{
        isActive,
        isPaused,
        time,
        iotData,
        startFocus,
        pauseFocus,
        resumeFocus,
        stopFocus,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export function useFocus(): FocusContextData {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
