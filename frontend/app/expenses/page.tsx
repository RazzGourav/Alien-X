// frontend/app/expenses/page.tsx
'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ExpensesPage() {
  // State to hold the form values
  const [salary, setSalary] = useState('');
  const [limit, setLimit] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you'd save this to your Firestore database
    // associated with the current user's ID.
    const numSalary = parseFloat(salary);
    const numLimit = parseFloat(limit);

    if (isNaN(numSalary) || isNaN(numLimit) || numSalary <= 0 || numLimit <= 0) {
      toast.error('Please enter valid, positive numbers.');
      return;
    }

    // Simulate saving the data
    console.log('Saving financial settings:', { salary: numSalary, limit: numLimit });
    toast.success('Financial settings updated!');

    // On a real page, you'd also fetch this data on load
    // and populate the 'salary' and 'limit' states
    // so the user sees their saved values.
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Expenses</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Financial Settings Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Financial Settings</CardTitle>
            <CardDescription>
              Set your monthly salary and target expense limit. This helps the AI
              give you better advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary</Label>
                <div className="flex items-center">
                  <span className="p-2.5 text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                    $
                  </span>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="5000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    min="0"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Monthly Expense Limit</Label>
                <div className="flex items-center">
                  <span className="p-2.5 text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                    $
                  </span>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="2000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    min="0"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save / Update Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Column 2: Placeholder for expense list */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              Your most recent transactions will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              (Expense list will be added in a future step...)
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}