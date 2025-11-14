// frontend/app/rewards/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { UserButton } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface RewardData {
  points: number;
  badges: string[];
}

export default function RewardsPage() {
  const [data, setData] = useState<RewardData>({ points: 0, badges: [] });
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

  // Handler for the "Budget Sniper" button
  const handleCalculateSniper = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/rewards/calculate', { method: 'POST' });
      const result = await response.json();

      if (result.status === 'reward_granted') {
        toast.success(`You earned ${result.points_awarded} points!`, {
          description: `You spent $${result.spend.toFixed(2)} and stayed under your $${result.limit.toFixed(2)} limit.`,
        });
        // Refresh data to show new points and badge
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
  const handleRedeemPoints = async () => {
    setIsRedeeming(true);
    try {
      const response = await fetch('/api/rewards/redeem', { method: 'POST' });
      const result = await response.json();

      if (result.status === 'success') {
        toast.success(`You redeemed 1000 points for $10!`, {
          description: "The cash is on its way (this is a demo).",
        });
        // Refresh data to show new points total
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Rewards</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main className="space-y-8">
        {/* Section 1: Total Points and Badges */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>My Badges</CardTitle>
              <CardDescription>Your collection of achievements.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.badges.map((badge) => (
                    <Badge key={badge} variant="default" className="text-lg p-2">
                      {getBadgeIcon(badge)}
                      {badge}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Start logging expenses to earn badges!
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Points</CardTitle>
              <CardDescription>Earned from challenges.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">{data.points}</p>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Reward Challenges */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-white">Redeem Your Points</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  100 points = $1.00 USD. Redeemable in $10 batches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-primary-foreground/80">Your Current Balance</p>
                  <p className="text-3xl font-bold text-white">
                    ${(data.points / 100).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="w-full text-primary hover:bg-white/90"
                  onClick={handleRedeemPoints}
                  disabled={isRedeeming || data.points < 1000}
                >
                  {isRedeeming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {data.points < 1000
                    ? `Need ${1000 - data.points} more points`
                    : "Redeem 1000 points ($10)"}
                </Button>
              </CardContent>
            </Card>
            {/* Budget Sniper Card */}
            <Card>
              <CardHeader>
                <CardTitle>The "Budget Sniper"</CardTitle>
                <CardDescription>
                  Earn 10 points for every $1 you save under your monthly limit.
                  (Calculated for last month)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCalculateSniper} disabled={isCalculating}>
                  {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Last Month's Reward
                </Button>
              </CardContent>
            </Card>

            {/* Instant Capture Card */}
            <Card>
              <CardHeader>
                <CardTitle>The "Instant Capture"</CardTitle>
                <CardDescription>
                  Upload your receipt within 1 hour of purchase to earn a
                  "Speed Demon" badge and 50 points.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This reward is applied automatically and randomly (for this demo)
                  every time you upload a receipt. Keep uploading!
                </p>
              </CardContent>
            </Card>

          </div>
        </section>
      </main>
    </div>
  );
}