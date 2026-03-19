import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-border bg-background">
        <Link href="/protected" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          Chronos
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-6 py-8">
        {children}
      </div>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 Chronos
      </footer>
    </main>
  );
}
