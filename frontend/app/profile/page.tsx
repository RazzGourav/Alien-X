// frontend/app/profile/page.tsx
import { Header } from "@/components/Header";
import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Profile</h1>
      </header>

      <div className="mb-8">
        <Header />
      </div>

      <main className="flex justify-center">
        {/* Clerk's component handles all profile logic */}
        <UserProfile routing="hash" />
      </main>
    </div>
  );
}
