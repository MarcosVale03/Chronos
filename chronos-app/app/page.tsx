import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-border bg-background">
        <span className="text-xl font-bold tracking-tight">Chronos</span>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white">
        <h1 className="text-5xl font-bold mb-4 tracking-tight leading-tight">
          Plan events.<br />Stay organized.<br />Never miss a moment.
        </h1>
        <p className="text-lg text-white/80 mb-10 max-w-md">
          Chronos helps you create, manage, and share events — all in one place.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-white/90 font-semibold">
            <Link href="/auth/sign-up">Get started free</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/10 hover:text-white">
            <Link href="/auth/login">Log in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Everything you need to run great events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar size={24} />}
              title="Create Events"
              description="Set up events with dates, locations, and descriptions in seconds."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Invite Guests"
              description="Send invites and manage your guest list with ease."
            />
            <FeatureCard
              icon={<Bell size={24} />}
              title="Track RSVPs"
              description="See who's coming, who's not, and send reminders automatically."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 Chronos
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 p-6 rounded-xl border bg-card shadow-sm">
      <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
