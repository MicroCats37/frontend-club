import { useApiQuery } from "@/hooks/useApiQuery";
import { type VisitaList, VisitaListSchema } from "@/schemas/visita";

export function useGetVisitas(params?: {
	page?: number;
	page_size?: number;
	estado?: string;
}) {
	return useApiQuery<VisitaList>({
		queryKey: ["visitas"],
		url: "/api/control/visitas/",
		params,
		schema: VisitaListSchema,
	});
}
