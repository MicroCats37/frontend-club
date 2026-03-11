import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/config";
import type { TipoPase } from "@/schemas/visita";

export function useGetTiposPases() {
	return useQuery<TipoPase[]>({
		queryKey: ["tipos-pases"],
		queryFn: async () => {
			const { data } = await api.get<any>("/api/pases/tipos/");
			// Ninja ModelControllerBase puede devolver { items: [], count: n } si está paginado
			// O una lista plana si no lo está.
			const items = Array.isArray(data)
				? data
				: data.items || data.results || [];
			return items;
		},
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
}
