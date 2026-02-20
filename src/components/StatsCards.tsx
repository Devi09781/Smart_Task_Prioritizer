import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  tasks: Task[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const totalMinutesEstimated = tasks
    .filter(t => t.status !== 'completed')
    .reduce((acc, t) => acc + t.estimated_minutes, 0);
  
  const hoursRemaining = Math.round(totalMinutesEstimated / 60 * 10) / 10;

  const highPriorityCount = tasks.filter(
    t => t.priority_score >= 0.7 && t.status !== 'completed'
  ).length;

  const stats = [
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: `${completedTasks} of ${totalTasks} tasks`,
      icon: Target,
      gradient: 'from-primary to-primary/60',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      subtext: `${pendingTasks} pending`,
      icon: TrendingUp,
      gradient: 'from-accent to-accent/60',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Time Remaining',
      value: `${hoursRemaining}h`,
      subtext: 'estimated work',
      icon: Clock,
      gradient: 'from-success to-success/60',
      bgColor: 'bg-success/10',
    },
    {
      label: 'High Priority',
      value: highPriorityCount,
      subtext: 'urgent tasks',
      icon: Flame,
      gradient: 'from-destructive to-destructive/60',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label}
          className={cn(
            "relative overflow-hidden p-5 transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5",
            "animate-slide-in-bottom"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background Icon */}
          <div className="absolute -right-4 -top-4 opacity-5">
            <stat.icon className="h-24 w-24" />
          </div>

          <div className="relative">
            <div className={cn(
              "inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3",
              stat.bgColor
            )}>
              <stat.icon className={cn(
                "h-5 w-5 bg-gradient-to-br bg-clip-text text-transparent",
                stat.gradient
              )} />
            </div>

            <div className="font-display text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            
            <div className="text-sm font-medium text-foreground/80">
              {stat.label}
            </div>
            
            <div className="text-xs text-muted-foreground mt-1">
              {stat.subtext}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
