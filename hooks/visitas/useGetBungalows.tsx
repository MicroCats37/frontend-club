import { format } from "date-fns";
import { z } from "zod";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
	type BungalowDisponible,
	BungalowDisponibleSchema,
} from "@/schemas/visita";

export function useGetBungalows(
	fechaInicio: Date | string | null,
	fechaFin: Date | string | null,
) {
	const start = fechaInicio ? new Date(fechaInicio) : null;
	const end = fechaFin ? new Date(fechaFin) : null;

	const enabled = !!start && !!end && start.getTime() < end.getTime();

	const params = enabled
		? `?fecha_llegada=${format(start!, "yyyy-MM-dd")}&fecha_salida=${format(end!, "yyyy-MM-dd")}`
		: "";

	return useApiQuery<BungalowDisponible[]>({
		queryKey: ["bungalos", "disponibles", params],
		url: enabled ? `/api/alojamiento/bungalows/disponibilidad/${params}` : null,
		schema: z.array(BungalowDisponibleSchema),
		queryOptions: {
			enabled,
			staleTime: 1000 * 60 * 5,
		},
	});
}
