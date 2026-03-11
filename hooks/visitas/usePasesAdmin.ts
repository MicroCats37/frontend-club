"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import type { CategoriaEntrada } from "./useGetCategoriasEntrada";

export interface TarifaEntrada {
	id: string;
	tipo_entrada_id: string;
	categoria_usuario: string;
	precios_rango_edad: {
		edad_min: number;
		edad_max: number;
		precio: number;
	}[];
}

export function useGetTarifas(tipoEntradaId?: string) {
	return useQuery({
		queryKey: ["admin", "tarifas", tipoEntradaId],
		queryFn: async () => {
			const url = tipoEntradaId
				? `/api/pases/tarifas/?tipo_entrada_id=${tipoEntradaId}`
				: "/api/pases/tarifas/";
			const { data } = await api.get<TarifaEntrada[]>(url);
			return data;
		},
	});
}

export function useTarifaActions() {
	const queryClient = useQueryClient();

	const createTarifa = useMutation({
		mutationFn: async (data: Partial<TarifaEntrada>) => {
			return api.post("/api/pases/tarifas/", data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "tarifas"] });
			toast.success("Tarifa creada exitosamente");
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || "Error al crear tarifa");
		},
	});

	const updateTarifa = useMutation({
		mutationFn: async ({
			id,
			...data
		}: Partial<TarifaEntrada> & { id: string }) => {
			return api.patch(`/api/pases/tarifas/${id}`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "tarifas"] });
			toast.success("Tarifa actualizada");
		},
		onError: (err: any) => {
			toast.error(err?.response?.data?.message || "Error al actualizar tarifa");
		},
	});

	const deleteTarifa = useMutation({
		mutationFn: async (id: string) => {
			return api.delete(`/api/pases/tarifas/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "tarifas"] });
			toast.success("Tarifa eliminada");
		},
	});

	return { createTarifa, updateTarifa, deleteTarifa };
}

export function useCategoriaActions() {
	const queryClient = useQueryClient();

	const createCategoria = useMutation({
		mutationFn: async (data: Partial<CategoriaEntrada>) => {
			return api.post("/api/pases/tipos/", data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "categorias-entrada"],
			});
			toast.success("Categoría creada");
		},
	});

	const updateCategoria = useMutation({
		mutationFn: async ({
			id,
			...data
		}: Partial<CategoriaEntrada> & { id: string }) => {
			return api.patch(`/api/pases/tipos/${id}`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "categorias-entrada"],
			});
			toast.success("Categoría actualizada");
		},
	});

	return { createCategoria, updateCategoria };
}
