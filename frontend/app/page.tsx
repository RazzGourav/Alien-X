// frontend/app/page.tsx

import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  BrainCircuit,
  Zap,
  Shield,
  FileText,
  BadgePercent,
  AlertTriangle,
} from 'lucide-react';
import { ScrollAnimate } from '@/components/ScrollAnimate';
export default function HomePage() {
  return (
    // Use the dark mode and "tech blue" background you set up
    <div className="dark w-full overflow-x-hidden">
      
      {/* --- 1. Navigation --- */}
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        {/* Your Logo (like "slice" in the top left) */}
        <h1 className="text-3xl font-bold text-white">LUMEN</h1>
        
        {/* Login/Signup Buttons (like "Credit card" in top right) */}
        <div className="space-x-4">
          <SignedOut>
            <Button variant="ghost" asChild>
              <SignInButton mode="modal" />
            </Button>
            <Button className="bg-white text-blue-900 hover:bg-white/90" asChild>
              <SignUpButton mode="modal" />
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </nav>

      {/* --- 2. Hero Section --- */}
      {/* Inspired by "SLICE THE WAY YOU BANK" */}
      <section className="relative py-32 md:py-48 max-w-7xl mx-auto text-center">
        {/* Background Gradient (like the blue sky in the Slice ads) */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900/50 via-background to-background blur-2xl opacity-70"></div>

        <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter">
          YOUR FINANCES,
        </h1>
        <h1 className="text-5xl md:text-8xl font-black text-primary-foreground/70 uppercase tracking-tighter">
          FINALLY FIGURED OUT.
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mt-8 max-w-2xl mx-auto">
          {/* Inspired by "THE FINE-PRINT ENDS TODAY" */}
          Stop guessing. Start knowing. LUMEN-Agent is your personal AI financial coach
          that does the work for you.
        </p>
        <div className="mt-10">
          <SignedOut>
            <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90" asChild>
              <SignUpButton mode="modal">Get Started Now</SignUpButton>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Your Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </section>

      {/* --- 3. Problem Section --- */}
      {/* Inspired by "SAY NO TO INTEREST EARNED WITH ASTERISKS" */}
      <ScrollAnimate>
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-black text-primary uppercase">
            SAY NO TO THE
          </h2>
          <h2 className="text-4xl md:text-6xl font-black text-primary uppercase">
            FINANCIAL BLIND SPOT.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-background/50 border-destructive/50">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <CardTitle>Scattered Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  Forget digging through shoeboxes. We turn your paper and PDFs
                  into pure, queryable data.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-destructive/50">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <CardTitle>Hidden Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  {/* Inspired by "confusing fees" */}
                  Your "Fee Hunter" AI reads the fine print on your statements so
                  you don't have to.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-destructive/50">
              <CardHeader>
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <CardTitle>Manual Spreadsheets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground">
                  Stop wasting hours on data entry. Your AI agent does it for
                  you, instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </ScrollAnimate>

      {/* --- 4. Solution Section --- */}
      {/* Inspired by "SAY YES TO INTEREST EARNED AT 100%..." */}
      <ScrollAnimate delay={0.2}>
      <section className="py-24">
        <div className="max-w-7xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-black text-primary-foreground/70 uppercase">
            SAY YES TO A
          </h2>
          <h2 className="text-4xl md:text-6xl font-black text-primary uppercase">
            PROACTIVE AI COACH.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Instant Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload any receipt or statement and get an instant AI analysis
                  on the spot.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BrainCircuit className="h-8 w-8 text-primary" />
                <CardTitle>Conversational AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ask questions like, "How much did I spend on groceries last
                  month?" and get instant answers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle>Automated Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our "Fee Hunter" AI scans your investment statements for hidden
                  fees and high commissions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BadgePercent className="h-8 w-8 text-primary" />
                <CardTitle>Gamified Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Earn points and badges like "Budget Sniper" for saving money
                  and uploading receipts fast.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
</ScrollAnimate>
      {/* --- 5. Security Section --- */}
      {/* Inspired by "SECURITY AND EASE CAN COEXIST" */}
      <ScrollAnimate delay={0.4}>
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-primary uppercase">
              SECURITY AND EASE
            </h2>
            <h2 className="text-4xl md:text-6xl font-black text-card-foreground uppercase">
              CAN COEXIST.
            </h2>
            <p className="text-lg text-card-foreground mt-6">
              We're built on Google Cloud's secure infrastructure. Your data is
              yours alone—analyzed by AI, but never shared or sold.
            </p>
          </div>
          <div className="flex justify-center">
            <Shield className="h-48 w-48 text-primary" />
          </div>
        </div>
      </section>
      </ScrollAnimate>
      
      {/* --- 6. Final Footer/CTA --- */}
      <footer className="py-24 text-center">
        <h2 className="text-3xl font-bold">Ready to Take Control?</h2>
        <p className="text-muted-foreground mt-4">
          Sign up for free and get your first AI financial report in minutes.
        </p>
        <div className="mt-8">
          <SignedOut>
            <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90" asChild>
              <SignUpButton mode="modal">Get Started Free</SignUpButton>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Your Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </footer>
    </div>
  );
}