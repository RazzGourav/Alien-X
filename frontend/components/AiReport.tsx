'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function AiReport() {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      setReport(data.report);
      toast.success("Report Generated!");
    } catch (error) {
      toast.error("Error", { description: "Could not generate financial report." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Agentic Insights
        </CardTitle>
        <CardDescription>
          Ask LUMEN to analyze your monthly spending patterns.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!report ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/20 rounded-md border border-dashed">
            <Button onClick={generateReport} disabled={isLoading} size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Financial Health Report
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex-1 p-4 bg-muted/30 rounded-md border overflow-y-auto max-h-[300px] whitespace-pre-wrap font-medium text-sm">
              {report}
            </div>
            <Button onClick={generateReport} variant="outline" disabled={isLoading}>
               Refresh Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}