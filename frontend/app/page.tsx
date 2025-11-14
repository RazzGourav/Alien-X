// frontend/app/page.tsx
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome to LUMEN-Agent</h1>
      <p className="text-xl text-muted-foreground mb-6">
        Your Proactive Financial Coach [cite: 29]
      </p>
      <SignedOut>
        <div className="space-x-4">
          <Button asChild>
            <SignInButton mode="modal" />
          </Button>
          <Button variant="secondary" asChild>
            <SignUpButton mode="modal" />
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <Button asChild>
          <Link href="/dashboard">Go to Your Dashboard</Link>
        </Button>
      </SignedIn>
    </div>
  );
}