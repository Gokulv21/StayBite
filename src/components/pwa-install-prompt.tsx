import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Hotel, Smartphone, Sparkles } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    // Capture beforeinstallprompt for Android/Windows/Mac/Linux
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds before displaying smooth slide-in prompt
      setTimeout(() => {
        if (!dismissed) setShowPrompt(true);
      }, 2500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl space-y-3 relative text-foreground">
        <button
          onClick={() => {
            setShowPrompt(false);
            setDismissed(true);
          }}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground cursor-pointer p-1"
          aria-label="Close install prompt"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3">
          <img 
            src="/icons/staybite-light-192.png" 
            alt="StayBite Logo" 
            className="size-12 rounded-xl object-cover shadow-lg border border-amber-500/30 shrink-0"
          />
          <div className="pr-5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold leading-tight">Install StayBite</h4>
              <span className="text-[10px] font-bold bg-amber-500/15 text-amber-500 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Sparkles className="size-2.5" /> by Zevox
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Install native app for instant launch, offline PMS, POS & KDS.
            </p>
          </div>
        </div>

        {isIos ? (
          <div className="p-2.5 rounded-xl bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
            <Smartphone className="size-4 text-primary shrink-0" />
            <span>Tap <strong>Share</strong> then <strong>'Add to Home Screen'</strong> to install.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="w-full gap-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9"
              onClick={handleInstallClick}
            >
              <Download className="size-3.5" /> Install App Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
