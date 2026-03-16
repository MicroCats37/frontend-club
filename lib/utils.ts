import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Resuelve una URL de imagen para el frontend.
 * Si la ruta es relativa (empieza con /), le concatena el API_URL.
 * Si ya es absoluta (http...) o base64, la deja tal cual.
 */
export function resolveImageUrl(path: string | null | undefined): string {
	if (!path) return "";

	// Si es base64 o ya tiene protocolo, retornar tal cual
	if (
		path.startsWith("data:") ||
		path.startsWith("http") ||
		path.startsWith("blob:")
	) {
		return path;
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

	// Asegurar que no haya saltos de línea o espacios
	const cleanPath = path.trim();

	// Si empieza con / le concatenamos la base
	if (cleanPath.startsWith("/")) {
		return `${apiUrl}${cleanPath}`;
	}

	// Caso por defecto: asumimos que es una ruta relativa que requiere /
	return `${apiUrl}/${cleanPath}`;
}
