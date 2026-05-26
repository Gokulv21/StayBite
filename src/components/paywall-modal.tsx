import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaywallModal({ open, onOpenChange }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-none shadow-2xl overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background pt-10 pb-8 px-6 relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
          
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold tracking-tight text-center">
              Premium Feature
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-2 text-muted-foreground">
              This action requires a premium account. To unlock full access to the StayBite ERP, please upgrade your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-8">
            <Button className="w-full h-11 text-base font-medium shadow-md" onClick={() => onOpenChange(false)}>
              Contact Admin to Upgrade
            </Button>
            <Button variant="ghost" className="w-full h-11" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
