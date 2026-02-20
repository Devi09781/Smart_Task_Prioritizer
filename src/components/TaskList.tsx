import { Task, UpdateTaskInput } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Loader2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  processingTaskIds: string[];
  onComplete: (task: Task) => void;
  onStart: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdate: (input: UpdateTaskInput) => Promise<unknown>;
}

export function TaskList({ 
  tasks, 
  loading, 
  processingTaskIds,
  onComplete, 
  onStart, 
  onDelete,
  onUpdate
}: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground">
          Create your first task and let AI help you prioritize!
        </p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Active Tasks ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="animate-slide-in-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskCard
                  task={task}
                  isAiProcessing={processingTaskIds.includes(task.id)}
                  onComplete={() => onComplete(task)}
                  onStart={() => onStart(task)}
                  onDelete={() => onDelete(task)}
                  onUpdate={onUpdate}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isAiProcessing={false}
                onComplete={() => onComplete(task)}
                onStart={() => onStart(task)}
                onDelete={() => onDelete(task)}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
