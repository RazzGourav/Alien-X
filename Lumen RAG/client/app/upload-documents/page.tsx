'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2, Upload, FileText, ArrowLeft } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export default function UploadDocuments() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

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
        // Fetch uploaded files
        fetchUploadedFiles();
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const fetchUploadedFiles = async () => {
    try {
      // This would be replaced with an actual API call to fetch user's uploaded files
      const response = await fetch('/api/user-files');
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsLoading(true);
      setUploadStatus('Uploading...');
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-file-report', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          setUploadedFiles(prev => [...prev, data.filename]);
          setUploadStatus('File uploaded successfully!');
          setSelectedFile(null);
        } else {
          setUploadStatus('Upload failed. Please try again.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus('Upload failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
            Upload Documents
          </h1>

          {/* File Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Upload New Document
            </h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-fit">
                <Upload className="h-5 w-5" />
                <span>Choose File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                />
              </label>
              {selectedFile && (
                <span className="text-gray-600 dark:text-gray-400">
                  Selected: {selectedFile.name}
                </span>
              )}
              {uploadStatus && (
                <p className={`text-sm ${uploadStatus.includes('successfully') ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {uploadStatus}
                </p>
              )}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Files List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Your Uploaded Documents
            </h2>
            <div className="space-y-4">
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{file}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/query-documents?file=${file}`)}
                        className="px-3 py-1 text-blue-600 hover:text-blue-700"
                      >
                        Query
                      </button>
                      <button
                        onClick={() => router.push(`/reports/${file}`)}
                        className="px-3 py-1 text-green-600 hover:text-green-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No documents uploaded yet. Upload a document to get started.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 