import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import api from "@/lib/api/config";
import {
	type BatchGaleriaItem,
	type Bungalow,
	BungalowSchema,
	type BungalowUpdate,
	PaginatedBungalowSchema,
} from "@/schemas/alojamiento/bungalow";
import { buildApiPayload } from "@/utils/root";

const BUNGALOWS_URL = "/api/alojamiento/bungalows";

const getBungalows = async () => {
	const response = await api.get(`${BUNGALOWS_URL}/`);
	const parsed = z
		.union([PaginatedBungalowSchema, z.array(BungalowSchema)])
		.parse(response.data);

	return Array.isArray(parsed) ? parsed : (parsed.results as Bungalow[]);
};

export const useBungalows = () => {
	return useQuery({
		queryKey: ["bungalows"],
		queryFn: getBungalows,
	});
};

export function useBungalow(id: number | string | null) {
	return useQuery({
		queryKey: ["bungalow", id],
		queryFn: async () => {
			const res = await api.get(`${BUNGALOWS_URL}/${id}/`);
			return BungalowSchema.parse(res.data);
		},
		enabled: !!id,
	});
}

export const useCreateBungalow = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: BungalowUpdate) => {
			const payload = buildApiPayload(data);
			const res = await api.post(`${BUNGALOWS_URL}/`, payload);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
		},
	});
};

export const useUpdateBungalow = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: BungalowUpdate }) => {
			const payload = buildApiPayload(data);
			const res = await api.patch(`${BUNGALOWS_URL}/${id}/`, payload);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
		},
	});
};

export const useUpdateBungalowEstado = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: { estado: string; descripcion_estado?: string };
		}) => {
			const res = await api.patch(`${BUNGALOWS_URL}/${id}/estado/`, data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
		},
	});
};

export const useBatchGallery = (bungalowId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (items: BatchGaleriaItem[]) => {
			const payload = new FormData();

			for (const [index, item] of items.entries()) {
				payload.append(
					`imagenes[${index}]action`,
					item.operacion.toUpperCase(),
				);
				if (item.id) payload.append(`imagenes[${index}]id`, item.id.toString());
				if (item.file) payload.append(`imagenes[${index}]file`, item.file);
				if (item.descripcion)
					payload.append(`imagenes[${index}]descripcion`, item.descripcion);
			}

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
	return useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`${BUNGALOWS_URL}/${id}/`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
		},
	});
};

export function useBungalowsDisponibilidad(params: {
	f_inicio: string;
	f_fin: string;
	capacidad?: number;
	tipo_tarifa_id?: string;
}) {
	return useQuery({
		queryKey: ["bungalows", "disponibilidad", params],
		queryFn: async () => {
			const res = await api.get(`${BUNGALOWS_URL}/disponibilidad/`, {
				params,
			});
			return z.array(z.any()).parse(res.data);
		},
		enabled: !!params.f_inicio && !!params.f_fin,
	});
}
