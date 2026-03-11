import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoggedUser } from "@/schemas/auth";

export interface AuthState {
	user: LoggedUser | null;
	isAuthenticated: boolean;
	token: string | null;

	// Actions
	setUserInfo: (user: LoggedUser) => void;
	setAuthenticated: (status: boolean) => void;
	login: (user: LoggedUser, token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: !!getCookie("token"),
			token: (getCookie("token") as string) || null,

			setUserInfo: (user) => set({ user, isAuthenticated: true }),
			setAuthenticated: (status) => set({ isAuthenticated: status }),
			login: (user, token) => {
				setCookie("token", token);
				set({ user, token, isAuthenticated: true });
			},
			logout: () => {
				deleteCookie("token");
				set({ user: null, token: null, isAuthenticated: false });
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
