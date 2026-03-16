"use client";

import { useEffect } from "react";
import type { LoggedUser } from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";

interface AuthInitializerProps {
	user?: LoggedUser | null;
}

/**
 * Componente silencioso que sincroniza la sesión al cargar la app.
 * Puede recibir un 'user' desde el servidor para hidratar el store inmediatamente.
 */
export default function AuthInitializer({ user }: AuthInitializerProps) {
	const { checkAuth, setUserInfo } = useAuthStore.getState();

	useEffect(() => {
		// 1. Si el servidor nos pasó un usuario (ej: desde un layout SSR), lo inyectamos al store
		if (user) {
			setUserInfo(user);
		}

		// 2. Ejecutar la validación global de cookies (Ghost Session Fix)
		checkAuth();
	}, [user, checkAuth, setUserInfo]);

	return null;
}
