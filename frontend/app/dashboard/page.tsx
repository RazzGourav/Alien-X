// frontend/app/dashboard/page.tsx
import { ReceiptUploader } from '@/components/ReceiptUploader';
import { UserButton } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { ChatWindow } from '@/components/ChatWindow';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Financial Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </header> {/* <-- THIS IS THE CORRECTED LINE */}

      <div className="mb-8">
        <Header />
      </div>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Core Action (Phase 2) */}
        <ReceiptUploader />

        {/* Column 2: Replaced Placeholder with Chat (Phase 3) */}
        <div className="space-y-8">
          
          {/* --- THIS IS THE NEW CHAT WINDOW --- */}
          <ChatWindow />
          
          {/* Placeholder for Insights (Phase 4) */}
          <div className="p-6 border rounded-lg h-64">
            <h2 className="text-3xl font-semibold mb-2">
              Generative Insights
            </h2>
            <p className="text-muted-foreground">
              (Financial summary coming soon...)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}