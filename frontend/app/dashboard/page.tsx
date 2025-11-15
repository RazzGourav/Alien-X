// frontend/app/dashboard/page.tsx
import { UserButton } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
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
    <div className="flex h-screen">
      {/* Sidebar - Hidden on mobile, visible on lg+ */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your finances with AI.
              </p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Navigation Header - Mobile only */}
            <div className="mb-6 lg:hidden">
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
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}