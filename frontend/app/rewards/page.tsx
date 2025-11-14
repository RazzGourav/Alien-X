// frontend/app/rewards/page.tsx
import { Header } from "@/components/Header";
import { UserButton } from "@clerk/nextjs";

export default function RewardsPage() {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Rewards</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main>
        <p>Rewards page content coming soon...</p>
      </main>
    </div>
  );
}