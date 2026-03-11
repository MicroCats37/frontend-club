/**
 * Utilidad pirata para construir el payload de la API.
 * Si recibe un objeto con archivos (File o Blob), genera un FormData.
 * De lo contrario, devuelve un objeto plano para JSON.
 */
export function buildApiPayload(
	data: Record<string, any>,
): FormData | Record<string, any> {
	const hasFile = Object.values(data).some(
		(val) => val instanceof File || val instanceof Blob,
	);

	if (!hasFile) return data;

	const formData = new FormData();
	for (const key in data) {
		if (Object.hasOwn(data, key)) {
			const val = data[key];
			if (val === null || val === undefined) continue;

			if (val instanceof File || val instanceof Blob) {
				formData.append(key, val);
			} else if (Array.isArray(val)) {
				// Manejo básico de arrays si es necesario
				val.forEach((item, index) => {
					formData.append(`${key}[${index}]`, item);
				});
			} else {
				formData.append(key, val.toString());
			}
		}
	}
	return formData;
}
