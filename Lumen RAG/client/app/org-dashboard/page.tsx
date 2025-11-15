'use client';

import { useTheme } from '@/context/ThemeContext';
import Header from '@/components/Header';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrgDashboard() {
  const { isDarkMode } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableFiles, setAvailableFiles] = useState<Array<{ id: string, name: string }>>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Fetch available files
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/user-files');
        if (response.ok) {
          const data = await response.json();
          setAvailableFiles(data.files);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    if (isSignedIn) {
      fetchFiles();
    }
  }, [isSignedIn]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fileId = e.target.value;
    if (fileId) {
      const file = availableFiles.find(f => f.id === fileId);
      if (file) {
        setSelectedFile(new File([], file.name));
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-file-report', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableFiles(prev => [...prev, { id: data.id, name: file.name }]);
          setSelectedFile(file);
          setActiveTab('select');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedFile) return;

    setIsLoading(true);
    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Here you would typically send the message to your backend
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add assistant response to chat history
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `This is a simulated response to your question about ${selectedFile.name}: "${userMessage}"` 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
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
            Organization Dashboard
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
              Chat with Your Documents
            </h2>
            
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('select')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'select'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Select Document
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Upload Document
              </button>
            </div>

            {activeTab === 'select' ? (
              <div className="mb-6">
                <label htmlFor="file-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a Document
                </label>
                <select
                  id="file-select"
                  value={selectedFile?.name || ''}
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a document</option>
                  {availableFiles.map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload a Document
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, or TXT</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </label>
                </div>
                {uploadedFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected file: {uploadedFile.name}
                  </p>
                )}
              </div>
            )}

            <div className="mb-6 h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {activeTab === 'select' 
                    ? 'Select a document and start chatting'
                    : 'Upload a document and start chatting'}
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ml-auto' 
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      } max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question about your document..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={!selectedFile || isLoading}
              />
              <button
                type="submit"
                disabled={!selectedFile || !chatInput.trim() || isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                View Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Access your generated financial reports and insights.
              </p>
              <Link
                href="/view-reports"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                View Reports
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Manage Documents
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View and manage all your uploaded documents.
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Manage Documents
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Get Financial Advice
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get personalized financial advice based on your documents.
              </p>
              <Link
                href="/advice"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Financial Assistant Advice
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Generate Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate data and stock reports from your documents.
              </p>
              <div className="space-y-2">
                <Link
                  href="/generate-reports"
                  className="inline-block w-full bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors text-center"
                >
                  User Report
                </Link>
                <Link
                  href="/generate-reports"
                  className="inline-block w-full bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors text-center"
                >
                  Organization Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 