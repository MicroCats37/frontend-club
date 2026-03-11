/**
 * Utility to build API payloads.
 * Automatically decides between JSON and FormData based on the content (e.g., if it contains Files).
 */
export function buildApiPayload(variables: unknown): any {
	if (!variables || typeof variables !== "object") return variables;

	const data = variables as Record<string, any>;

	// Check if any value is a File or Blob to decide using FormData
	const hasFiles = Object.values(data).some(
		(value) => value instanceof File || value instanceof Blob,
	);

	if (hasFiles) {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					for (const val of value) {
						formData.append(key, val);
					}
				} else {
					formData.append(key, value);
				}
			}
		});
		return formData;
	}

	// Otherwise return plain object (Axios will convert to JSON)
	return data;
}
