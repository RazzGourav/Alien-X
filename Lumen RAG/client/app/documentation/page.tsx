'use client';

import { useTheme } from '@/context/ThemeContext';
import Header from '@/components/Header';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Documentation() {
  const { isDarkMode } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

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
            Documentation
          </h1>

          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Getting Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Welcome to our financial document analysis platform. This guide will help you understand how to use the various features of our application.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Sign in to your account or create a new one</li>
                <li>Choose between a User Account or Organization Account</li>
                <li>Upload your financial documents</li>
                <li>Generate reports or query your documents</li>
              </ol>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Features
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Document Upload
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload your financial documents in various formats. Our system supports PDF, DOCX, and image files.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Report Generation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate comprehensive reports from your uploaded documents. Reports include visualizations and key insights.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Document Querying
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ask questions about your documents and get instant answers powered by our advanced AI system.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Best Practices
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Keep your documents organized and properly labeled</li>
                <li>Regularly update your documents to ensure accurate analysis</li>
                <li>Use specific queries when searching through documents</li>
                <li>Review generated reports for accuracy and completeness</li>
              </ul>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Need Help?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you need assistance or have questions, please don't hesitate to contact our support team.
              </p>
              <a
                href="/contact"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 