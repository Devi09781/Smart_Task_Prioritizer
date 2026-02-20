import { differenceInHours, differenceInDays, isPast } from 'date-fns';
import { Task } from '@/types/task';

export type DecayLevel = 'fresh' | 'aging' | 'stale' | 'critical' | 'emergency';

export interface DecayInfo {
  level: DecayLevel;
  hoursOld: number;
  daysOld: number;
  urgencyScore: number; // 0-1
  message: string;
  cssClass: string;
}

/**
 * Calculate the decay level of a task based on age and deadline
 * Tasks visually "age" creating psychological pressure without annoying reminders
 */
export function calculateTaskDecay(task: Task): DecayInfo {
  const now = new Date();
  const createdAt = new Date(task.created_at);
  const hoursOld = differenceInHours(now, createdAt);
  const daysOld = differenceInDays(now, createdAt);
  
  // If task is completed, no decay
  if (task.status === 'completed') {
    return {
      level: 'fresh',
      hoursOld,
      daysOld,
      urgencyScore: 0,
      message: 'Completed!',
      cssClass: 'opacity-60',
    };
  }

  // Check deadline urgency first
  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const hoursToDeadline = differenceInHours(deadline, now);
    
    if (isPast(deadline)) {
      return {
        level: 'emergency',
        hoursOld,
        daysOld,
        urgencyScore: 1,
        message: '⚠️ Overdue! This task needs immediate attention',
        cssClass: 'decay-emergency',
      };
    }
    
    if (hoursToDeadline <= 2) {
      return {
        level: 'emergency',
        hoursOld,
        daysOld,
        urgencyScore: 0.95,
        message: '🔥 Due very soon! Focus on this now',
        cssClass: 'decay-emergency',
      };
    }
    
    if (hoursToDeadline <= 6) {
      return {
        level: 'critical',
        hoursOld,
        daysOld,
        urgencyScore: 0.8,
        message: '⏰ Due in a few hours',
        cssClass: 'decay-critical',
      };
    }
    
    if (hoursToDeadline <= 24) {
      return {
        level: 'stale',
        hoursOld,
        daysOld,
        urgencyScore: 0.6,
        message: '📅 Due today',
        cssClass: 'decay-stale',
      };
    }
  }

  // Age-based decay (for tasks without urgent deadlines)
  if (daysOld >= 7) {
    return {
      level: 'emergency',
      hoursOld,
      daysOld,
      urgencyScore: 0.9,
      message: `🪦 ${daysOld} days old - this task is withering away!`,
      cssClass: 'decay-emergency',
    };
  }
  
  if (daysOld >= 4) {
    return {
      level: 'critical',
      hoursOld,
      daysOld,
      urgencyScore: 0.7,
      message: `⚡ ${daysOld} days old - losing freshness`,
      cssClass: 'decay-critical',
    };
  }
  
  if (daysOld >= 2) {
    return {
      level: 'stale',
      hoursOld,
      daysOld,
      urgencyScore: 0.5,
      message: `🍂 ${daysOld} days old - starting to age`,
      cssClass: 'decay-stale',
    };
  }
  
  if (hoursOld >= 24) {
    return {
      level: 'aging',
      hoursOld,
      daysOld,
      urgencyScore: 0.3,
      message: '🌤️ Created yesterday',
      cssClass: 'decay-aging',
    };
  }

  return {
    level: 'fresh',
    hoursOld,
    daysOld,
    urgencyScore: 0.1,
    message: '✨ Fresh task',
    cssClass: 'decay-fresh',
  };
}

/**
 * Get decay indicator emoji based on level
 */
export function getDecayEmoji(level: DecayLevel): string {
  switch (level) {
    case 'fresh': return '🌱';
    case 'aging': return '🍃';
    case 'stale': return '🍂';
    case 'critical': return '🔥';
    case 'emergency': return '💀';
  }
}

/**
 * Get decay color for visual indicators
 */
export function getDecayColor(level: DecayLevel): string {
  switch (level) {
    case 'fresh': return 'text-success';
    case 'aging': return 'text-warning';
    case 'stale': return 'text-accent';
    case 'critical': return 'text-destructive';
    case 'emergency': return 'text-destructive';
  }
}
