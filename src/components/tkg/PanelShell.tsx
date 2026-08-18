import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/tkg/store";
import { LogOut, Home } from "lucide-react";

export function PanelShell({
  title,
  subtitle,
  allow,
  children,
}: {
  title: string;
  subtitle?: string;
  allow: "admin" | "vendor" | "rider";
  children: ReactNode;
}) {
  const { session, setSession, ready } = useStore();
  const navigate = useNavigate();
  const authorized = session?.role === allow;

  useEffect(() => {
    if (ready && !authorized) void navigate({ to: "/" });
  }, [ready, authorized, navigate]);

  if (!ready || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-lg font-bold brand-text">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => void navigate({ to: "/" })}>
              <Home className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSession(null);
                void navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 pb-16">{children}</main>
    </div>
  );
}
