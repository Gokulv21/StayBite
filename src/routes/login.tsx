import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, type SessionUser } from "@/stores/session-store";
import { useDataStore } from "@/stores/data-store";
import { sanitizeInput, RateLimiter, verifyPassword, hashPassword, logSecurityEvent } from "@/lib/security";
import { createJwtToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Hotel, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - StayBite" },
      { name: "description", content: "Sign in to manage your hotel, restaurant, and POS." },
    ],
  }),
  component: LoginPage,
});

// Cryptographic hash of Master Owner Password (Salted SHA-256)
const MASTER_OWNER_HASH = "815668ca78ce1341c2c2f7ce9553f1c1f54463428d0092c462758155d88fa76d";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useSession((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanEmail = sanitizeInput(email.trim().toLowerCase(), 100);
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast.error("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    // 1. Abuse Protection: Check Rate Limiter
    const rateCheck = RateLimiter.checkRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      toast.error(`⚠️ Security Lockout: Too many failed attempts. Try again in ${rateCheck.remainingSeconds}s.`);
      logSecurityEvent("RATE_LIMIT_BLOCKED", { email: cleanEmail, remainingSeconds: rateCheck.remainingSeconds });
      setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    // 2. Master Owner Login Authentication
    if (cleanEmail === "gokie210402@gmail.com") {
      const isPasswordValid = await verifyPassword(cleanPassword, MASTER_OWNER_HASH);

      if (isPasswordValid) {
        RateLimiter.reset(cleanEmail);
        const superAdmin: SessionUser = {
          id: "sa_001",
          name: "Gokul SuperAdmin",
          email: "gokie210402@gmail.com",
          role: "super_admin",
          status: "paid",
        };

        // Generate persistent JWT token
        const jwtToken = await createJwtToken({
          id: superAdmin.id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: superAdmin.role
        });

        login(superAdmin, [{ id: "b_001", name: "Chennai HQ", city: "Chennai" }], jwtToken);
        logSecurityEvent("LOGIN_SUCCESS", { userId: superAdmin.id, role: superAdmin.role });
        toast.success("Welcome back, Super Admin!");
        navigate({ to: "/" });
        return;
      } else {
        const rateResult = RateLimiter.recordFailedAttempt(cleanEmail);
        logSecurityEvent("LOGIN_FAILED_PASSWORD", { email: cleanEmail, attemptsLeft: rateResult.remainingAttempts });
        if (rateResult.locked) {
          toast.error(`Account locked for 5 minutes due to multiple failed login attempts.`);
        } else {
          toast.error(`Invalid password. ${rateResult.remainingAttempts} attempt(s) remaining before lockout.`);
        }
        setIsLoading(false);
        return;
      }
    }

    // 3. Staff Employee Login Authentication
    if (cleanEmail.startsWith("S-")) {
      const staffList = useDataStore.getState().staffList;
      const staff = staffList.find((item) => item.id === cleanEmail);

      if (!staff) {
        RateLimiter.recordFailedAttempt(cleanEmail);
        toast.error("Employee ID not found.");
        setIsLoading(false);
        return;
      }

      // Check plaintext or hashed staff password
      const expectedStaffHash = staff.password?.length === 64 ? staff.password : await hashPassword(staff.password || "staff123");
      const isStaffPassValid = await verifyPassword(cleanPassword, expectedStaffHash);

      if (!isStaffPassValid) {
        const rateResult = RateLimiter.recordFailedAttempt(cleanEmail);
        logSecurityEvent("STAFF_LOGIN_FAILED", { staffId: cleanEmail, attemptsLeft: rateResult.remainingAttempts });
        if (rateResult.locked) {
          toast.error(`Employee ID locked for 5 minutes.`);
        } else {
          toast.error(`Incorrect employee password. ${rateResult.remainingAttempts} attempt(s) left.`);
        }
        setIsLoading(false);
        return;
      }

      if (staff.status !== "Active") {
        toast.error("This employee account is inactive. Contact hotel management.");
        setIsLoading(false);
        return;
      }

      RateLimiter.reset(cleanEmail);
      const staffUser: SessionUser = {
        id: staff.id,
        name: staff.name,
        email: staff.email || `${staff.id}@staybite.local`,
        role: staff.role as any,
        status: "paid",
      };

      const jwtToken = await createJwtToken({
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role
      });

      login(staffUser, [{ id: "b_hq", name: "StayBite HQ", city: "Chennai" }], jwtToken);
      logSecurityEvent("STAFF_LOGIN_SUCCESS", { staffId: staff.id, role: staff.role });
      toast.success(`Welcome back, ${staff.name}!`);

      if (staff.role === "kitchen") navigate({ to: "/kds" });
      else if (staff.role === "cashier") navigate({ to: "/pos" });
      else if (staff.role === "housekeeping") navigate({ to: "/rooms" });
      else navigate({ to: "/" });
      return;
    }

    RateLimiter.recordFailedAttempt(cleanEmail);
    toast.error("Invalid credentials. Contact vendor/owner for account provisioning.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80">
          <div className="p-8">
            <div className="flex justify-center mb-8">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center transform rotate-3">
                <Hotel className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome to StayBite</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Login-only platform for owner and staff operations.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email or Employee ID</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="owner@example.com or S-101"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Signup is disabled. New owner accounts are provisioned only by vendor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
