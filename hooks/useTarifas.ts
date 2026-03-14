import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/config";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error-handler";
import { useApiQuery } from "@/hooks/useApiQuery";
import { z } from "zod";
import { 
	TipoTarifaSchema, 
	PaginatedTipoTarifaSchema,
	type TipoTarifa,
	type PaginatedTipoTarifa
} from "@/schemas/alojamiento/tarifa";

export type { TipoTarifa, PaginatedTipoTarifa };

const TIPO_TARIFAS_URL = "/api/alojamiento/tipo-tarifas/";
const BUNGALOWS_URL = "/api/alojamiento/bungalows/";

// Las interfaces ya vienen del esquema de Zod

export interface BungalowTarifaPair {
	dias_tarifa_id: string;
	precio_con_privilegio: number;
	precio_sin_privilegio: number;
}

// Hook para obtener todos los tipos de tarifa
export function useTipoTarifas(page?: number) {
	return useApiQuery<PaginatedTipoTarifa | TipoTarifa[]>({
		queryKey: ["tipo-tarifas", page],
		url: page ? `${TIPO_TARIFAS_URL}?page=${page}` : TIPO_TARIFAS_URL,
		schema: z.union([PaginatedTipoTarifaSchema, z.array(TipoTarifaSchema)]),
	});
}

// Hook para obtener solo tipos de tarifa habilitados (no paginado)
export function useTipoTarifasHabilitadas(fecha?: string) {
	return useApiQuery<TipoTarifa[]>({
		queryKey: ["tipo-tarifas", "selector", fecha],
		url: fecha ? `${TIPO_TARIFAS_URL}selector/?fecha=${fecha}` : `${TIPO_TARIFAS_URL}selector/`,
		schema: z.array(TipoTarifaSchema),
	});
}

// Hook para CRUD de TipoTarifa
export function useCreateTipoTarifa() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: Partial<TipoTarifa>) => {
			const res = await api.post(TIPO_TARIFAS_URL, data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tipo-tarifas"] });
			toast.success("Tipo de tarifa creado");
		},
		onError: (err) => {
			const msg = handleApiError(err);
			toast.error(msg || "No se pudo crear el tipo de tarifa");
		},
	});
}

// Hook para actualizar un tipo de tarifa
export function useUpdateTipoTarifa() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<TipoTarifa> }) => {
			const res = await api.patch(`${TIPO_TARIFAS_URL}${id}/`, data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tipo-tarifas"] });
			toast.success("Tipo de tarifa actualizado");
		},
		onError: (err) => {
			const msg = handleApiError(err);
			toast.error(msg || "No se pudo actualizar el tipo de tarifa");
		},
	});
}

// Hook para eliminar un tipo de tarifa
export function useDeleteTipoTarifa() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await api.delete(`${TIPO_TARIFAS_URL}${id}/`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tipo-tarifas"] });
			toast.success("Tipo de tarifa eliminado");
		},
		onError: (err) => {
			const msg = handleApiError(err);
			toast.error(msg || "No se pudo eliminar el tipo de tarifa");
		},
	});
}

export interface SyncTarifasPorCapacidad {
	dias_tarifa_id: string;
	items: {
		capacidad: number;
		precio_con_privilegio: number;
		precio_sin_privilegio: number;
	}[];
}

// Hook para sincronizar tarifas masivas por capacidad
export function useSyncTarifasByCapacity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: SyncTarifasPorCapacidad) => {
			const res = await api.post(`${BUNGALOWS_URL}sincronizar-capacidad/`, payload);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows", "precios"] });
			toast.success("Precios sincronizados por capacidad");
		},
		onError: (err) => {
			const msg = handleApiError(err);
			toast.error(msg || "No se pudo sincronizar los precios");
		},
	});
}
export function useSyncBungalowTarifas(bungalowId: number | string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (payload: BungalowTarifaPair) => {
			const res = await api.post(`${BUNGALOWS_URL}${bungalowId}/tarifas/`, payload);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bungalows"] });
			queryClient.invalidateQueries({ queryKey: ["bungalows", "precios"] });
			toast.success("Precios actualizados correctamente");
		},
		onError: (err) => {
			const msg = handleApiError(err);
			toast.error(msg || "No se pudo actualizar los precios");
		},
	});
}
