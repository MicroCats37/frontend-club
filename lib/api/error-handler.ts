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

	// Errores de validación de Django Ninja / Pydantic (422)
	if (status === 422 && Array.isArray(data.detail)) {
		return data.detail
			.map((err: any) => {
				const field = Array.isArray(err.loc) ? err.loc.join(".") : "";
				return field ? `${field}: ${err.msg}` : err.msg;
			})
			.join(", ");
	}

	return (typeof data.detail === 'string' ? data.detail : null) || data.message || "Ocurrió un error en la solicitud.";
}
