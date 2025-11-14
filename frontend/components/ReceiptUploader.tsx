// frontend/components/ReceiptUploader.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from "sonner"; // <-- CHANGED: Import toast from sonner
import { Upload, Loader2 } from 'lucide-react';

export function ReceiptUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();
  // const { toast } = useToast(); // <-- REMOVED: No longer need useToast hook

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) {
      // CHANGED: How toasts are called
      toast.error("Error", {
        description: "Please select a file and ensure you are signed in.",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    const API_URL = `http://127.0.0.1:8000/upload-receipt/?user_id=${userId}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'An unknown error occurred');
      }

      // CHANGED: How success toasts are called
      toast.success("Upload Successful!", {
        description: `Receipt for ${result.data?.merchant_name} processed.`,
      });
      setFile(null); 
      
    } catch (error: any) {
      // CHANGED: How error toasts are called
      toast.error("Upload Failed", {
        description: error.message || "Failed to connect to the API.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Upload Receipt</CardTitle>
        <CardDescription>
          Upload a receipt image (JPEG, PNG) or PDF to be processed.
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
  );
}