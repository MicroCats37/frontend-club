import type { z } from "zod";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
	GrupoFamiliarResponseSchema,
	type RelatedPersonSchema,
} from "@/schemas/visita";

export type RelatedPerson = z.infer<typeof RelatedPersonSchema>;
export type GrupoFamiliarResponse = z.infer<typeof GrupoFamiliarResponseSchema>;

export function useGetGrupoFamiliar() {
	return useApiQuery<GrupoFamiliarResponse>({
		queryKey: ["grupo-familiar"],
		url: "/api/usuarios/mi-grupo/",
		schema: GrupoFamiliarResponseSchema,
		queryOptions: {
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
		},
	});
}
