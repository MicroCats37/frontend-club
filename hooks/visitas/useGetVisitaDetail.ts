import { useApiQuery } from "@/hooks/useApiQuery";
import { type VisitaQuery, VisitaQuerySchema } from "@/schemas/visita";

export function useGetVisitaDetail(id: string) {
	return useApiQuery<VisitaQuery>({
		queryKey: ["visita", id],
		url: `/api/control/visitas/${id}`,
		schema: VisitaQuerySchema,
		queryOptions: {
			enabled: !!id,
		},
	});
}
