import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/config";
import type { Visita, VisitaList } from "@/schemas/visita";

export const useGetMisVisitas = (
	page = 1,
	pageSize = 10,
	filters: { estado?: string; fecha?: string } = {},
) => {
	return useQuery({
		queryKey: ["mis-visitas", page, pageSize, filters],
		queryFn: async () => {
			const { data } = await api.get<VisitaList>(
				"/api/control/visitas/mis-visitas",
				{
					params: {
						page,
						page_size: pageSize,
						estado: filters.estado,
						fecha: filters.fecha,
					},
				},
			);
			return data;
		},
	});
};
