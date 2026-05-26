import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession, type SessionUser } from "@/stores/session-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Hotel } from "lucide-react";
import { useDataStore } from "@/stores/data-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login - StayBite" },
      { name: "description", content: "Sign in to manage your hotel, restaurant, and POS." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const login = useSession((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (email === "gokie210402@gmail.com" && password === "Gokulman@21") {
      const superAdmin: SessionUser = {
        id: "sa_001",
        name: "Gokul SuperAdmin",
        email,
        role: "super_admin",
        status: "paid",
      };

      login(superAdmin, [{ id: "b_001", name: "Chennai HQ", city: "Chennai" }]);
      toast.success("Welcome back, Super Admin!");
      navigate({ to: "/" });
      return;
    }

    if (email.startsWith("S-")) {
      const staffList = useDataStore.getState().staffList;
      const staff = staffList.find((item) => item.id === email);

      if (!staff) {
        toast.error("Employee ID not found.");
        setIsLoading(false);
        return;
      }

      if (staff.password !== password) {
        toast.error("Incorrect password for employee account.");
        setIsLoading(false);
        return;
      }

      if (staff.status !== "Active") {
        toast.error("This employee account is inactive.");
        setIsLoading(false);
        return;
      }

      const staffUser: SessionUser = {
        id: staff.id,
        name: staff.name,
        email: staff.email || `${staff.id}@staybite.local`,
        role: staff.role as any,
        status: "paid",
      };

      login(staffUser, [{ id: "b_hq", name: "StayBite HQ", city: "Chennai" }]);
      toast.success(`Welcome back, ${staff.name}!`);

      if (staff.role === "kitchen") navigate({ to: "/kds" });
      else if (staff.role === "cashier") navigate({ to: "/pos" });
      else if (staff.role === "housekeeping") navigate({ to: "/rooms" });
      else navigate({ to: "/" });
      return;
    }

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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
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
