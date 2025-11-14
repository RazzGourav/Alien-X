// frontend/components/ChatAboutDocument.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs'; // <-- 1. IMPORT useAuth

// Define the message structure
interface Message {
  role: 'user' | 'ai';
  content: string;
}

// Define the props, including the receipt data
interface ChatAboutDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: any; // This will be the JSON from the receipt
}

export function ChatAboutDocument({
  isOpen,
  onClose,
  documentData,
}: ChatAboutDocumentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth(); // <-- 2. GET THE getToken FUNCTION

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const token = await getToken(); // <-- 3. GET THE CLERK TOKEN

      // THIS IS A NEW API ROUTE
      const response = await fetch('/api/ask-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <-- 4. ADD THE TOKEN
        },
        body: JSON.stringify({
          question: input,
          document_data: documentData, // We send the receipt data *with* the question
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the agent.');
      }

      const data = await response.json();
      const aiMessage: Message = { role: 'ai', content: data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      toast.error('Error', { description: error.message });
      setInput(userMessage.content);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle closing the dialog
  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setMessages([]); // Clear chat history when closed
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat About This Receipt</DialogTitle>
          <DialogDescription>
            Merchant: {documentData?.merchant_name || 'N/A'} | Total: $
            {documentData?.total_amount || '0.00'}
          </DialogDescription>
        </DialogHeader>

        {/* Chat Message List */}
        <ScrollArea className="flex-1 p-4 mb-4 border rounded-md">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-muted rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this receipt..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}