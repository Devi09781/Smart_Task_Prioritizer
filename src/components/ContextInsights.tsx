import { useMemo } from 'react';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Lightbulb,
  Calendar
} from 'lucide-react';
import { format, getHours, differenceInMinutes, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface ContextInsightsProps {
  tasks: Task[];
}

interface Insight {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  type: 'suggestion' | 'pattern' | 'prediction';
}

export function ContextInsights({ tasks }: ContextInsightsProps) {
  const insights = useMemo(() => {
    const generatedInsights: Insight[] = [];
    const currentHour = getHours(new Date());
    
    // Analyze completed tasks for patterns
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completed_at);
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    // Pattern: Most productive hours
    if (completedTasks.length >= 3) {
      const hourCounts: Record<number, number> = {};
      completedTasks.forEach(t => {
        if (t.completed_at) {
          const hour = getHours(new Date(t.completed_at));
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });
      
      const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (peakHour) {
        const hour = parseInt(peakHour[0]);
        const isPeakTime = Math.abs(currentHour - hour) <= 1;
        
        generatedInsights.push({
          id: 'peak-hours',
          icon: <TrendingUp className="h-4 w-4 text-success" />,
          title: 'Peak Productivity',
          message: isPeakTime 
            ? `🔥 It's your peak time! You complete most tasks around ${format(new Date().setHours(hour, 0), 'h a')}`
            : `You're most productive around ${format(new Date().setHours(hour, 0), 'h a')}`,
          type: 'pattern',
        });
      }
    }

    // Pattern: Category preferences by time
    const morningTasks = completedTasks.filter(t => {
      if (!t.completed_at) return false;
      const hour = getHours(new Date(t.completed_at));
      return hour >= 6 && hour < 12;
    });
    
    const afternoonTasks = completedTasks.filter(t => {
      if (!t.completed_at) return false;
      const hour = getHours(new Date(t.completed_at));
      return hour >= 12 && hour < 18;
    });

    if (morningTasks.length >= 2) {
      const categoryCount: Record<string, number> = {};
      morningTasks.forEach(t => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
      });
      const topCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0];
      
      if (topCategory && currentHour >= 6 && currentHour < 12) {
        generatedInsights.push({
          id: 'morning-pattern',
          icon: <Calendar className="h-4 w-4 text-primary" />,
          title: 'Morning Pattern',
          message: `You usually tackle ${topCategory[0]} tasks in the morning. ${pendingTasks.filter(t => t.category === topCategory[0]).length} waiting!`,
          type: 'suggestion',
        });
      }
    }

    // Prediction: Similar task duration
    if (pendingTasks.length > 0 && completedTasks.length >= 2) {
      const topPendingCategory = pendingTasks[0]?.category;
      const similarCompletedTasks = completedTasks.filter(t => t.category === topPendingCategory);
      
      if (similarCompletedTasks.length >= 2) {
        const avgEstimate = similarCompletedTasks.reduce((sum, t) => sum + (t.estimated_minutes || 30), 0) / similarCompletedTasks.length;
        
        generatedInsights.push({
          id: 'duration-prediction',
          icon: <Clock className="h-4 w-4 text-accent" />,
          title: 'Time Prediction',
          message: `Similar ${topPendingCategory} tasks took you ~${Math.round(avgEstimate)} minutes on average`,
          type: 'prediction',
        });
      }
    }

    // Insight: Procrastination detection
    const oldPendingTasks = pendingTasks.filter(t => {
      const created = new Date(t.created_at);
      const daysOld = differenceInMinutes(new Date(), created) / (60 * 24);
      return daysOld >= 3;
    });

    if (oldPendingTasks.length >= 2) {
      const categories = [...new Set(oldPendingTasks.map(t => t.category))];
      const mostAvoided = categories.reduce((max, cat) => {
        const count = oldPendingTasks.filter(t => t.category === cat).length;
        return count > (max.count || 0) ? { category: cat, count } : max;
      }, { category: '', count: 0 });

      if (mostAvoided.category) {
        generatedInsights.push({
          id: 'procrastination',
          icon: <Brain className="h-4 w-4 text-warning" />,
          title: 'Avoidance Pattern',
          message: `You might be avoiding ${mostAvoided.category} tasks. Try a 5-min micro-task to break the barrier!`,
          type: 'suggestion',
        });
      }
    }

    // Insight: This week's momentum
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const completedThisWeek = completedTasks.filter(t => 
      t.completed_at && isWithinInterval(new Date(t.completed_at), { start: thisWeekStart, end: thisWeekEnd })
    );

    if (completedThisWeek.length > 0) {
      const dayOfWeek = new Date().getDay();
      const avgPerDay = completedThisWeek.length / Math.max(dayOfWeek, 1);
      
      if (avgPerDay >= 3) {
        generatedInsights.push({
          id: 'momentum',
          icon: <Lightbulb className="h-4 w-4 text-success" />,
          title: 'Great Momentum!',
          message: `You're averaging ${avgPerDay.toFixed(1)} tasks/day this week. Keep it up! 🚀`,
          type: 'pattern',
        });
      }
    }

    return generatedInsights.slice(0, 4); // Limit to 4 insights
  }, [tasks]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/10 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Context Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, index) => (
          <div 
            key={insight.id}
            className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-in-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="mt-0.5">{insight.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-medium">{insight.title}</h4>
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0"
                >
                  {insight.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
