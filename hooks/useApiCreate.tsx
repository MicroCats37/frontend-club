// src/hooks/useApiCreate.ts

import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import type { ZodType } from "zod";
import api from "@/lib/api/config";
import { getErrorMessage, handleApiError } from "@/lib/api/error-handler";
import { buildApiPayload } from "@/utils/payload/format";

interface UseApiCreateProps<TData, TVariables> {
	url: string;
	schema?: ZodType<TData>;
	options?: Omit<
		UseMutationOptions<TData, AxiosError, TVariables>,
		"mutationFn"
	>;
}

export function useApiCreate<TData = unknown, TVariables = unknown>({
	url,
	schema,
	options,
}: UseApiCreateProps<TData, TVariables>) {
	return useMutation<TData, AxiosError, TVariables>({
		mutationFn: async (variables) => {
			try {
				// 1. El Builder decide: ¿Retorna JSON plano o FormData?
				const payload = buildApiPayload(variables);

				const config: AxiosRequestConfig = {};

				const { data } = await api.post(url, payload, config);

				return schema ? schema.parse(data) : (data as TData);
			} catch (error) {
				const cleanMessage = getErrorMessage(error);
				toast.error(cleanMessage);
				throw new Error(cleanMessage);
			}
		},
		...options,
	});
}
