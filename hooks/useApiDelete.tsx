// src/hooks/useApiDelete.ts

import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { getErrorMessage, handleApiError } from "@/lib/api/error-handler";

export function useApiDelete<TData = void>({
	baseUrl,
	options,
}: {
	baseUrl: string;
	options?: Omit<
		UseMutationOptions<TData, AxiosError, number | string>,
		"mutationFn"
	>;
}) {
	return useMutation<TData, AxiosError, number | string>({
		mutationFn: async (id) => {
			try {
				const { data } = await api.delete(`${baseUrl}/${id}/`);
				return data as TData;
			} catch (error) {
				// Captura errores de "No se puede eliminar este registro" de Django
				const cleanMessage = getErrorMessage(error);
				toast.error(cleanMessage);
				throw new Error(cleanMessage);
			}
		},
		...options,
	});
}
