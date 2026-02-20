import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Target, 
  Clock, 
  Brain, 
  Zap, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Priority',
      description: 'Smart algorithms analyze deadlines, effort, and urgency to rank your tasks.',
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Auto-generate optimized daily schedules based on your productivity patterns.',
    },
    {
      icon: BarChart3,
      title: 'Productivity Analytics',
      description: 'Track your progress with beautiful charts and actionable insights.',
    },
    {
      icon: Zap,
      title: 'Adaptive Learning',
      description: 'The system learns from your habits to improve recommendations over time.',
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Smart Task Prioritizer
            </span>
          </div>
          <Link to="/auth">
            <Button variant="hero">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            AI-Powered Productivity
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-in-bottom">
            <span className="text-foreground">Prioritize Smarter,</span>
            <br />
            <span className="text-gradient-hero">Achieve More</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
            Let AI analyze your tasks, optimize your schedule, and help you focus on what matters most. 
            Build better habits with intelligent productivity insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
            <Link to="/auth">
              <Button variant="hero" size="xl" className="gap-2">
                Start Prioritizing Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No credit card required
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="p-6 bg-gradient-card hover:shadow-lifted transition-all duration-300 hover:-translate-y-1 animate-slide-in-bottom"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground mb-4">Built for</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            {['Students', 'Professionals', 'Freelancers', 'Teams'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Smart Task Prioritizer. Built with AI-powered intelligence.</p>
        </div>
      </footer>
    </div>
  );
}
