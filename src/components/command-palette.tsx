import * as React from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { 
  BedDouble, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Search, 
  Package, 
  Settings, 
  Utensils 
} from "lucide-react";

export function CommandPalette({ open, setOpen }: { open: boolean, setOpen: (o: boolean) => void }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-[600px] border-none bg-background rounded-xl">
        <Command className="flex h-full w-full flex-col overflow-hidden bg-transparent [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 h-[400px]">
          <div className="flex items-center border-b px-4 border-border/50">
            <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <Command.Input 
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none font-medium text-foreground" 
              placeholder="Type a command or search operations..." 
            />
          </div>
          <Command.List className="max-h-[340px] overflow-y-auto overflow-x-hidden p-2 text-foreground">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">No operations found.</Command.Empty>
            
            <Command.Group heading="Front Desk & Operations">
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50" onSelect={() => runCommand(() => navigate({ to: "/" }))}>
                <LayoutDashboard className="mr-3 h-4 w-4" />
                <span className="font-medium">Dashboard Overview</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors" onSelect={() => runCommand(() => navigate({ to: "/rooms" }))}>
                <BedDouble className="mr-3 h-4 w-4" />
                <span className="font-medium">Rooms & Bookings</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors" onSelect={() => runCommand(() => navigate({ to: "/customers" }))}>
                <Users className="mr-3 h-4 w-4" />
                <span className="font-medium">Guest Profiles (CRM)</span>
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="Food & Beverage">
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors" onSelect={() => runCommand(() => navigate({ to: "/pos" }))}>
                <ShoppingCart className="mr-3 h-4 w-4" />
                <span className="font-medium">Restaurant POS Terminal</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors" onSelect={() => runCommand(() => navigate({ to: "/kds" }))}>
                <Utensils className="mr-3 h-4 w-4" />
                <span className="font-medium">Kitchen Display System (KDS)</span>
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="System Administration">
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors" onSelect={() => runCommand(() => navigate({ to: "/inventory" }))}>
                <Package className="mr-3 h-4 w-4" />
                <span className="font-medium">Inventory & Procurement</span>
              </Command.Item>
              <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-3 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors" onSelect={() => runCommand(() => navigate({ to: "/settings" }))}>
                <Settings className="mr-3 h-4 w-4" />
                <span className="font-medium">System Settings</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
