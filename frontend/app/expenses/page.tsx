// frontend/app/expenses/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define types for our data
interface Settings {
  salary: number;
  limit: number;
}
interface Expense {
  merchant: string;
  amount: number;
  date: string; // ISO date string
  category: string;
}

export default function ExpensesPage() {
  const [settings, setSettings] = useState<Settings>({ salary: 0, limit: 0 });
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for the form
  const [salaryForm, setSalaryForm] = useState('');
  const [limitForm, setLimitForm] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/expense-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        setSettings(data.settings);
        setAllExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        
        // Populate the form with fetched data
        setSalaryForm(data.settings.salary.toString());
        setLimitForm(data.settings.limit.toString());

      } catch (error) {
        toast.error('Failed to load expense data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle saving settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const numSalary = parseFloat(salaryForm);
    const numLimit = parseFloat(limitForm);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: numSalary, limit: numLimit }),
      });
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setSettings({ salary: numSalary, limit: numLimit });
      toast.success('Settings updated!');

    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- CALCULATIONS & GROUPING ---

  // 1. Calculate this month's spending
  const totalSpentThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allExpenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.date);
      if (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      ) {
        return sum + (expense.amount || 0);
      }
      return sum;
    }, 0);
  }, [allExpenses]);

  // 2. Calculate summary numbers
  const remainingLimit = settings.limit - totalSpentThisMonth;
  const savings = settings.salary - totalSpentThisMonth;

  // 3. Group all expenses by month
  const expensesByMonth = useMemo(() => {
    return allExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [allExpenses]);

  // Get sorted month keys
  const sortedMonthKeys = Object.keys(expensesByMonth).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Expenses</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <main className="space-y-8">
          
          {/* --- SECTION 1: THIS MONTH'S SUMMARY --- */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">This Month's Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Spent</CardTitle>
                  <CardDescription>
                    Your spending for {new Date().toLocaleString('default', { month: 'long' })}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${totalSpentThisMonth.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Limit Remaining</CardTitle>
                  <CardDescription>
                    Based on your ${settings.limit} limit.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${remainingLimit < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ${remainingLimit.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Est. Savings</CardTitle>
                  <CardDescription>
                    Based on your ${settings.salary} salary.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${savings.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* --- SECTION 2: SETTINGS FORM --- */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>
                Set your monthly salary and target expense limit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="5000"
                    value={salaryForm}
                    onChange={(e) => setSalaryForm(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Monthly Expense Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="2000"
                    value={limitForm}
                    onChange={(e) => setLimitForm(e.target.value)}
                    min="0"
                  />
                </div>
                <Button type="submit" disabled={isSaving} className="self-end">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save / Update Settings
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* --- SECTION 3: TRANSACTION HISTORY --- */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
            <div className="space-y-6">
              {sortedMonthKeys.length > 0 ? (
                sortedMonthKeys.map((monthYear) => (
                  <div key={monthYear}>
                    <h3 className="text-lg font-medium mb-2">{monthYear}</h3>
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expensesByMonth[monthYear].map((expense, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{expense.merchant}</TableCell>
                              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                              <TableCell>{expense.category}</TableCell>
                              <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">
                  You have no expenses recorded. Try uploading some receipts!
                </p>
              )}
            </div>
          </section>

        </main>
      )}
    </div>
  );
}