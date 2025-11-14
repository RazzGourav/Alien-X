// frontend/components/ChatWindow.tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

// Define the message structure
interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: input };

    // Add user's message to the chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      // Call our Next.js API proxy route
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the agent.');
      }

      const data = await response.json();
      const aiMessage: Message = { role: 'ai', content: data.answer };

      // Add AI's message to the chat
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      toast.error('Error', { description: error.message });
      // Put the user's message back in the input box for retry
      setInput(userMessage.content);
      // Remove the user's message from the chat
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chat with LUMEN-Agent</CardTitle>
        <CardDescription>
          Ask questions about your spending, like "How much did I spend at
          Starbucks?"
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[400px]">
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
            placeholder="Ask about your finances..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}