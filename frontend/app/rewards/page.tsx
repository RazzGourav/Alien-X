// frontend/app/rewards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { UserButton } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, Star, Zap, DollarSign } from 'lucide-react'; // Added DollarSign
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea

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
    // ... (Loading state) ...
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Rewards</h1>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="mb-8"><Header /></div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const redeemableDollars = data.points / 100;
  const isRedeemable = data.points >= 1000;
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Rewards Vault</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main className="space-y-10">
        
        {/* --- SECTION 1: THE VAULT (High Contrast Focus) --- */}
        <Card className="bg-primary border-4 border-ring/50 shadow-xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center">
              
              {/* Total Points */}
              <div className="text-center md:text-left space-y-2 text-primary-foreground">
                <CardDescription className="text-primary-foreground/80 text-lg uppercase">
                  Current Points Balance
                </CardDescription>
                <p className="text-6xl font-black">{data.points}</p>
                <p className="text-sm text-primary-foreground/70">100 Points = $1.00</p>
              </div>

              {/* Redeemable Cash Value */}
              <div className="text-center space-y-2 text-primary-foreground mt-6 md:mt-0">
                <p className="text-lg text-primary-foreground/80 uppercase">
                  Redeemable Value
                </p>
                <p className="text-5xl font-extrabold">
                  ${redeemableDollars.toFixed(2)}
                </p>
              </div>

              {/* Redeem Button (The Action) */}
              <div className="mt-8 md:mt-0 flex flex-col items-center">
                <Button
                  size="lg"
                  className={`w-full max-w-[200px] text-lg font-bold ${
                    isRedeemable ? 'bg-white text-primary hover:bg-gray-100' : 'bg-secondary/50 text-secondary-foreground cursor-not-allowed'
                  }`}
                  onClick={handleRedeemPoints}
                  disabled={isRedeeming || !isRedeemable}
                >
                  {isRedeeming ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-5 w-5" />
                      {isRedeemable ? "Redeem $10" : "Need 1000 Pts"}
                    </>
                  )}
                </Button>
                {!isRedeemable && (
                    <p className="text-xs text-primary-foreground/70 mt-2">
                        {1000 - data.points} points needed for $10 payout.
                    </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- SECTION 2: Active Challenges (Simplified Grid) --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Challenges & Achievements</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Budget Sniper Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Sniper Challenge</CardTitle>
                <CardDescription>
                  Earn points for every $1 you save under your limit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCalculateSniper} disabled={isCalculating} className="w-full">
                  {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Last Month's Reward
                </Button>
              </CardContent>
            </Card>

            {/* Instant Capture Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instant Capture Bonus</CardTitle>
                <CardDescription>
                  Reward is applied automatically and randomly at upload (for demo).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Keep uploading receipts quickly to maximize your "Speed Demon" bonus chance.
                </p>
              </CardContent>
            </Card>

            {/* Badges Gallery (Replaces the third column) */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg">Your Badges ({data.badges.length})</CardTitle>
                    <CardDescription>Your collection of achievements.</CardDescription>
                </CardHeader>
                <ScrollArea className="h-[120px] p-3">
                    <div className="flex flex-wrap gap-2">
                      {data.badges.length > 0 ? (
                        data.badges.map((badge) => (
                          <Badge key={badge} variant="default" className="text-sm p-2 whitespace-nowrap">
                            {getBadgeIcon(badge)}
                            {badge}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Start logging expenses to earn badges!
                        </p>
                      )}
                    </div>
                </ScrollArea>
            </Card>

          </div>
        </section>
      </main>
    </div>
  );
}