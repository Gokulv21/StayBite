import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const TEMPLATES = {
  welcome: "🏡 Welcome to our Residency! We are absolutely thrilled to host you. Please let us know if you need anything to make your stay perfect.",
  menu: "🥘 Hungry? Check out our special Cuisine Menu for today! We have some amazing specials waiting for you at the restaurant.",
  bill: "🧾 Thank you for staying with us! Your final bill receipt is attached/ready at the front desk. Have a safe journey home!",
  custom: "",
};

export function MessagingModal({ open, onOpenChange, customer }: MessagingModalProps) {
  const [method, setMethod] = useState<"whatsapp" | "email">("whatsapp");
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>("welcome");
  const [message, setMessage] = useState(TEMPLATES["welcome"]);

  if (!customer) return null;

  const handleTemplateChange = (t: keyof typeof TEMPLATES) => {
    setTemplate(t);
    setMessage(TEMPLATES[t]);
  };

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    if (method === "whatsapp") {
      // Format number: remove non-digits, ensure country code (assuming +91 for demo)
      const cleanPhone = customer.phone.replace(/\D/g, "");
      const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      toast.success("Opening WhatsApp Web...");
    } else {
      const subject = "A message from StayBite";
      const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
      toast.success("Opening Default Email Client...");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Message {customer.name}
          </DialogTitle>
          <DialogDescription>
            Send beautiful updates, menus, or bills directly to your guest.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              variant={method === "whatsapp" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => setMethod("whatsapp")}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
            <Button
              variant={method === "email" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => setMethod("email")}
            >
              <Mail className="w-4 h-4" /> Email
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Templates</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={template === "welcome" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleTemplateChange("welcome")}
              >
                Welcome 🏡
              </Button>
              <Button
                variant={template === "menu" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleTemplateChange("menu")}
              >
                Cuisine Menu 🥘
              </Button>
              <Button
                variant={template === "bill" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleTemplateChange("bill")}
              >
                Bill Receipt 🧾
              </Button>
              <Button
                variant={template === "custom" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleTemplateChange("custom")}
              >
                Custom...
              </Button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="message">Message Body</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setTemplate("custom");
              }}
              className="h-32 resize-none"
              placeholder="Type your message here..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} className="gap-2">
            <Send className="w-4 h-4" /> Send via {method === "whatsapp" ? "WhatsApp" : "Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
