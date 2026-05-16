import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
