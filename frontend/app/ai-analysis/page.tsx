// frontend/app/ai-analysis/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, AlertTriangle, FileCheck2, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';

// Chart components
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { SpendingLineChart } from '@/components/SpendingLineChart';
import { SummaryBarChart } from '@/components/SummaryBarChart';

// UI components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Define a type for the full analysis data
interface AnalysisData {
  summary_stats: {
    salary: number;
    limit: number;
    total_spent_this_month: number;
  };
  spending_by_category: { name: string; value: number }[];
  spending_over_time: { name: string; total: number }[];
  ai_insights: {
    top_category: { name: string; value: number } | null;
    uncategorized_spend: number;
  };
}

export default function AiAnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- State for the "Fee Hunter" simulation ---
  const [isAnalyzingFees, setIsAnalyzingFees] = useState(false);
  const [feeReport, setFeeReport] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch('/api/analysis');
        if (!response.ok) {
          throw new Error('Failed to fetch analysis');
        }
        const analysisData: AnalysisData = await response.json();
        setData(analysisData);
      } catch (error: any) {
        toast.error('Failed to load analysis data', {
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  // --- "Fee Hunter" simulation functions ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  const handleAnalyzeFees = () => {
    if (!fileName) {
      toast.error("Please select a statement file first.");
      return;
    }
    setIsAnalyzingFees(true);
    setFeeReport(null);

    // Simulate AI processing
    setTimeout(() => {
      const hardcodedReport = "You are paying a **1.5% annual expense ratio** on your 'BlueChip Growth Fund'. Similar direct-index funds charge around **0.5%**. By switching, you could save **~₹50,000** over the next 10 years.";
      setFeeReport(hardcodedReport);
      setIsAnalyzingFees(false);
      
      const fileInput = document.getElementById('statement-file') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setFileName("");
      
      toast.success("Analysis Complete!");
    }, 2500); // 2.5 second simulation
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight">AI Analysis</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>
          <div className="flex-1 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="ml-4 text-lg mt-4">Your AI coach is analyzing your data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight">AI Analysis</h1>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>
          <div className="flex-1 p-6">
            <p className="text-muted-foreground">Could not load analysis data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Data for the summary bar chart
  const summaryChartData = {
    salary: data.summary_stats.salary,
    limit: data.summary_stats.limit,
    spent: data.summary_stats.total_spent_this_month,
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Analysis</h1>
              <p className="text-sm text-muted-foreground mt-1">Let your AI coach find insights in your data.</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts">Expenditure Charts</TabsTrigger>
          <TabsTrigger value="audits">AI Audits & Insights</TabsTrigger>
        </TabsList>
        
        {/* === TAB 1: ALL THE CHARTS === */}
        <TabsContent value="charts" className="mt-6">
          <main className="space-y-8">
            {/* Summary Stats */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Quick Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Monthly Salary"
                  value={`$${data.summary_stats.salary.toFixed(2)}`}
                  icon={TrendingUp}
                />
                <StatsCard
                  title="Spending Limit"
                  value={`$${data.summary_stats.limit.toFixed(2)}`}
                  icon={AlertTriangle}
                />
                <StatsCard
                  title="Total Spent"
                  value={`$${data.summary_stats.total_spent_this_month.toFixed(2)}`}
                  icon={BarChart3}
                  trend={{ value: (data.summary_stats.total_spent_this_month / data.summary_stats.limit) * 100, direction: 'up' }}
                />
              </div>
            </section>

            {/* Charts Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Financial Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Spending by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryPieChart data={data.spending_by_category} />
                  </CardContent>
                </Card>
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Budget Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SummaryBarChart data={summaryChartData} />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Spending Over Time */}
            <section>
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Spending Over Time
                  </CardTitle>
                  <CardDescription>Track your spending trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <SpendingLineChart data={data.spending_over_time} />
                </CardContent>
              </Card>
            </section>
          </main>
        </TabsContent>
        
        {/* === TAB 2: ALL THE AI INSIGHTS === */}
        <TabsContent value="audits" className="mt-6">
          <main className="space-y-8">
            {/* --- "Fee Hunter" (Moved to top) --- */}
            <section>
              <Card className="border-2 border-primary/50">
                <CardHeader>
                  <CardTitle>The "Fee Hunter" (Audit Mode)</CardTitle>
                  <CardDescription>
                    Upload an investment statement to audit hidden fees. (Demo)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="statement-file">Investment Statement (PDF)</Label>
                    <Input id="statement-file" type="file" onChange={handleFileChange} />
                  </div>
                  <Button
                    onClick={handleAnalyzeFees}
                    disabled={isAnalyzingFees || !fileName}
                  >
                    {isAnalyzingFees ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileCheck2 className="mr-2 h-4 w-4" />
                    )}
                    Analyze Fees
                  </Button>
                  
                  {feeReport && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>High Fees Detected!</AlertTitle>
                      {/* FIX: Move className here and remove it from ReactMarkdown */}
                      <AlertDescription className="prose prose-sm max-w-none text-foreground"> 
                    <ReactMarkdown>
                      {feeReport}
                    </ReactMarkdown>
                  </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </section>
            
            {/* --- "AI-Driven Insights" --- */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">AI-Driven Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Top Spending Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.ai_insights.top_category ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Category</span>
                          <StatusBadge status="info" label={data.ai_insights.top_category.name} />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-primary">
                            ${data.ai_insights.top_category.value.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your highest spending category this month
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No spending data available.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Uncategorized Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-3xl font-bold text-destructive">
                          ${data.ai_insights.uncategorized_spend.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Needs categorization for better insights
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Categorize Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            </main>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}