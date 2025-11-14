// frontend/app/ai-analysis/page.tsx
import { Header } from "@/components/Header";
import { UserButton } from "@clerk/nextjs";

export default function AiAnalysisPage() {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">AI Analysis</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main>
        <p>AI Analysis page content coming soon...</p>
      </main>
    </div>
  );
}