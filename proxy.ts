// middleware.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/registro", "/"];

function decodeJWT(token: string) {
	try {
		const payload = token.split(".")[1];
		// Reemplazar caracteres Base64URL por Base64 estándar y añadir padding si falta
		const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = atob(base64);
		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error("❌ [Middleware] Error decodificando JWT:", error);
		return null;
	}
}

export async function proxy(request: NextRequest) {
	const token = request.cookies.get("jwt-access")?.value;
	const path = request.nextUrl.pathname;

	const isPublicPath = PUBLIC_PATHS.includes(path);

	// Si NO hay token → permitir rutas públicas, bloquear privadas
	if (!token) {
		if (!isPublicPath) {
			if (path.startsWith("/api/")) {
				return NextResponse.json(
					{ detail: "Authentication credentials were not provided." },
					{ status: 401 },
				);
			}
			return NextResponse.redirect(new URL("/login", request.url));
		}
		return NextResponse.next();
	}

	// Si hay token → verificar expiración y refresh proactivo
	const decoded = decodeJWT(token);
	const now = Math.floor(Date.now() / 1000); // Segundos

	if (!decoded) {
		return handleLogout(request);
	}

	// 1. Expirado completamente -> Logout
	if (decoded.exp < now) {
		return handleLogout(request);
	}

	// 2. Refresh Proactivo: Si quedan menos de 5 minutos, intentamos refrescar
	// (Solo en rutas privadas para evitar carga innecesaria en login)
	const timeUntilExpiry = decoded.exp - now;
	const REFRESH_THRESHOLD = 5 * 60; // 5 minutos

	if (timeUntilExpiry < REFRESH_THRESHOLD && !isPublicPath) {
		try {
			const refreshToken = request.cookies.get("jwt-refresh")?.value;

			if (refreshToken) {
				// Llamada al backend de Django para refrescar
				// OJO: Usamos fetch directo porque axios no corre en Edge Runtime (middleware)
				const refreshRes = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/refresh/`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ refresh: refreshToken }),
					},
				);

				if (refreshRes.ok) {
					const data = await refreshRes.json();
					const newAccessToken = data.access;

					// Clonamos la respuesta para poder setear la cookie nueva
					const response = NextResponse.next();
					const isDeployment = process.env.NEXT_PUBLIC_IS_DEPLOYMENT === "true";

					response.cookies.set("jwt-access", newAccessToken, {
						httpOnly: isDeployment,
						secure: isDeployment,
						sameSite: "lax",
						path: "/",
						maxAge: 60 * 15, // 15 minutos (reinicia el timer)
					});

					return response;
				}
			}
		} catch (error) {
			console.error("Error en refresh proactivo:", error);
		}
	}

	// Si el token existe y es válido → no dejar entrar al login ni registro
	// (Salvo que vengamos redirigidos por un error de sesión en el layout, para romper el bucle)
	if (
		(path === "/login" || path === "/registro") &&
		!request.nextUrl.searchParams.has("error")
	) {
		return NextResponse.redirect(new URL("/inicio", request.url));
	}

	// 3. Protección de rutas Admin
	if (path.startsWith("/admin")) {
		const userType = decoded.user_type;
		const isStaff = decoded.is_staff === true;

		if (userType !== "ADMIN" && userType !== "PORTERO" && !isStaff) {
			// Si no tiene permisos de staff, redirigir al inicio del colegiado
			return NextResponse.redirect(new URL("/inicio", request.url));
		}
	}

	return NextResponse.next();
}

/**
 * Helper para logout centralizado en middleware
 */
function handleLogout(request: NextRequest) {
	const res = NextResponse.redirect(new URL("/login", request.url));
	res.cookies.delete("jwt-access");
	res.cookies.delete("jwt-refresh");
	res.cookies.delete("user-session");
	return res;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
