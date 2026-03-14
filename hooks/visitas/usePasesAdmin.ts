"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiCreate } from "@/hooks/useApiCreate";
import { useApiUpdate } from "@/hooks/useApiUpdate";
import { useApiDelete } from "@/hooks/useApiDelete";
import { z } from "zod";
import type { CategoriaEntrada, PaginatedResponse } from "./useGetCategoriasEntrada";

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

export interface CategoriaTarifaMatriz {
	categoria: string;
	nombre_categoria: string;
	tarifa_id: string | null;
	precios_rango_edad: {
		edad_min: number;
		edad_max: number;
		precio: number;
	}[];
}

export interface TipoEntradaMatriz {
	tipo_entrada_id: string;
	tipo_entrada_nombre: string;
	categorias: CategoriaTarifaMatriz[];
}


export function useGetTarifas(tipoEntradaId?: string) {
	return useApiQuery<PaginatedResponse<TarifaEntrada>>({
		queryKey: ["admin", "tarifas", tipoEntradaId],
		url: "/api/pases/tarifas/",
		params: tipoEntradaId ? { tipo_entrada_id: tipoEntradaId } : {},
		schema: z.any(),
	});
}

export function useGetMatrixTarifas() {
	return useApiQuery<TipoEntradaMatriz[]>({
		queryKey: ["admin", "tarifas-matriz"],
		url: "/api/pases/tarifas/matriz/",
		schema: z.array(z.any()),
	});
}

export function useMatrixUpdate(tipoId: string) {
	const queryClient = useQueryClient();
	return useApiCreate({
		url: `/api/pases/tarifas/matriz/${tipoId}/`,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["admin", "tarifas-matriz"] });
				toast.success("Tarifas actualizadas correctamente");
			},
		},
	});
}

export function useTarifaActions() {
	const queryClient = useQueryClient();

	const createTarifa = useApiCreate({
		url: "/api/pases/tarifas/",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["admin", "tarifas"] });
				toast.success("Tarifa creada exitosamente");
			},
		},
	});

	const updateTarifa = useApiUpdate({
		baseUrl: "/api/pases/tarifas",
		method: "PATCH",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["admin", "tarifas"] });
				toast.success("Tarifa actualizada");
			},
		},
	});

	const deleteTarifa = useApiDelete({
		baseUrl: "/api/pases/tarifas",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["admin", "tarifas"] });
				toast.success("Tarifa eliminada");
			},
		},
	});

	return { createTarifa, updateTarifa, deleteTarifa };
}

export function useCategoriaActions() {
	const queryClient = useQueryClient();

	const createCategoria = useApiCreate({
		url: "/api/pases/tipos/",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["admin", "categorias-entrada"],
				});
				toast.success("Categoría creada");
			},
		},
	});

	const updateCategoria = useApiUpdate({
		baseUrl: "/api/pases/tipos",
		method: "PATCH",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: ["admin", "categorias-entrada"],
				});
				toast.success("Categoría actualizada");
			},
		},
	});

	return { createCategoria, updateCategoria };
}
