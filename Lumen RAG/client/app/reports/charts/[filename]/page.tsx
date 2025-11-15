'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function ReportCharts() {
  const { filename } = useParams();
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [chartUrl, setChartUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else if (filename) {
        // Create a URL for the chart image instead of parsing JSON
        setChartUrl(`/api/reports/charts/${filename}`);
        setIsLoading(false);
      }
    }
  }, [filename, isLoaded, isSignedIn, router]);
  
  const handleBack = () => {
    router.back();
  };

  if (!isLoaded || isLoading) {
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
          <div className="flex items-center mb-8">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Chart: {Array.isArray(filename) ? filename[0] : filename}
            </h1>
            
            <div className="mt-6">
              {error ? (
                <div className="p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              ) : chartUrl ? (
                <div className="flex justify-center">
                  {/* Use img tag for direct display of the image */}
                  <img 
                    src={chartUrl} 
                    alt="Report Chart" 
                    className="max-w-full h-auto rounded-lg shadow-md"
                    onError={() => setError("Failed to load chart image")}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}