import { NavigatorScreenParams } from '@react-navigation/native';
import { RelatorioGerado } from './report.types';

// Telas de Autenticação
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Telas do CRUD de Tarefas
export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  TaskForm: { taskId?: number };
};

// Telas do CRUD de Reuniões
export type MeetingsStackParamList = {
  MeetingList: undefined;
  MeetingDetail: { meetingId: number };
  MeetingForm: { meetingId?: number };
};

// Telas de Relatórios
export type ReportsStackParamList = {
  ReportList: undefined;
  ReportDetail: { report: RelatorioGerado };
};

// Abas principais do App
export type AppTabParamList = {
  DashboardTab: undefined;
  TasksTab: NavigatorScreenParams<TasksStackParamList>;
  MeetingsTab: NavigatorScreenParams<MeetingsStackParamList>;
  ReportsTab: NavigatorScreenParams<ReportsStackParamList>;
};