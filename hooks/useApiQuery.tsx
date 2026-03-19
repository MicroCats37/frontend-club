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
import { getErrorMessage, handleApiError } from "@/lib/api/error-handler";

// Tu nuevo helper

interface UseApiQueryProps<T, TData = T> {
	queryKey: QueryKey;
	url: string | null;
	schema: ZodType<T>;
	params?: Record<string, unknown>;
	queryOptions?: Omit<
		UseQueryOptions<T, AxiosError, TData>,
		"queryKey" | "queryFn"
	>;
}

export function useApiQuery<T, TData = T>({
	queryKey,
	url,
	schema,
	params,
	queryOptions,
}: UseApiQueryProps<T, TData>) {
	const isEnabled = !!url && queryOptions?.enabled !== false;

	const finalQueryKey = params
		? [...(Array.isArray(queryKey) ? queryKey : [queryKey]), params]
		: queryKey;

	return useQuery<T, AxiosError, TData>({
		queryKey: finalQueryKey,
		queryFn: async () => {
			if (!url) throw new Error("URL is required");

			try {
				const { data } = await api.get(url, { params });
				return schema.parse(data);
			} catch (error) {
				const cleanMessage = getErrorMessage(error);
				toast.error(cleanMessage);
				console.error(cleanMessage);
				throw new Error(cleanMessage);
			}
		},
		enabled: isEnabled,
		...queryOptions,
	});
}
