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
import { Loader2, Settings } from 'lucide-react'; // <-- Import Settings icon
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"; // <-- Import Sheet
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // <-- Import Tabs
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // <-- Import Accordion

// Define types for our data
interface SettingsData {
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
  const [settings, setSettings] = useState<SettingsData>({ salary: 0, limit: 0 });
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for the form
  const [salaryForm, setSalaryForm] = useState('');
  const [limitForm, setLimitForm] = useState('');

  // ... (Keep your existing useEffect to fetch data) ...
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

  // ... (Keep your existing handleSubmit for settings) ...
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

  // --- RE-ORGANIZE CALCULATIONS ---

  // 1. Helper to format a date
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  // 2. Get current month string
  const currentMonthYear = formatMonthYear(new Date());

  // 3. Group ALL expenses by month (for all tabs)
  const expensesByMonth = useMemo(() => {
    return allExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = formatMonthYear(date);
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [allExpenses]);

  // 4. Get expenses for just this month (for summary)
  const thisMonthExpenses = expensesByMonth[currentMonthYear] || [];
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingLimit = settings.limit - totalSpentThisMonth;
  const savings = settings.salary - totalSpentThisMonth;
  
  // 5. Get sorted keys for "All History" (excluding this month)
  const sortedHistoryKeys = Object.keys(expensesByMonth)
    .filter(monthYear => monthYear !== currentMonthYear)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Helper component for the transaction table
  const TransactionTable = ({ expenses }: { expenses: Expense[] }) => (
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
          {expenses.length > 0 ? (
            expenses.map((expense, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{expense.merchant}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No transactions for this month.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* --- NEW HEADER --- */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Review your spending and manage settings.</p>
        </div>
        
        {/* --- SETTINGS SHEET TRIGGER --- */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Financial Settings</SheetTitle>
              <SheetDescription>
                Set your monthly salary and target expense limit. This helps the AI
                give you better advice.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save / Update Settings
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </header>
      {/* --- END OF NEW HEADER --- */}

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
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${savings.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* --- SECTION 2: TRANSACTION HISTORY TABS --- */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
            <Tabs defaultValue="this-month">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="this-month">This Month</TabsTrigger>
                <TabsTrigger value="all-history">All History</TabsTrigger>
              </TabsList>
              
              {/* --- THIS MONTH'S TRANSACTIONS --- */}
              <TabsContent value="this-month" className="mt-4">
                <TransactionTable expenses={thisMonthExpenses} />
              </TabsContent>
              
              {/* --- ALL HISTORY ACCORDION --- */}
              <TabsContent value="all-history" className="mt-4">
                {sortedHistoryKeys.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {sortedHistoryKeys.map((monthYear) => (
                      <AccordionItem value={monthYear} key={monthYear}>
                        <AccordionTrigger>{monthYear}</AccordionTrigger>
                        <AccordionContent>
                          <TransactionTable expenses={expensesByMonth[monthYear]} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No other history found.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </section>

        </main>
      )}
    </div>
  );
}