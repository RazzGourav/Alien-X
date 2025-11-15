'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2, FileText, BarChart2, ArrowLeft } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

// Define proper type for reports
interface Report {
  filename: string;
  reportType: 'stock' | 'user';
  chartFiles?: Record<string, string>;
}

export default function GenerateReports() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  // Fix: Update reports state to use Report interface
  const [reports, setReports] = useState<Report[]>([]);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  
  // Form states
  const [stockSymbol, setStockSymbol] = useState<string>('');
  const [showStockForm, setShowStockForm] = useState(false);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [showFileForm, setShowFileForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Fetch reports
        fetchReports();
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/view-reports?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fix: Transform the raw reports data into properly structured Report objects
        if (Array.isArray(data.reports)) {
          if (data.reports.length > 0 && typeof data.reports[0] === 'object' && data.reports[0].chartFiles) {
            // If backend returns complete objects with chartFiles
            console.log("Setting reports with chart files:", data.reports);
            setReports(data.reports);
          } else {
            // If backend returns just filenames
            setReports(data.reports.map((report: string) => {
              const isStockReport = report.includes('organization') || report.includes('stock');
              return {
                filename: report,
                reportType: isStockReport ? 'stock' : 'user',
                chartFiles: {}
              };
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleGenerateStockReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockSymbol) return;
    
    setIsLoading(true);
    setGenerationStatus(`Generating report for ${stockSymbol.toUpperCase()}...`);
    
    try {
      const response = await fetch('/api/generate-organization-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stockSymbol }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.filename) {
          // Fix: Add a properly structured report object
          const newReport = {
            filename: data.filename,
            reportType: 'stock' as const,
            chartFiles: data.charts || {}
          };
          
          setReports(prev => [newReport, ...prev]);
          setGenerationStatus(`Stock report for ${stockSymbol} generated successfully!`);
          setShowStockForm(false);
          setStockSymbol('');
        } else {
          setGenerationStatus(`Error: ${data.error || 'Failed to generate report'}`);
        }
      } else {
        setGenerationStatus(`Failed to generate stock report. Please try again.`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setGenerationStatus(`Failed to generate stock report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateUserReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataFile) return;
    
    setIsLoading(true);
    setGenerationStatus(`Generating report from ${dataFile.name}...`);
    
    try {
      const formData = new FormData();
      formData.append('file', dataFile);
      
      const response = await fetch('/api/generate-user-report', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.filename) {
          // Fix: Add a properly structured report object
          const newReport = {
            filename: data.filename,
            reportType: 'user' as const,
            chartFiles: data.charts || {}
          };
          
          console.log("Adding report with charts:", newReport);
          setReports(prev => [newReport, ...prev]);
          setGenerationStatus(`User report generated successfully!`);
          setShowFileForm(false);
          setDataFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          setGenerationStatus(`Error: ${data.error || 'Failed to generate report'}`);
        }
      } else {
        setGenerationStatus(`Failed to generate user report. Please try again.`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setGenerationStatus(`Failed to generate user report. Please try again.`);
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
            Generate Reports
          </h1>

          {/* Report Generation Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Generate New Report
            </h2>
            
            {/* Report Type Selection */}
            {!showStockForm && !showFileForm && !isLoading && (
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFileForm(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={isLoading}
                >
                  <FileText className="h-5 w-5" />
                  <span>User Financial Report</span>
                </button>
                <button
                  onClick={() => setShowStockForm(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={isLoading}
                >
                  <BarChart2 className="h-5 w-5" />
                  <span>Organization Stock Report</span>
                </button>
              </div>
            )}
            
            {/* Stock Report Form */}
            {showStockForm && (
              <form onSubmit={handleGenerateStockReport} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!stockSymbol.trim() || isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStockForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            {/* User Report Form */}
            {showFileForm && (
              <form onSubmit={handleGenerateUserReport} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Upload Financial Data
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => e.target.files && setDataFile(e.target.files[0])}
                    accept=".csv,.xlsx,.xls,.json"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: CSV, Excel, JSON with financial data
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!dataFile || isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFileForm(false);
                      setDataFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            {/* Status Messages */}
            {generationStatus && (
              <p className={`mt-4 text-sm ${generationStatus.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {generationStatus}
              </p>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 mt-4">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Processing...</span>
              </div>
            )}
          </div>

          {/* Reports List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Your Reports
            </h2>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className={`h-5 w-5 ${report.reportType === 'stock' ? 'text-purple-600' : 'text-green-600'}`} />
                      <span className="text-gray-600 dark:text-gray-400">{report.filename}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/api/reports/${report.filename}`, '_blank')}
                        className="px-3 py-1 text-blue-600 hover:text-blue-700"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => {
                          console.log("Full report:", report); // Debug full report object
                          
                          let chartFile;
                          if (report.chartFiles && Object.keys(report.chartFiles).length > 0) {
                            // First try the exact keys from the backend
                            if (report.reportType === 'stock' && report.chartFiles['price_chart']) {
                              chartFile = report.chartFiles['price_chart'];
                            } 
                            else if (report.reportType === 'user' && report.chartFiles['revenue_chart']) {
                              chartFile = report.chartFiles['revenue_chart'];
                            }
                            // Fall back to the Python-generated keys
                            else if (report.reportType === 'stock' && report.chartFiles['stock_price_trend']) {
                              chartFile = report.chartFiles['stock_price_trend'];
                            }
                            else if (report.reportType === 'user' && report.chartFiles['revenue_expenses']) {
                              chartFile = report.chartFiles['revenue_expenses'];
                            }
                            // Last resort: use any available chart
                            else {
                              chartFile = Object.values(report.chartFiles)[0];
                            }
                            
                            console.log(`Using chart file:`, chartFile);
                          } else {
                            // Only fall back to default as a last resort
                            chartFile = report.reportType === 'stock' ? 'stock_price_trend.png' : 'revenue_expenses_chart.png';
                            console.error("WARNING: Using default chart file, may not be accurate:", chartFile);
                          }
                          
                          // Add debugging to verify the URL being opened
                          const chartUrl = `/api/reports/charts/${chartFile}`;
                          console.log("Opening chart URL:", chartUrl);
                          window.open(chartUrl, '_blank');
                        }}
                        className="px-3 py-1 text-green-600 hover:text-green-700"
                      >
                        Charts
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No reports generated yet. Generate a report to get started.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}