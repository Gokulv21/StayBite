import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  Navigate,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/app-shell";
import { useSession } from "@/stores/session-store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          Error 404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mt-2">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn't exist in the platform.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

import { useDataStore } from "@/stores/data-store";
import { useEffect } from "react";

function RootComponent() {
  const user = useSession((s) => s.user);
  const location = useRouterState({ select: (s) => s.location });
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";
  const settings = useDataStore((s) => s.settings);

  useEffect(() => {
    const themeMode = settings?.themeMode || "dark";
    const themePalette = settings?.themePalette || "indigo";
    const root = document.documentElement;

    // Toggle dark mode class
    root.classList.toggle("dark", themeMode === "dark");

    // Clean and apply palette class
    const palettes = ["theme-gold", "theme-emerald", "theme-indigo", "theme-sunset", "theme-rose"];
    palettes.forEach((p) => root.classList.remove(p));
    root.classList.add(`theme-${themePalette}`);
  }, [settings?.themeMode, settings?.themePalette]);

  if (!user && !isAuthRoute) {
    return <Navigate to="/login" replace />;
  }

  if (user && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {isAuthRoute ? <Outlet /> : <AppShell />}
      <Toaster position="top-right" />
    </>
  );
}
