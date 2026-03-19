"use server";

import { cookies } from "next/headers";
import type { LoggedUser } from "@/schemas/auth";

// =============================================================================
// ACTIONS (Server-Side Cookie Management)
// =============================================================================

/**
 * Guarda las cookies de sesión de forma segura (HttpOnly)
 * Se llama DESPUÉS de un login exitoso en el cliente
 */
export async function setAuthCookies(
	accessToken: string,
	refreshToken: string,
	user: LoggedUser,
): Promise<void> {
	const cookieStore = await cookies();
	const isDeployment = process.env.NEXT_PUBLIC_IS_DEPLOYMENT === "true";

	// Configuración base (si es deploy -> seguro, si no -> relajado)
	const cookieOptions = {
		httpOnly: false, // Desarrollo: False para debug / Prod: True (XSS protection)
		secure: false, // Desarrollo: False (HTTP) / Prod: True (HTTPS)
		sameSite: "lax" as const,
		path: "/",
	};

	// 1. Access Token (Vida corta: 15 min aprox)
	cookieStore.set("jwt-access", accessToken, {
		...cookieOptions,
		maxAge: 60 * 60, // 60 minutos
	});

	// 2. Refresh Token (Vida larga: 7 días)
	cookieStore.set("jwt-refresh", refreshToken, {
		...cookieOptions,
		maxAge: 60 * 60 * 24 * 7, // 7 días
	});

	// 3. User Session (Datos NO sensibles para UI) -> Accesible por JS
	cookieStore.set("user-session", JSON.stringify(user), {
		httpOnly: false, // Siempre accesible para hidratar Zustand
		secure: false,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

/**
 * Elimina todas las cookies de sesión (Logout)
 */
export async function deleteAuthCookies(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete("jwt-access");
	cookieStore.delete("jwt-refresh");
	cookieStore.delete("user-session");
}

/**
 * Obtiene el access token (Solo usable en Server Components o Server Actions)
 */
export async function getAccessTokenServer(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get("jwt-access")?.value;
}
