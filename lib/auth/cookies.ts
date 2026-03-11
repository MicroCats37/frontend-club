"use server";

import { cookies } from "next/headers";
import { type LoggedUser, LoggedUserSchema } from "@/schemas/auth";

// =============================================================================
// CONSTANTS (Centralized Cookie Names)
// =============================================================================
const COOKIE_ACCESS = "jwt-access";
const COOKIE_REFRESH = "jwt-refresh";
const COOKIE_USER = "user-session";

// =============================================================================
// GETTERS (Server-Side Read)
// =============================================================================

export async function getAccessToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIE_ACCESS)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIE_REFRESH)?.value;
}

export async function getUserSession(): Promise<LoggedUser | undefined> {
	const cookieStore = await cookies();
	const raw = cookieStore.get(COOKIE_USER)?.value;

	if (!raw) return undefined;

	try {
		const parsed = JSON.parse(raw);
		// Validamos con Zod para asegurar integridad
		return LoggedUserSchema.parse(parsed);
	} catch (err) {
		console.error("❌ Error parsing user session cookie:", err);
		return undefined;
	}
}

// =============================================================================
// SETTERS (Server-Side Write - Secure & HttpOnly)
// =============================================================================

export async function setAuthCookies(
	accessToken: string,
	refreshToken: string,
	user: LoggedUser,
): Promise<void> {
	const cookieStore = await cookies();

	// 1. Access Token (Vida corta: 5-15 min)
	cookieStore.set(COOKIE_ACCESS, accessToken, {
		httpOnly: true, // 🔒 Security: No accesible por JS del cliente (XSS safe)
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 15, // 15 minutos
	});

	// 2. Refresh Token (Vida larga: 7 días)
	cookieStore.set(COOKIE_REFRESH, refreshToken, {
		httpOnly: true, // 🔒 Security Critical
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 días
	});

	// 3. User Session (Datos NO sensibles para UI)
	// NOTA: 'httpOnly: false' para que el cliente pueda leerlo e hidratar Zustand
	// O podemos mantenerlo true y hidratar via Server Component
	cookieStore.set(COOKIE_USER, JSON.stringify(user), {
		httpOnly: false, // 🔓 Accedible por JS para hidratar Store
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

// =============================================================================
// CLEANUP (Logout)
// =============================================================================

export async function clearAuthCookies(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_ACCESS);
	cookieStore.delete(COOKIE_REFRESH);
	cookieStore.delete(COOKIE_USER);
}
