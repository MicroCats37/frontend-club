import type { AxiosError } from "axios";

/**
 * Procesa errores de Axios de forma centralizada
 * Extrae mensajes de error de Django REST Framework
 */
export function handleApiError(error: any): string {
	const axiosError = error as AxiosError<any>;

	if (!axiosError.response) {
		if (axiosError.request) {
			return "No se pudo conectar con el servidor. Verifique su conexión.";
		}
		return axiosError.message || "Ocurrió un error inesperado.";
	}

	const { status, data } = axiosError.response;

	// Errores de validación de DRF (400)
	if (status === 400 && typeof data === "object") {
		// Función recursiva para buscar el primer mensaje de error (string)
		const findFirstError = (obj: any): string => {
			if (typeof obj === "string") return obj;
			if (Array.isArray(obj)) {
				for (const item of obj) {
					const result = findFirstError(item);
					if (result) return result;
				}
			}
			if (typeof obj === "object" && obj !== null) {
				for (const key in obj) {
					const result = findFirstError(obj[key]);
					if (result) return result;
				}
			}
			return "";
		};

		const firstError = findFirstError(data);
		return firstError || "Datos de formulario inválidos.";
	}

	// Error de credenciales (401)
	if (status === 401) {
		return data.detail || "Credenciales incorrectas o sesión expirada.";
	}

	// Error de permisos (403)
	if (status === 403) {
		return data.detail || "No tiene permisos para realizar esta acción.";
	}

	// Error No Encontrado (404)
	if (status === 404) {
		return "El recurso solicitado no existe.";
	}

	// Error de Servidor (500)
	if (status >= 500) {
		return "Error interno del servidor. Intente más tarde.";
	}

	return data.detail || data.message || "Ocurrió un error en la solicitud.";
}
