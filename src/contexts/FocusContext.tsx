import React, { createContext, useState, useContext, ReactNode, useRef, useCallback, useEffect } from 'react';
import { FocusSession } from '../types/focus.types';
import focusService from '../services/focusService';
import analyticsService from '../services/analyticsService';
import { useAuth } from './AuthContext';

export type FocusStatus = 'inactive' | 'active' | 'summary';

interface SummaryData {
  avgBpm: number;
  avgNoiseDb: number;
  duration: number;
  startTime: string;
  endTime?: string;
}

interface FocusContextData {
  session: FocusSession | null;
  status: FocusStatus;
  elapsedTime: number;
  summary: SummaryData | null;
  isLoading: boolean;
  startFocusSession(): Promise<void>;
  stopFocusSession(): Promise<void>;
  finishSummary(): void;
}

const FocusContext = createContext<FocusContextData>({} as FocusContextData);

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [session, setSession] = useState<FocusSession | null>(null);
  const [status, setStatus] = useState<FocusStatus>('inactive');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startFocusSession = async () => {
    if (!usuario) throw new Error('Usuário não autenticado.');
    setIsLoading(true);
    try {
      const newSession = await focusService.startSession(usuario.id);
      setSession(newSession);
      setElapsedTime(0);
      setStatus('active');
      startTimer();
      await analyticsService.createEvento({ usuarioId: usuario.id, tipoEvento: 'FOCO_INICIO' });
    } finally {
      setIsLoading(false);
    }
  };

  const stopFocusSession = async () => {
    if (!session || !usuario) throw new Error('Nenhuma sessão ativa.');
    setIsLoading(true);
    clearTimer();
    try {
      const stoppedSession = await focusService.stopSession(session.id);
      setSummary({
        avgBpm: stoppedSession.avgBpm || 0,
        avgNoiseDb: stoppedSession.avgNoiseDb || 0,
        duration: elapsedTime,
        startTime: stoppedSession.startTime,
        endTime: stoppedSession.endTime,
      });
      await analyticsService.createEvento({ usuarioId: usuario.id, tipoEvento: 'FOCO_FIM' });
      setSession(null);
      setElapsedTime(0);
      setStatus('summary');
    } finally {
      setIsLoading(false);
    }
  };

  const finishSummary = () => {
    setSummary(null);
    setStatus('inactive');
  };

  return (
    <FocusContext.Provider value={{ session, status, elapsedTime, summary, isLoading, startFocusSession, stopFocusSession, finishSummary }}>
      {children}
    </FocusContext.Provider>
  );
};

export function useFocus(): FocusContextData {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus deve ser usado dentro de um FocusProvider');
  }
  return context;
}