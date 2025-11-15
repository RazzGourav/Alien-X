// frontend/app/ai-analysis/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { UserButton } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, AlertTriangle, FileCheck2 } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">AI Analysis</h1>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="mb-8">
          <Header />
        </div>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="ml-4 text-lg">Your AI coach is analyzing your data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">AI Analysis</h1>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="mb-8">
          <Header />
        </div>
        <p>Could not load analysis data. Please try again later.</p>
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
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis</h1>
        <p className="text-muted-foreground">
          Let your AI coach find insights in your data.
        </p>
      </header>
      <UserButton afterSignOutUrl="/" /> 
      
      <div className="mb-8">
        <Header />
      </div>

      {/* --- NEW TAB-BASED LAYOUT --- */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts">Expenditure Charts</TabsTrigger>
          <TabsTrigger value="audits">AI Audits & Insights</TabsTrigger>
        </TabsList>
        
        {/* === TAB 1: ALL THE CHARTS === */}
        <TabsContent value="charts" className="mt-6">
          <main className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Financial Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CategoryPieChart data={data.spending_by_category} />
                <SummaryBarChart data={summaryChartData} />
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Spending Over Time</h2>
              <SpendingLineChart data={data.spending_over_time} />
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Top Spending Category
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {data.ai_insights.top_category ? (
                      <>
                        <div className="text-2xl font-bold">
                          {data.ai_insights.top_category.name}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You spent $
                          {data.ai_insights.top_category.value.toFixed(2)} in
                          this category.
                        </p>
                      </>
                    ) : (
                      <p>No spending data available.</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Actionable Nudge
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${data.ai_insights.uncategorized_spend.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ...spent on 'Uncategorized' items. Go to the Expenses
                      page to categorize them!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
            
          </main>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}