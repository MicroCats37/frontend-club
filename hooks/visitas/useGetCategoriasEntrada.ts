"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/config";

export interface CategoriaEntrada {
	id: string;
	nombre: string;
	descripcion?: string;
	activo: boolean;
	image_main?: string | null;
}

export interface PaginatedResponse<T> {
	results: T[];
	count: number;
}

export function useGetCategoriasEntrada() {
	return useQuery({
		queryKey: ["admin", "categorias-entrada"],
		queryFn: async () => {
			const { data } =
				await api.get<PaginatedResponse<CategoriaEntrada>>("/api/pases/tipos/");
			return data;
		},
	});
}
