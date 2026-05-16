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
  logout: () => void;
  setActiveBranch: (id: string) => void;
  setOnline: (online: boolean) => void;
}

// Demo seed — replace with real auth response.
const DEMO_USER: SessionUser = {
  id: "u_001",
  name: "Marcus Chen",
  email: "marcus@arborhotels.com",
  role: "owner",
};
const DEMO_BRANCHES: Branch[] = [
  { id: "b_001", name: "Highland Park Manor", city: "Mumbai" },
  { id: "b_002", name: "Coastal Retreat", city: "Goa" },
  { id: "b_003", name: "Mountain Lodge", city: "Manali" },
];

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: DEMO_USER,
      branches: DEMO_BRANCHES,
      activeBranchId: DEMO_BRANCHES[0].id,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      login: (user, branches) =>
        set({ user, branches, activeBranchId: branches[0]?.id ?? null }),
      logout: () => set({ user: null, activeBranchId: null }),
      setActiveBranch: (id) => set({ activeBranchId: id }),
      setOnline: (isOnline) => set({ isOnline }),
    }),
    { name: "hotel_pos_session" },
  ),
);
