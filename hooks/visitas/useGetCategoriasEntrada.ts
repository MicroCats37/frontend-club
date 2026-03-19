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

// Eliminamos la interfaz problemática para ver si es un conflicto externo
// export type PaginatedCategoriasResponse<T> = {
// 	results: T[];
// 	count: number;
// };

export function useGetCategoriasEntrada() {
	return useQuery<any>({
		queryKey: ["admin", "categorias-entrada"],
		queryFn: async () => {
			const res = await api.get("/api/pases/tipos/");
			return res.data;
		},
	});
}
