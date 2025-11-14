// frontend/app/dashboard/page.tsx
import { UserButton } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { ReceiptUploader } from '@/components/ReceiptUploader';
import { ChatWindow } from '@/components/ChatWindow';
import { FinancialReport } from '@/components/FinancialReport';

// Import the new Tabs components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    // Use max-w-7xl and mx-auto for a centered, responsive max-width
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your finances with AI.
          </p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Navigation Header */}
      <div className="mb-8">
        <Header />
      </div>

      {/* Main Content Grid (8-col Action Area + 4-col Insight Sidebar) */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === ACTION AREA (Left Column) === */}
        <div className="lg:col-span-8">
          {/* Use Tabs to switch between Chat and Upload */}
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat with LUMEN-Agent</TabsTrigger>
              <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
            </TabsList>
            
            {/* --- CHAT TAB --- */}
            <TabsContent value="chat" className="mt-4">
              {/* The ChatWindow component is already a Card, so it fits perfectly */}
              <ChatWindow />
            </TabsContent>
            
            {/* --- UPLOAD TAB --- */}
            <TabsContent value="upload" className="mt-4">
              {/* The ReceiptUploader is also a Card and fits perfectly */}
              <ReceiptUploader />
            </TabsContent>
          </Tabs>
        </div>

        {/* === INSIGHT SIDEBAR (Right Column) === */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            {/* The FinancialReport is the perfect component for a sidebar */}
            <FinancialReport />
          </section>
          
          {/* You could add more insight widgets here later */}
          {/*
          <Card>
            <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
            <CardContent><p>Another insight...</p></CardContent>
          </Card>
          */}
        </div>
      </main>
    </div>
  );
}