import { format } from "date-fns";
import { useApiQuery } from "@/hooks/useApiQuery";
import { type PricingPerson, PricingPersonListSchema } from "@/schemas/visita";

export function useGetPersonasConPrecios(
	fecha: Date | null,
	tipoPaseId?: string | null,
	esBungalow?: boolean,
) {
	const enabled = !!fecha;
	const paramsMap = new URLSearchParams();
	if (fecha) paramsMap.set("fecha", format(fecha, "yyyy-MM-dd"));
	if (tipoPaseId) paramsMap.set("tipo_pase_id", tipoPaseId);
	if (esBungalow) paramsMap.set("es_bungalow", "true");

	const params = paramsMap.toString() ? `?${paramsMap.toString()}` : "";

	return useApiQuery<PricingPerson[]>({
		queryKey: ["personas-con-precios", params],
		url: enabled ? `/api/visitas/personas-con-precios/${params}` : null,
		schema: PricingPersonListSchema,
		queryOptions: {
			enabled,
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
		},
	});
}
