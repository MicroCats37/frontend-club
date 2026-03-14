import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";
import {
	type BatchGaleriaItem,
	type Bungalow,
	BungalowSchema,
	type BungalowUpdate,
	PaginatedBungalowSchema,
	type BungalowPricingList,
	BungalowPricingListSchema,
} from "@/schemas/alojamiento/bungalow";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiCreate } from "@/hooks/useApiCreate";
import { useApiUpdate } from "@/hooks/useApiUpdate";
import { useApiDelete } from "@/hooks/useApiDelete";
import { buildApiPayload } from "@/utils/payload/format";


const BUNGALOWS_URL = "/api/alojamiento/bungalows";

export const useBungalows = () => {
	return useApiQuery({
		queryKey: ["bungalows"],
		url: `${BUNGALOWS_URL}/`,
		schema: z.union([PaginatedBungalowSchema, z.array(BungalowSchema)]),
		queryOptions: {
			select: (parsed) => {
				return Array.isArray(parsed) ? parsed : (parsed.results as Bungalow[]);
			},
		},
	});
};

export function useBungalow(id: number | string | null) {
	return useApiQuery({
		queryKey: ["bungalow", id],
		url: id ? `${BUNGALOWS_URL}/${id}/` : null,
		schema: BungalowSchema,
	});
}

export const useCreateBungalow = () => {
	const queryClient = useQueryClient();
	return useApiCreate({
		url: `${BUNGALOWS_URL}/`,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["bungalows"] });
			},
		},
	});
};

export const useUpdateBungalow = () => {
	const queryClient = useQueryClient();
	return useApiUpdate({
		baseUrl: BUNGALOWS_URL,
		method: "PATCH",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["bungalows"] });
			},
		},
	});
};

export const useUpdateBungalowEstado = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: number | string; data: { estado: string } }) => {
			const res = await api.patch(`${BUNGALOWS_URL}/${id}/estado/`, data);
			return res.data;
		},
		onMutate: async (variables) => {
			// Cancelar búsquedas salientes
			await queryClient.cancelQueries({ queryKey: ["bungalows"] });

			// Snapshot del valor previo
			const previousData = queryClient.getQueryData<any>(["bungalows"]);

			// Actualizar optimísticamente el cache
			if (previousData) {
				queryClient.setQueryData<any>(["bungalows"], (old) => {
					if (!old) return old;

					// Caso 1: Es una lista plana (Array)
					if (Array.isArray(old)) {
						return old.map((b) =>
							b.id === variables.id ? { ...b, estado: variables.data.estado } : b,
						);
					}

					// Caso 2: Es un objeto paginado { results: [...], count: ... }
					if (old.results && Array.isArray(old.results)) {
						return {
							...old,
							results: old.results.map((b: any) =>
								b.id === variables.id ? { ...b, estado: variables.data.estado } : b,
							),
						};
					}

					return old;
				});
			}

			return { previousData };
		},
		onError: (err, _variables, context: any) => {
			// Revertir al valor previo si falla
			if (context?.previousData) {
				queryClient.setQueryData(["bungalows"], context.previousData);
			}
			const message = handleApiError(err);
			toast.error(message || "No se pudo actualizar el estado");
		},
		onSettled: () => {
			// Refrescar siempre para sincronizar con el server
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
		},
	});
};

export const useBatchGallery = (bungalowId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (items: BatchGaleriaItem[]) => {
			const payload = buildApiPayload({ imagenes: items });

			const res = await api.post(
				`${BUNGALOWS_URL}/${bungalowId}/galeria/batch/`,
				payload,
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
			queryClient.invalidateQueries({
				queryKey: ["bungalow", bungalowId.toString()],
			});
		},
	});
};


export const useDeleteBungalow = () => {
	const queryClient = useQueryClient();
	return useApiDelete({
		baseUrl: BUNGALOWS_URL,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["bungalows"] });
			},
		},
	});
};

export function useBungalowsDisponibilidad(params: {
	f_inicio: string;
	f_fin: string;
	capacidad?: number;
	tipo_tarifa_id?: string;
}) {
	return useApiQuery({
		queryKey: ["bungalows", "disponibilidad", params],
		url: `${BUNGALOWS_URL}/disponibilidad/`,
		params,
		schema: z.array(z.any()),
		queryOptions: {
			enabled: !!params.f_inicio && !!params.f_fin,
		},
	});
}

export function useBungalowPricingList() {
	return useApiQuery<BungalowPricingList[]>({
		queryKey: ["bungalows", "precios"],
		url: `${BUNGALOWS_URL}/precios/`,
		schema: z.array(BungalowPricingListSchema),
	});
}
