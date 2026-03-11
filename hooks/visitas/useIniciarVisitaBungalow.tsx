import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiCreate } from "@/hooks/useApiCreate";
import type { VisitaQuery } from "@/schemas/visita";

export function useIniciarVisitaBungalow() {
	const queryClient = useQueryClient();

	return useApiCreate<VisitaQuery, any>({
		url: "/api/control/visitas/registrar-bungalow",
		schema: z.any() as any,
		options: {
			onSuccess: (data) => {
				queryClient.invalidateQueries({ queryKey: ["user-resumen"] });
				queryClient.invalidateQueries({ queryKey: ["visitas"] });
				console.log("Visita (Bungalow) iniciada con éxito:", data);
			},
		},
	});
}
