"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/config";

export interface CategoriaEntrada {
	id: string;
	nombre: string;
	descripcion?: string;
	con_derecho_bungalow: boolean;
	activo: boolean;
}

export function useGetCategoriasEntrada() {
	return useQuery({
		queryKey: ["admin", "categorias-entrada"],
		queryFn: async () => {
			const { data } = await api.get<CategoriaEntrada[]>(
				"/api/pases/admin/categorias/",
			);
			return data;
		},
	});
}
