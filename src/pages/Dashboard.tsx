import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useAIPrioritization } from '@/hooks/useAIPrioritization';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { TaskList } from '@/components/TaskList';
import { StatsCards } from '@/components/StatsCards';
import { SmartSchedule } from '@/components/SmartSchedule';
import { ProductivityChart } from '@/components/ProductivityChart';
import { FocusChallenges } from '@/components/FocusChallenges';
import { ContextInsights } from '@/components/ContextInsights';
import { ProcrastinationBreaker } from '@/components/ProcrastinationBreaker';
import { 
  Sparkles, 
  LogOut, 
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, updatePriorities } = useTasks();
  const { isProcessing, processingTaskIds, prioritizeTasks } = useAIPrioritization();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAIPrioritize = async () => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length === 0) {
      toast.info('No pending tasks to prioritize');
      return;
    }

    const priorities = await prioritizeTasks(pendingTasks);
    if (priorities) {
      // Update tasks with new priorities
      const updatedTasks = tasks.map(task => {
        if (priorities[task.id] !== undefined) {
          return { ...task, priority_score: priorities[task.id] };
        }
        return task;
      });

      // Update in database
      for (const [taskId, score] of Object.entries(priorities)) {
        await supabase
          .from('tasks')
          .update({ priority_score: score })
          .eq('id', taskId);
      }

      // Update local state
      updatePriorities(updatedTasks.sort((a, b) => b.priority_score - a.priority_score));
    }
  };

  const handleComplete = async (task: typeof tasks[0]) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask({ id: task.id, status: newStatus });
  };

  const handleStart = async (task: typeof tasks[0]) => {
    await updateTask({ id: task.id, status: 'in_progress' });
  };

  const handleDelete = async (task: typeof tasks[0]) => {
    await deleteTask(task.id);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Smart Task Prioritizer
              </h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleAIPrioritize}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              AI Prioritize
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <StatsCards tasks={tasks} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task List - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-xl">Your Tasks</h2>
              <CreateTaskDialog onCreateTask={createTask} />
            </div>
            <TaskList
              tasks={tasks}
              loading={tasksLoading}
              processingTaskIds={processingTaskIds}
              onComplete={handleComplete}
              onStart={handleStart}
              onDelete={handleDelete}
              onUpdate={updateTask}
            />
          </div>

          {/* Smart Schedule & Intelligence - Takes 1 column */}
          <div className="space-y-6">
            <FocusChallenges tasks={tasks} />
            <ContextInsights tasks={tasks} />
            <ProcrastinationBreaker tasks={tasks} onCreateTask={createTask} />
            <SmartSchedule tasks={tasks} />
          </div>
        </div>

        {/* Analytics */}
        <div>
          <h2 className="font-display font-semibold text-xl mb-4">Productivity Analytics</h2>
          <ProductivityChart tasks={tasks} />
        </div>
      </main>
    </div>
  );
}
