// frontend/app/rewards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, Star, Zap, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';

interface RewardData {
  points: number;
  badges: string[];
  limit: number;
}

export default function RewardsPage() {
  const [data, setData] = useState<RewardData>({ points: 0, badges: [], limit: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false); 

  // Function to fetch the latest reward data
  const fetchRewardData = async () => {
    try {
      const response = await fetch('/api/rewards');
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const rewardData = await response.json();
      setData(rewardData);
    } catch (error: any) {
      toast.error('Failed to load rewards data', { description: error.message });
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    setIsLoading(true);
    fetchRewardData().finally(() => setIsLoading(false));
  }, []);

  // Handler for the "Budget Sniper" button (kept as is)
  const handleCalculateSniper = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/rewards/calculate', { method: 'POST' });
      const result = await response.json();

      if (result.status === 'reward_granted') {
        toast.success(`You earned ${result.points_awarded} points!`, {
          description: `You spent $${result.spend.toFixed(2)} and stayed under your $${result.limit.toFixed(2)} limit.`,
        });
        await fetchRewardData();
      } else if (result.status === 'no_reward') {
        toast.info("No points this time.", {
          description: `You spent $${result.spend.toFixed(2)}, which was over your $${result.limit.toFixed(2)} limit.`,
        });
      } else if (result.status === 'no_limit_set') {
        toast.error("Set your spending limit first!", {
          description: "Go to the Expenses page to set your monthly limit.",
        });
      }
    } catch (error: any) {
      toast.error('Failed to calculate rewards', { description: error.message });
    } finally {
      setIsCalculating(false);
    }
  };

  // Handler for the "Redeem Points" button (kept as is)
  const handleRedeemPoints = async () => {
    setIsRedeeming(true);
    try {
      const response = await fetch('/api/rewards/redeem', { method: 'POST' });
      const result = await response.json();

      if (result.status === 'success') {
        toast.success(`Success! $10 has been redeemed.`, {
          description: "Your points balance has been updated.",
        });
        await fetchRewardData();
      } else if (result.status === 'insufficient_points') {
        toast.error("Not enough points to redeem.", {
          description: `You need 1000 points (you have ${result.current_points}).`,
        });
      } else {
        throw new Error("An unknown error occurred.");
      }
    } catch (error: any) {
      toast.error('Failed to redeem points', { description: error.message });
    } finally {
      setIsRedeeming(false);
    }
  };

  // Helper to get an icon for a badge
  const getBadgeIcon = (badgeName: string) => {
    if (badgeName === 'Budget Sniper') return <Award className="mr-2 h-4 w-4" />;
    if (badgeName === 'Speed Demon') return <Zap className="mr-2 h-4 w-4" />;
    return <Star className="mr-2 h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight">Rewards</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const redeemableDollars = data.points / 100;
  const isRedeemable = data.points >= 1000;
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Rewards Vault</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <main className="space-y-10">
        
        {/* --- SECTION 1: POINTS OVERVIEW --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Points Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Total Points"
              value={data.points}
              icon={Sparkles}
              description="Available to redeem"
              trend={{ value: Math.min(100, (data.points / 1000) * 100), direction: 'up' }}
            />
            <StatsCard
              title="Redeemable Value"
              value={`$${redeemableDollars.toFixed(2)}`}
              icon={DollarSign}
              description="100 points = $1.00"
            />
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-sm">Redemption Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-semibold">{Math.min(100, (data.points / 1000) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                      style={{ width: `${Math.min(100, (data.points / 1000) * 100)}%` }}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleRedeemPoints}
                    disabled={isRedeeming || !isRedeemable}
                  >
                    {isRedeeming ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        {isRedeemable ? "Redeem $10" : `Need ${1000 - data.points} pts`}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- SECTION 2: Active Challenges (Simplified Grid) --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Challenges & Achievements</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Budget Sniper Card */}
            <Card className="card-enhanced border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Budget Sniper Challenge
                </CardTitle>
                <CardDescription>
                  Earn points for every $1 you save under your limit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm font-semibold text-primary">10 points per $1 saved</p>
                </div>
                <Button onClick={handleCalculateSniper} disabled={isCalculating} className="w-full">
                  {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Last Month's Reward
                </Button>
              </CardContent>
            </Card>

            {/* Instant Capture Card */}
            <Card className="card-enhanced border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  Instant Capture Bonus
                </CardTitle>
                <CardDescription>
                  Reward is applied automatically and randomly at upload.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/10 rounded-lg p-3">
                  <p className="text-sm font-semibold text-secondary">50 points + Speed Demon badge</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep uploading receipts quickly to maximize your bonus chance.
                </p>
              </CardContent>
            </Card>

            {/* Badges Gallery */}
            <Card className="card-enhanced border-l-4 border-l-accent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent" />
                      Your Badges ({data.badges.length})
                    </CardTitle>
                    <CardDescription>Your collection of achievements.</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.badges.length > 0 ? (
                    <ScrollArea className="h-[150px] pr-4">
                      <div className="flex flex-wrap gap-2">
                        {data.badges.map((badge) => (
                          <Badge key={badge} variant="default" className="text-sm p-2 whitespace-nowrap bg-accent/20 text-accent border-accent/50">
                            {getBadgeIcon(badge)}
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Start logging expenses to earn badges!
                      </p>
                    </div>
                  )}
                </CardContent>
            </Card>

            {/* New Card for Redeem History */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg">Redemption History</CardTitle>
                    <CardDescription>Track your past redemptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Coming soon...
                    </p>
                </CardContent>
            </Card>

          </div>
        </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}