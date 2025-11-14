// frontend/components/FinancialReport.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown'; 
import { useAuth } from '@clerk/nextjs'; 

export function FinancialReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { getToken } = useAuth(); 

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport(null); // Clear old report

    try {
      const token = await getToken(); 

      // 2. Call our new Next.js API route
      const response = await fetch('/api/get-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReport(data.report); // 3. Set the report text
      
    } catch (error: any) {
      toast.error('Error', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generative Insights</CardTitle>
        <CardDescription>
          Let your "Proactive Financial Coach" analyze your spending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Generate Financial Health Report
        </Button>

        {/* 4. Display the report when it exists */}
        {report && (
          // 1. MOVE THE `prose` CLASSES TO THIS DIV
          // We also add `max-w-none` to override prose's default width
          <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-muted">
            
            {/* 2. REMOVE THE className PROP FROM ReactMarkdown */}
            <ReactMarkdown>
              {report}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}