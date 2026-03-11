import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/config";
import type { Visita } from "@/schemas/visita";

export const useGetMisVisitas = () => {
	return useQuery({
		queryKey: ["mis-visitas"],
		queryFn: async () => {
			const { data } = await api.get<Visita[]>(
				"/api/control/visitas/mis-visitas",
			);
			return data;
		},
	});
};
