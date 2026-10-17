import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { CommandPalette } from "../command-palette";
import { useState } from "react";

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen app-glass-bg flex flex-col">
      <Topbar onSearchClick={() => setCommandOpen(true)} />
      
      {/* Desktop/Tablet Floating Dock Navigation */}
      <AppSidebar />

      {/* Main Content Stage */}
      <main className="flex-1 pt-18 pb-22 md:pt-24 md:pb-28 px-2 sm:px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="glass-stage min-h-[calc(100vh-10rem)] p-3 sm:p-5 md:p-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomBar />

      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </div>
  );
}
