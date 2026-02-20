import { useState } from 'react';
import { Task, UpdateTaskInput, getPriorityFromScore, getPriorityLabel } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Check, 
  Clock, 
  Calendar, 
  MoreHorizontal, 
  Trash2, 
  Play, 
  Sparkles,
  GripVertical,
  Pencil
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditTaskDialog } from './EditTaskDialog';
import { TaskDecayIndicator } from './TaskDecayIndicator';
import { calculateTaskDecay } from '@/lib/taskDecay';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onStart: () => void;
  onDelete: () => void;
  onUpdate: (input: UpdateTaskInput) => Promise<unknown>;
  isAiProcessing?: boolean;
}

export function TaskCard({ task, onComplete, onStart, onDelete, onUpdate, isAiProcessing }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const priority = getPriorityFromScore(task.priority_score);
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
  const decay = calculateTaskDecay(task);
  
  const priorityColors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-accent/10 text-accent border-accent/20',
    low: 'bg-success/10 text-success border-success/20',
  };

  const priorityDotColors = {
    high: 'bg-destructive',
    medium: 'bg-accent',
    low: 'bg-success',
  };

  const categoryIcons: Record<string, string> = {
    work: '💼',
    personal: '🏠',
    study: '📚',
    health: '💪',
    other: '📌',
  };

  return (
    <Card
      className={cn(
        "group relative p-4 transition-all duration-300 cursor-pointer border-2",
        "hover:shadow-lifted hover:border-primary/20 hover:-translate-y-0.5",
        task.status === 'completed' && "opacity-60 hover:opacity-80",
        isOverdue && "border-destructive/30 bg-destructive/5",
        isAiProcessing && "animate-pulse-glow",
        // Apply decay styling
        task.status !== 'completed' && decay.cssClass
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority Indicator Bar - now integrated with decay */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all",
        decay.level === 'emergency' ? "bg-destructive" :
        decay.level === 'critical' ? "bg-destructive/80" :
        decay.level === 'stale' ? "bg-accent" :
        decay.level === 'aging' ? "bg-warning" :
        priorityDotColors[priority],
        isHovered && "w-1.5"
      )} />

      <div className="flex items-start gap-3 pl-3">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab pt-1">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Completion Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            task.status === 'completed' 
              ? "bg-success border-success text-success-foreground" 
              : "border-muted-foreground/30 hover:border-success hover:bg-success/10"
          )}
        >
          {task.status === 'completed' && <Check className="h-3.5 w-3.5" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-foreground truncate",
                task.status === 'completed' && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* AI Priority Badge */}
            {isAiProcessing && (
              <Badge variant="outline" className="flex items-center gap-1 bg-primary/5 border-primary/20 text-primary">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            )}
            
            {/* Decay Indicator */}
            {task.status !== 'completed' && (
              <TaskDecayIndicator task={task} size="sm" />
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Category */}
            <Badge variant="secondary" className="text-xs">
              {categoryIcons[task.category] || '📌'} {task.category}
            </Badge>

            {/* Priority */}
            <Badge className={cn("text-xs border", priorityColors[priority])}>
              {getPriorityLabel(priority)}
            </Badge>

            {/* Estimated Time */}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimated_minutes}min
            </span>

            {/* Deadline */}
            {task.deadline && (
              <span className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
              )}>
                <Calendar className="h-3 w-3" />
                {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
              </span>
            )}

            {/* Status Badge */}
            {task.status === 'in_progress' && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Play className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {task.status === 'pending' && (
              <DropdownMenuItem onClick={onStart}>
                <Play className="h-4 w-4 mr-2" />
                Start Task
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onComplete}>
              <Check className="h-4 w-4 mr-2" />
              {task.status === 'completed' ? 'Mark Incomplete' : 'Complete'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditTaskDialog
        task={task}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateTask={onUpdate}
      />
    </Card>
  );
}
