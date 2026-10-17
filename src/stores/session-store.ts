// StayBite Long-Lived JWT Session Store (Instagram/Mobile App Persistent Auth)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/rbac";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "paid" | "unpaid";
  avatarUrl?: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
}

interface SessionState {
  user: SessionUser | null;
  token: string | null;
  branches: Branch[];
  activeBranchId: string | null;
  isOnline: boolean;
  login: (user: SessionUser, branches: Branch[], token?: string) => void;
  register: (user: SessionUser, branches: Branch[], token?: string) => void;
  logout: () => void;
  setActiveBranch: (id: string) => void;
  setOnline: (online: boolean) => void;
  addBranch: (branch: Branch) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      branches: [],
      activeBranchId: null,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      
      // Persistent Login (Stays logged in like Instagram/WhatsApp mobile apps)
      login: (user, branches, token) =>
        set({ 
          user, 
          token: token || null,
          branches, 
          activeBranchId: branches[0]?.id ?? null 
        }),

      register: (user, branches, token) =>
        set({ 
          user, 
          token: token || null,
          branches, 
          activeBranchId: branches[0]?.id ?? null 
        }),

      // Explicit Logout only
      logout: () => set({ user: null, token: null, activeBranchId: null, branches: [] }),
      
      setActiveBranch: (id) => set({ activeBranchId: id }),
      setOnline: (isOnline) => set({ isOnline }),
      addBranch: (branch) => set((state) => ({
        branches: [...state.branches, branch]
      })),
    }),
    {
      name: "staybite_session_v2",
      partialize: (state) => {
        const { isOnline, ...rest } = state;
        return rest;
      },
    }
  )
);
