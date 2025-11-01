import { ReactNode } from 'react';

export interface Module {
  id: string;
  name: string;
  icon: ReactNode;
  component: React.ComponentType<any>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface Account {
  id:string;
  name: string;
  balance: number;
  includeInBudget: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string; // e.g., a Tailwind color class like 'bg-blue-500'
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  accountId: string;
  categoryId: string;
  date: string;
}

export interface Budget {
  id:string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  imageUrl?: string;
  targetDate?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completionTime: { hours: number; minutes: number } | null;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  price: number;
  status: 'To Do' | 'In Progress' | 'Done';
  subtasks: Subtask[];
  completionTime?: { hours: number; minutes: number } | null;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  companyName?: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  isArchived?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  goal: number; // monthly goal
}

export interface HabitLog {
  id: string; // composite key: habitId-YYYY-MM-DD
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface GeneratedReport {
    startDate: string;
    endDate: string;
    projects: {
        [projectId: string]: {
            project: Project;
            completedTasks: Task[];
        };
    };
    totals: {
        totalValue: number;
        totalHours: number;
        totalMinutes: number;
    };
    companyBreakdown: {
        companyName: string;
        totalValue: number;
    }[];
    aiSummary?: string;
}