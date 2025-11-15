'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

export default function ReportView() {
  const { filename } = useParams();
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [reportContent, setReportContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else if (filename) {
        // Fetch report content
        fetch(`/api/reports/${filename}`)
          .then(response => response.text())
          .then(content => {
            setReportContent(content);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error fetching report:', error);
            setIsLoading(false);
          });
      }
    }
  }, [filename, isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={null} />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Report: {filename}
            </h1>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap">{reportContent}</pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 