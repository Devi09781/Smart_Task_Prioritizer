import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Flame, 
  Target, 
  Star,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Task } from '@/types/task';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_count: number;
  current_count: number;
  xp_reward: number;
  status: string;
  expires_at: string;
}

interface FocusChallengesProps {
  tasks: Task[];
}

export function FocusChallenges({ tasks }: FocusChallengesProps) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userStats, setUserStats] = useState({
    totalXp: 0,
    level: 1,
    currentStreak: 0,
  });

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchUserStats();
    }
  }, [user]);

  // Update challenge progress when tasks change
  useEffect(() => {
    if (challenges.length > 0 && tasks.length > 0) {
      updateChallengeProgress();
    }
  }, [tasks]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('focus_challenges')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setChallenges((data || []) as Challenge[]);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_xp, level, current_streak')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserStats({
          totalXp: data.total_xp || 0,
          level: data.level || 1,
          currentStreak: data.current_streak || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const updateChallengeProgress = async () => {
    // Count completed tasks for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = tasks.filter(t => 
      t.status === 'completed' && 
      t.completed_at && 
      new Date(t.completed_at) >= today
    ).length;

    // Update challenges that track completions
    for (const challenge of challenges) {
      if (challenge.current_count !== completedToday && completedToday <= challenge.target_count) {
        const newCount = Math.min(completedToday, challenge.target_count);
        const isCompleted = newCount >= challenge.target_count;
        
        await supabase
          .from('focus_challenges')
          .update({ 
            current_count: newCount,
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', challenge.id);

        if (isCompleted) {
          // Award XP
          await supabase
            .from('profiles')
            .update({ 
              total_xp: userStats.totalXp + challenge.xp_reward,
              level: Math.floor((userStats.totalXp + challenge.xp_reward) / 500) + 1
            })
            .eq('user_id', user?.id);

          toast.success(`🎉 Challenge completed! +${challenge.xp_reward} XP`);
          fetchUserStats();
        }
      }
    }
    
    fetchChallenges();
  };

  const generateNewChallenge = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const pendingCount = tasks.filter(t => t.status !== 'completed').length;
      const challengeTemplates = [
        { title: 'Speed Demon', description: 'Complete 3 tasks before noon', target: 3, xp: 75 },
        { title: 'Deep Focus', description: 'Complete 2 high-priority tasks', target: 2, xp: 100 },
        { title: 'Task Crusher', description: 'Complete 5 tasks today', target: 5, xp: 150 },
        { title: 'Quick Wins', description: 'Complete 4 tasks under 30 minutes each', target: 4, xp: 80 },
        { title: 'Category Master', description: 'Complete tasks from 3 different categories', target: 3, xp: 90 },
      ];

      const template = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      const { error } = await supabase
        .from('focus_challenges')
        .insert({
          user_id: user.id,
          title: template.title,
          description: template.description,
          target_count: Math.min(template.target, Math.max(pendingCount, 2)),
          xp_reward: template.xp,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;
      
      toast.success('New challenge generated! 🎯');
      fetchChallenges();
    } catch (error) {
      console.error('Error generating challenge:', error);
      toast.error('Failed to generate challenge');
    } finally {
      setGenerating(false);
    }
  };

  const xpToNextLevel = (userStats.level * 500) - userStats.totalXp;
  const levelProgress = ((userStats.totalXp % 500) / 500) * 100;

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Target className="h-5 w-5 text-primary" />
            Focus Challenges
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateNewChallenge}
            disabled={generating || challenges.length >= 3}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Stats Bar */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {userStats.level}
              </div>
              <Star className="absolute -top-1 -right-1 h-4 w-4 text-accent fill-accent" />
            </div>
            <div className="text-xs">
              <p className="font-medium">Level {userStats.level}</p>
              <p className="text-muted-foreground">{xpToNextLevel} XP to next</p>
            </div>
          </div>
          
          <div className="flex-1">
            <Progress value={levelProgress} className="h-2" />
          </div>
          
          {userStats.currentStreak > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-accent animate-streak-fire" />
              {userStats.currentStreak} day streak
            </Badge>
          )}
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active challenges</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={generateNewChallenge}
              disabled={generating}
            >
              Generate Challenge
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const progress = (challenge.current_count / challenge.target_count) * 100;
              const isNearComplete = progress >= 75;
              
              return (
                <div 
                  key={challenge.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isNearComplete && "border-accent/50 bg-accent/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-1.5">
                        {isNearComplete && <Zap className="h-3.5 w-3.5 text-accent" />}
                        {challenge.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{challenge.xp_reward} XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {challenge.current_count}/{challenge.target_count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
