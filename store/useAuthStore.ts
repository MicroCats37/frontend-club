import { deleteCookie, getCookie, setCookie, hasCookie } from "cookies-next";
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
	checkAuth: () => void; // Nueva acción para forzar sincronización
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false, // Inicializado en falso, checkAuth lo corregirá
			token: null,

			setUserInfo: (user) => set({ user, isAuthenticated: true }),
			setAuthenticated: (status) => set({ isAuthenticated: status }),
			
			login: (user, token) => {
				// cookies-next setCookie ya maneja el almacenamiento
				set({ user, token, isAuthenticated: true });
			},

			logout: () => {
				// Eliminamos cookies (vía cliente por defecto aquí)
				deleteCookie("jwt-access");
				deleteCookie("jwt-refresh");
				deleteCookie("user-session");
				
				// Limpiamos estado local
				set({ user: null, token: null, isAuthenticated: false });
				
				// Redirigir si estamos en el cliente
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			},

			checkAuth: () => {
				const token = getCookie("jwt-access");
				const isAuthenticated = !!token;
				
				// Si no hay token pero el estado dice que estamos autenticados -> Sincronizar (Ghost Session Fix)
				if (!isAuthenticated && get().isAuthenticated) {
					get().logout();
				}
			}
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
