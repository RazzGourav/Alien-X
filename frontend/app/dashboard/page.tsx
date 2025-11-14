// frontend/app/dashboard/page.tsx
import { ReceiptUploader } from '@/components/ReceiptUploader';
import { UserButton } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { ChatWindow } from '@/components/ChatWindow';
import { FinancialReport } from '@/components/FinancialReport';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your finances with AI.</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Chat (Span 7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <section>
             <ReceiptUploader />
          </section>
          <section>
             <ChatWindow />
          </section>
        </div>

        {/* Right Column: Insights Report (Span 5 cols) */}
        <div className="lg:col-span-5">
           {/* 2. REPLACE AiReport WITH FinancialReport */}
           <FinancialReport />
        </div>
      </main>
    </div>
  );
}