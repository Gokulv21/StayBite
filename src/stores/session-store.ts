// Auth/session + active branch. Backend wiring (JWT, Spring Boot) is the
// user's responsibility — this store provides the contract.
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
  branches: Branch[];
  activeBranchId: string | null;
  isOnline: boolean;
  login: (user: SessionUser, branches: Branch[]) => void;
  register: (user: SessionUser, branches: Branch[]) => void;
  logout: () => void;
  setActiveBranch: (id: string) => void;
  setOnline: (online: boolean) => void;
  addBranch: (branch: Branch) => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null, // Start logged out
      branches: [],
      activeBranchId: null,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      login: (user, branches) =>
        set({ user, branches, activeBranchId: branches[0]?.id ?? null }),
      register: (user, branches) =>
        set({ user, branches, activeBranchId: branches[0]?.id ?? null }),
      logout: () => set({ user: null, activeBranchId: null, branches: [] }),
      setActiveBranch: (id) => set({ activeBranchId: id }),
      setOnline: (isOnline) => set({ isOnline }),
      addBranch: (branch) => set((state) => ({
        branches: [...state.branches, branch]
      })),
    }),
    {
      name: "staybite_session",
      partialize: (state) => {
        const { isOnline, ...rest } = state;
        return rest;
      },
    },
  ),
);
