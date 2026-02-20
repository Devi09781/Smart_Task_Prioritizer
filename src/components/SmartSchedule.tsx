import { Task, getPriorityFromScore } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMinutes, setHours, setMinutes, startOfDay } from 'date-fns';

interface SmartScheduleProps {
  tasks: Task[];
}

interface ScheduleSlot {
  startTime: Date;
  endTime: Date;
  task: Task | null;
  isBreak: boolean;
}

export function SmartSchedule({ tasks }: SmartScheduleProps) {
  const pendingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => b.priority_score - a.priority_score);

  // Generate schedule slots starting from 9 AM
  const generateSchedule = (): ScheduleSlot[] => {
    const schedule: ScheduleSlot[] = [];
    let currentTime = setMinutes(setHours(startOfDay(new Date()), 9), 0);
    const endOfDay = setMinutes(setHours(startOfDay(new Date()), 18), 0);

    for (const task of pendingTasks) {
      if (currentTime >= endOfDay) break;

      // Add task slot
      const taskEnd = addMinutes(currentTime, task.estimated_minutes);
      schedule.push({
        startTime: currentTime,
        endTime: taskEnd > endOfDay ? endOfDay : taskEnd,
        task,
        isBreak: false,
      });

      // Add break after task if more than 60 minutes
      if (task.estimated_minutes >= 60) {
        currentTime = addMinutes(taskEnd, 15);
        if (currentTime < endOfDay) {
          schedule.push({
            startTime: taskEnd,
            endTime: currentTime,
            task: null,
            isBreak: true,
          });
        }
      } else {
        currentTime = taskEnd;
      }

      // Add 5 min buffer between tasks
      currentTime = addMinutes(currentTime, 5);
    }

    return schedule.slice(0, 6); // Show max 6 slots
  };

  const schedule = generateSchedule();

  const priorityColors = {
    high: 'border-l-destructive bg-destructive/5',
    medium: 'border-l-accent bg-accent/5',
    low: 'border-l-success bg-success/5',
  };

  if (pendingTasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Smart Schedule</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Add tasks to generate your AI-optimized schedule
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Smart Schedule</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Today
        </Badge>
      </div>

      <div className="space-y-2">
        {schedule.map((slot, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-l-4 transition-all",
              slot.isBreak 
                ? "border-l-muted bg-muted/30"
                : slot.task && priorityColors[getPriorityFromScore(slot.task.priority_score)],
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Time */}
            <div className="flex-shrink-0 text-sm font-medium text-muted-foreground w-20">
              {format(slot.startTime, 'h:mm a')}
            </div>

            {/* Content */}
            {slot.isBreak ? (
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">☕ Break</span>
              </div>
            ) : slot.task && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {slot.task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {slot.task.estimated_minutes} min
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-xs h-5 capitalize"
                  >
                    {slot.task.category}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pendingTasks.length > 6 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          +{pendingTasks.length - 6} more tasks scheduled
        </p>
      )}
    </Card>
  );
}
