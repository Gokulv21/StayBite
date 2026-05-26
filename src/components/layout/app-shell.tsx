import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "../command-palette";
import { useState } from "react";

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen app-glass-bg">
      <Topbar onSearchClick={() => setCommandOpen(true)} />
      <AppSidebar />
      <main className="pb-28 pt-28 px-3 md:px-5">
        <div className="glass-stage min-h-[calc(100vh-12rem)]">
          <Outlet />
        </div>
      </main>
      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </div>
  );
}
