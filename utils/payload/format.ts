// src/utils/api/payloadBuilder.ts

const FILE_PREFIX = "file_";

// El resultado puede ser FormData O tu tipo original T
// El resultado puede ser FormData O tu tipo original T
export type PayloadResult<T> = FormData | T;

const generateUUID = (): string => {
	// 1. Intenta usar la API nativa segura (Solo HTTPS/Localhost)
	if (
		typeof window !== "undefined" &&
		window.crypto &&
		window.crypto.randomUUID
	) {
		try {
			return window.crypto.randomUUID();
		} catch (_e) {
			console.warn("crypto.randomUUID falló, usando fallback");
		}
	}

	// 2. Fallback para entornos no seguros (HTTP LAN)
	// Genera un UUID v4 válido usando Math.random
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export function buildApiPayload<T>(inputData: T): PayloadResult<T> {
	const fileMap = new Map<string, File>();

	const scanAndTokenize = (node: unknown): unknown => {
		if (node === null || node === undefined) return node;

		if (node instanceof File) {
			const uuid = generateUUID();
			const strictKey = `${FILE_PREFIX}${uuid}`;
			fileMap.set(strictKey, node);
			return strictKey; // Retornamos la referencia string
		}

		if (node instanceof Date) return node;

		if (Array.isArray(node)) return node.map(scanAndTokenize);

		if (typeof node === "object") {
			const cleanObj: Record<string, unknown> = {};
			Object.keys(node as Record<string, unknown>).forEach((key) => {
				cleanObj[key] = scanAndTokenize((node as Record<string, unknown>)[key]);
			});
			return cleanObj;
		}

		return node;
	};

	// 1. Procesamos
	const tokenizedData = scanAndTokenize(inputData);

	// 2. DECISIÓN AUTOMÁTICA
	// Si no hubo archivos, devolvemos el objeto original (Axios lo enviará como JSON)
	if (fileMap.size === 0) {
		return inputData;
	}

	// 3. Si hubo archivos, empaquetamos en FormData
	const formData = new FormData();
	formData.append("data", JSON.stringify(tokenizedData));

	fileMap.forEach((file, key) => {
		formData.append(key, file);
	});

	return formData;
}
