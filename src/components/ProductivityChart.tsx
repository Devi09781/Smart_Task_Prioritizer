import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';

interface ProductivityChartProps {
  tasks: Task[];
}

export function ProductivityChart({ tasks }: ProductivityChartProps) {
  // Calculate daily completion data for the last 7 days
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const completedOnDay = tasks.filter(
      t => t.completed_at && isWithinInterval(new Date(t.completed_at), { start: dayStart, end: dayEnd })
    ).length;

    return {
      day: format(date, 'EEE'),
      completed: completedOnDay,
    };
  });

  // Category distribution
  const categoryData = tasks.reduce((acc, task) => {
    const existing = acc.find(c => c.name === task.category);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: task.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = [
    'hsl(234, 85%, 55%)', // primary
    'hsl(35, 95%, 55%)',  // accent
    'hsl(160, 65%, 45%)', // success
    'hsl(0, 75%, 55%)',   // destructive
    'hsl(220, 10%, 50%)', // muted
  ];

  const categoryEmojis: Record<string, string> = {
    work: '💼',
    personal: '🏠',
    study: '📚',
    health: '💪',
    other: '📌',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Chart */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Weekly Progress</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="completed" 
                fill="hsl(234, 85%, 55%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Distribution */}
      <Card className="p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Task Categories</h3>
        <div className="flex items-center gap-6">
          <div className="h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categoryData.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">
                  {categoryEmojis[cat.name] || '📌'} {cat.name}
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {cat.value}
                </span>
              </div>
            ))}
            {categoryData.length === 0 && (
              <p className="text-sm text-muted-foreground">No tasks yet</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
