// src/hooks/useApiQuery.tsx
import {
	type QueryKey,
	type UseQueryOptions,
	useQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { ZodType } from "zod";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";

// Tu nuevo helper

interface UseApiQueryProps<T> {
	queryKey: QueryKey;
	url: string | null;
	schema: ZodType<T>;
	params?: Record<string, unknown>;
	queryOptions?: Omit<UseQueryOptions<T, AxiosError>, "queryKey" | "queryFn">;
}

export function useApiQuery<T>({
	queryKey,
	url,
	schema,
	params,
	queryOptions,
}: UseApiQueryProps<T>) {
	const isEnabled = !!url && queryOptions?.enabled !== false;

	const finalQueryKey = params
		? [...(Array.isArray(queryKey) ? queryKey : [queryKey]), params]
		: queryKey;

	return useQuery<T, AxiosError>({
		queryKey: finalQueryKey,
		queryFn: async () => {
			if (!url) throw new Error("URL is required");

			try {
				const { data } = await api.get(url, { params }); // Log de la respuesta de la API
				return schema.parse(data);
			} catch (error) {
				// Transformamos el error de DRF a un string legible
				const cleanMessage = handleApiError(error);
				toast.error(cleanMessage);
				console.error(cleanMessage);
				throw new Error(cleanMessage);
			}
		},
		enabled: isEnabled,
		...queryOptions,
	});
}
