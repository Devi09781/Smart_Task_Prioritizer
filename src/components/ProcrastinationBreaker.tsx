import { useState, useMemo } from 'react';
import { Task, CreateTaskInput } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProcrastinationBreakerProps {
  tasks: Task[];
  onCreateTask: (input: CreateTaskInput) => Promise<unknown>;
}

interface MicroTask {
  title: string;
  duration: number;
  parentTaskId: string;
  parentTaskTitle: string;
}

export function ProcrastinationBreaker({ tasks, onCreateTask }: ProcrastinationBreakerProps) {
  const [loading, setLoading] = useState(false);
  const [createdMicroTasks, setCreatedMicroTasks] = useState<Set<string>>(new Set());

  // Find tasks that are being avoided (old and not started)
  const avoidedTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (t.status === 'completed') return false;
        const daysOld = differenceInDays(new Date(), new Date(t.created_at));
        return daysOld >= 2 && t.status === 'pending';
      })
      .sort((a, b) => {
        const daysA = differenceInDays(new Date(), new Date(a.created_at));
        const daysB = differenceInDays(new Date(), new Date(b.created_at));
        return daysB - daysA;
      })
      .slice(0, 3);
  }, [tasks]);

  // Generate micro-tasks for avoided tasks
  const microTasks = useMemo(() => {
    const generated: MicroTask[] = [];
    
    avoidedTasks.forEach(task => {
      const microTaskTemplates = [
        { title: `📝 Outline: ${task.title}`, duration: 5 },
        { title: `🔍 Research: ${task.title}`, duration: 10 },
        { title: `📋 List 3 steps for: ${task.title}`, duration: 5 },
        { title: `⏰ Set up workspace for: ${task.title}`, duration: 3 },
        { title: `🎯 Define goal for: ${task.title}`, duration: 5 },
      ];
      
      // Pick 1-2 random micro-tasks
      const shuffled = microTaskTemplates.sort(() => Math.random() - 0.5);
      shuffled.slice(0, 1).forEach(template => {
        generated.push({
          ...template,
          parentTaskId: task.id,
          parentTaskTitle: task.title,
        });
      });
    });
    
    return generated;
  }, [avoidedTasks]);

  const handleCreateMicroTask = async (microTask: MicroTask) => {
    setLoading(true);
    try {
      await onCreateTask({
        title: microTask.title,
        description: `Quick start task to break the barrier for: ${microTask.parentTaskTitle}`,
        estimated_minutes: microTask.duration,
        category: 'other',
      });
      
      setCreatedMicroTasks(prev => new Set([...prev, microTask.title]));
      toast.success(`Micro-task created! Just ${microTask.duration} mins to get started 💪`);
    } catch (error) {
      console.error('Error creating micro-task:', error);
      toast.error('Failed to create micro-task');
    } finally {
      setLoading(false);
    }
  };

  if (avoidedTasks.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Zap className="h-5 w-5 text-accent" />
          Procrastination Breaker
          <Badge variant="secondary" className="ml-auto text-xs">
            {avoidedTasks.length} avoided
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Stuck on a task? Start with a tiny 5-min action to build momentum
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {microTasks.map((microTask, index) => {
          const isCreated = createdMicroTasks.has(microTask.title);
          
          return (
            <div 
              key={`${microTask.parentTaskId}-${index}`}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-lg border transition-all",
                isCreated 
                  ? "bg-success/5 border-success/20" 
                  : "bg-card hover:bg-accent/5 hover:border-accent/30 cursor-pointer"
              )}
              onClick={() => !isCreated && !loading && handleCreateMicroTask(microTask)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isCreated 
                  ? "bg-success/20" 
                  : "bg-accent/10 group-hover:bg-accent/20"
              )}>
                {isCreated ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : loading ? (
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-accent" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "text-sm font-medium truncate",
                  isCreated && "text-muted-foreground line-through"
                )}>
                  {microTask.title}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {microTask.duration} min quick start
                </p>
              </div>
              
              {!isCreated && (
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );
        })}
        
        <p className="text-[10px] text-center text-muted-foreground pt-2">
          Click a micro-task to add it to your list and overcome the mental barrier
        </p>
      </CardContent>
    </Card>
  );
}
