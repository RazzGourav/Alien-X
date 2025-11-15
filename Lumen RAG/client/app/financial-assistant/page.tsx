'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2, ArrowLeft, Send, FileText } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

interface QueryResponse {
  answer: string;
  sources: string[];
}

export default function QueryDocuments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [query, setQuery] = useState<string>('');
  const [responses, setResponses] = useState<QueryResponse[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else if (userId) {
        // Fetch user data
        setUser({
          name: 'User',
          email: 'user@example.com',
        });
        // Fetch available files
        fetchAvailableFiles();
        
        // Check if a file is specified in the URL
        const fileParam = searchParams.get('file');
        if (fileParam) {
          setSelectedFile(fileParam);
        }
      }
    }
  }, [isLoaded, isSignedIn, userId, router, searchParams]);

  const fetchAvailableFiles = async () => {
    try {
      const response = await fetch(`/api/user-files`);
      if (response.ok) {
        const data = await response.json();
        setAvailableFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || !selectedFile) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/get-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          user_id: userId, 
          document_path: selectedFile
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convert server response format to client format
        const formattedResponse = {
          answer: data.response || "No response received",
          sources: data.sources || []
        };
        setResponses(prev => [formattedResponse, ...prev]);
        setQuery('');
      } else {
        console.error('Query failed');
      }
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
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
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            Financial Assistant
          </h1>

          {/* File Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Select Document
            </h2>
            <div className="flex flex-col gap-4">
              <select
                value={selectedFile || ''}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="">Select a document</option>
                {availableFiles.map((file) => (
                  <option key={file.id} value={file.id}>{file.name}</option>
                ))}
              </select>
              {selectedFile && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FileText className="h-5 w-5" />
                  <span>Selected: {selectedFile}</span>
                </div>
              )}
            </div>
          </div>

          {/* Query Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Ask a Question
            </h2>
            <form onSubmit={handleSubmitQuery} className="flex flex-col gap-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your question about the document..."
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 min-h-[100px]"
                disabled={!selectedFile}
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!query.trim() || !selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Ask</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Query Responses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Responses
            </h2>
            <div className="space-y-6">
              {responses.length > 0 ? (
                responses.map((response, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Answer:</h3>
                      <p className="text-gray-600 dark:text-gray-400">{response.answer}</p>
                    </div>
                    {response.sources && response.sources.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Sources:</h3>
                        <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                          {response.sources.map((source, idx) => (
                            <li key={idx}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No queries yet. Ask a question about your document to get started.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}