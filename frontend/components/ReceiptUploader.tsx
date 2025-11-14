// frontend/components/ReceiptUploader.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner"; 
import { Upload, Loader2 } from 'lucide-react';
import { ChatAboutDocument } from './ChatAboutDocument';

export function ReceiptUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentDocData, setCurrentDocData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) {
      toast.error("Error", { description: "Please sign in and select a file." });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    // FIX: Send user_id as form data, matching backend `user_id: str = Form(...)`
    formData.append('user_id', userId); 

    const API_URL = `http://127.0.0.1:8000/upload-receipt/`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        // Note: Do NOT set Content-Type header for FormData, browser does it automatically
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'An unknown error occurred');
      }

      toast.success("Upload Successful!", {
        description: `Receipt for ${result.data?.merchant_name} processed.`,
      });
      
      // --- NEW FLOW ---
      setCurrentDocData(result.data); // Save the receipt data
      setIsChatOpen(true); 
      
    } catch (error: any) {
      toast.error("Upload Failed", {
        description: error.message || "Failed to connect to the API.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // We add the ChatAboutDocument component here.
    // It is invisible until `isChatOpen` is true.
    <>
      <ChatAboutDocument
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false); // Close the modal
          setCurrentDocData(null); // Clear the data
          
          // Manually clear the file input element
          const fileInput = document.getElementById('receipt-file') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          setFile(null); // Clear the file from state
        }}
        documentData={currentDocData}
      />

      {/* This is your existing Card component */}
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>
            Upload a receipt image or PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="receipt-file">Receipt</Label>
              <Input
                id="receipt-file"
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
              />
            </div>
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Process Receipt
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}