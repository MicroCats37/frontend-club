import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import type { ZodType } from "zod";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";
import { buildApiPayload } from "@/utils/payload/format";

type UpdateVariables<TPayload> = { id: number | string; data: TPayload };

export function useApiUpdate<TData = unknown, TPayload = unknown>({
	baseUrl,
	schema,
	method = "PUT",
	options,
}: {
	baseUrl: string;
	schema?: ZodType<TData>;
	method?: "PUT" | "PATCH";
	options?: Omit<
		UseMutationOptions<TData, AxiosError, UpdateVariables<TPayload>>,
		"mutationFn"
	>;
}) {
	return useMutation<TData, AxiosError, UpdateVariables<TPayload>>({
		mutationFn: async ({ id, data }) => {
			try {
				const payload = buildApiPayload(data);
				const config: AxiosRequestConfig = {};
				const { data: responseData } = await api.request({
					url: `${baseUrl}/${id}/`,
					method: method,
					data: payload,
					headers: config.headers,
				});
				return schema ? schema.parse(responseData) : (responseData as TData);
			} catch (error) {
				// Captura errores de validación de Django (DRF)
				const cleanMessage = handleApiError(error);
				toast.error(cleanMessage);
				throw new Error(cleanMessage);
			}
		},
		...options,
	});
}
