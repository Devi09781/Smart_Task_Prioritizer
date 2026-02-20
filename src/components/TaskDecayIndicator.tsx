import { Task } from '@/types/task';
import { calculateTaskDecay, getDecayEmoji, getDecayColor } from '@/lib/taskDecay';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface TaskDecayIndicatorProps {
  task: Task;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TaskDecayIndicator({ task, showProgress = false, size = 'md' }: TaskDecayIndicatorProps) {
  const decay = calculateTaskDecay(task);
  
  if (task.status === 'completed') return null;
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", sizeClasses[size])}>
            <span className={cn(
              "transition-all duration-300",
              decay.level === 'emergency' && "animate-streak-fire",
              decay.level === 'critical' && "animate-decay-pulse"
            )}>
              {getDecayEmoji(decay.level)}
            </span>
            {showProgress && (
              <Progress 
                value={decay.urgencyScore * 100} 
                className={cn(
                  "h-1.5 w-12",
                  decay.level === 'emergency' && "bg-destructive/20",
                  decay.level === 'critical' && "bg-destructive/10",
                  decay.level === 'stale' && "bg-accent/10",
                  decay.level === 'aging' && "bg-warning/10",
                  decay.level === 'fresh' && "bg-success/10"
                )}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <p className={cn("font-medium", getDecayColor(decay.level))}>
              {decay.message}
            </p>
            {decay.daysOld > 0 && (
              <p className="text-xs text-muted-foreground">
                Task age: {decay.daysOld} day{decay.daysOld !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
