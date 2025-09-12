import { create } from 'zustand';

export type User = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
} | null;

type UserState = {
  user: User;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
