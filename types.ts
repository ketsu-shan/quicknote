export type TaskZone = 'urgent' | 'important';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  zone: TaskZone;
}

export interface ArchivedDay {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  completedCount: number;
  totalCount: number;
}

export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}
