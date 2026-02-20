export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  estimated_minutes: number;
  priority_score: number;
  category: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  deadline?: string;
  estimated_minutes?: number;
  category?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  deadline?: string;
  estimated_minutes?: number;
  category?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export type Priority = 'high' | 'medium' | 'low';

export function getPriorityFromScore(score: number): Priority {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
  }
}
