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

	// Caso A: Error de lógica de negocio personalizado ({ errors: { message: "..." } })
	if (data.errors?.message) {
		return data.errors.message;
	}

	// Caso B: Error de detalle personalizado ({ detail: "..." })
	if (typeof data.detail === "string") {
		return data.detail;
	}

	// Errores de validación de Django Ninja / Pydantic (422)
	if (status === 422 && Array.isArray(data.detail)) {
		return data.detail
			.map((err: any) => {
				const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : "";
				return field ? `${field}: ${err.msg}` : err.msg;
			})
			.join("; ");
	}

	return data.message || "Ocurrió un error en la solicitud.";
}
