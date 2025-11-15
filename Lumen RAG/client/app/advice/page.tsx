'use client';

// we are not using this currently

import { useTheme } from '@/context/ThemeContext';
import Header from '@/components/Header';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Advice {
  summary: string;
  recommendations: string[];
  risks: string[];
  nextSteps: string[];
}

export default function AdvicePage() {
  const { isDarkMode } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [availableDocuments, setAvailableDocuments] = useState<Array<{ id: string, name: string }>>([]);
  const [advice, setAdvice] = useState<Advice | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Fetch available documents
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/user-files');
        if (response.ok) {
          const data = await response.json();
          setAvailableDocuments(data.files);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    if (isSignedIn) {
      fetchDocuments();
    }
  }, [isSignedIn]);

  const handleGetAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedDocument) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/get-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          documentId: selectedDocument,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdvice(data);
      }
    } catch (error) {
      console.error('Error getting advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            Get Financial Advice
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md mb-8">
            <form onSubmit={handleGetAdvice} className="space-y-6">
              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Document
                </label>
                <select
                  id="document"
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a document</option>
                  {availableDocuments.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What would you like advice about?
                </label>
                <textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="E.g., How should I optimize my investment portfolio based on my current financial situation?"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedDocument || !query.trim() || isLoading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Getting Advice...' : 'Get Advice'}
              </button>
            </form>
          </div>

          {advice && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Financial Advice
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Summary
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {advice.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Recommendations
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {advice.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Risks to Consider
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {advice.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Next Steps
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {advice.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 