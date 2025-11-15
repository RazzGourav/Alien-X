// frontend/app/expenses/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Settings, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';

interface SettingsData {
  salary: number;
  limit: number;
}

interface Expense {
  merchant: string;
  amount: number;
  date: string;
  category: string;
}

export default function ExpensesPage() {
  const [settings, setSettings] = useState<SettingsData>({ salary: 0, limit: 0 });
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [salaryForm, setSalaryForm] = useState('');
  const [limitForm, setLimitForm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/expense-data');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSettings(data.settings || { salary: 0, limit: 0 });
        setAllExpenses(data.expenses || []);
        setSalaryForm(data.settings?.salary?.toString() || '');
        setLimitForm(data.settings?.limit?.toString() || '');
      } catch (error: any) {
        toast.error('Failed to load expenses', { description: error.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
      if (!response.ok) throw new Error('Failed to save settings');
      setSettings({ salary: numSalary, limit: numLimit });
      toast.success('Settings updated!');
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const currentMonthYear = formatMonthYear(new Date());
  const expensesByMonth = useMemo(() => {
    return allExpenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = formatMonthYear(date);
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [allExpenses]);

  const thisMonthExpenses = expensesByMonth[currentMonthYear] || [];
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingLimit = settings.limit - totalSpentThisMonth;
  const savings = settings.salary - totalSpentThisMonth;
  const spendingPercentage = settings.limit > 0 ? (totalSpentThisMonth / settings.limit) * 100 : 0;
  
  const sortedHistoryKeys = Object.keys(expensesByMonth)
    .filter(monthYear => monthYear !== currentMonthYear)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const TransactionTable = ({ expenses }: { expenses: Expense[] }) => (
    <Card className="card-enhanced">
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
                <TableCell>
                  <StatusBadge status="info" label={expense.category} />
                </TableCell>
                <TableCell className="text-right font-semibold">${expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No transactions for this period.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and manage your spending</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Settings Button */}
            <div className="mb-6 flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="hover:bg-primary/10">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Financial Settings</SheetTitle>
                    <SheetDescription>
                      Set your monthly salary and target expense limit.
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
                          Save Settings
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </form>
                </SheetContent>
              </Sheet>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <main className="space-y-8">
                {/* Summary Stats */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">This Month's Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                      title="Total Spent"
                      value={`$${totalSpentThisMonth.toFixed(2)}`}
                      icon={TrendingDown}
                      trend={{ value: spendingPercentage, direction: spendingPercentage > 50 ? 'up' : 'down' }}
                    />
                    <StatsCard
                      title="Limit Remaining"
                      value={`$${remainingLimit.toFixed(2)}`}
                      icon={AlertCircle}
                      trend={{ value: Math.max(0, remainingLimit), direction: remainingLimit > 0 ? 'up' : 'down' }}
                    />
                    <StatsCard
                      title="Est. Savings"
                      value={`$${savings.toFixed(2)}`}
                      icon={CheckCircle2}
                    />
                    <Card className="card-enhanced">
                      <CardHeader>
                        <CardTitle className="text-sm">Spending %</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">{spendingPercentage.toFixed(0)}%</div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              spendingPercentage > 80 ? 'bg-destructive' : spendingPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Transaction History */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
                  <Tabs defaultValue="this-month">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="this-month">This Month</TabsTrigger>
                      <TabsTrigger value="all-history">All History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="this-month" className="mt-4">
                      <TransactionTable expenses={thisMonthExpenses} />
                    </TabsContent>
                    
                    <TabsContent value="all-history" className="mt-4">
                      {sortedHistoryKeys.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {sortedHistoryKeys.map((monthYear) => (
                            <AccordionItem value={monthYear} key={monthYear}>
                              <AccordionTrigger className="hover:bg-primary/5 px-4 rounded">
                                {monthYear}
                              </AccordionTrigger>
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
        </div>
      </div>
    </div>
  );
}
