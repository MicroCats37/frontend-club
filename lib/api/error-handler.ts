import type { AxiosError } from "axios";

/**
 * Procesa errores de Axios de forma centralizada
 * Extrae mensajes de error de Django REST Framework
 */
export function handleApiError(
	error: any,
): string | (Error & { fieldErrors?: Record<string, string> }) {
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
	if (status === 422) {
		const errorsSource = data.errors || data.detail;
		if (Array.isArray(errorsSource)) {
			// Si es un array (formato estándar de Ninja/Pydantic)
			const fieldErrors: Record<string, string> = {};
			const messages = errorsSource.map((err: any) => {
				// Tomamos el último elemento de loc como el nombre del campo
				// Pydantic loc suele ser ['body', 'field'] o ['data', 'field']
				const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : "";
				const msg = err.msg;
				if (field && field !== "body" && field !== "data") {
					fieldErrors[field] = msg;
					return `${field}: ${msg}`;
				}
				return msg;
			});

			// Adjuntamos los errores por campo al error para que GenericForm los use
			const errorWithFields = new Error(messages.join("; ")) as any;
			errorWithFields.fieldErrors = fieldErrors;
			return errorWithFields;
		}
	}

	return data.message || data.detail || "Ocurrió un error en la solicitud.";
}

/**
 * Helper para obtener siempre un string de mensaje de un error procesado por handleApiError.
 * Útil para toasts o lugares que solo aceptan strings/ReactNodes.
 */
export function getErrorMessage(error: any): string {
	const result = handleApiError(error);
	return typeof result === "string" ? result : result.message;
}
