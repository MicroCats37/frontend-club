import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiCreate } from "@/hooks/useApiCreate";
import { useApiDelete } from "@/hooks/useApiDelete";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiUpdate } from "@/hooks/useApiUpdate";
import {
	type Feriado,
	FeriadoSchema,
	PaginatedFeriadoSchema,
} from "@/schemas/alojamiento/feriado";

const FERIADOS_URL = "/api/alojamiento/feriados";

export const useFeriados = () => {
	return useApiQuery({
		queryKey: ["feriados"],
		url: `${FERIADOS_URL}/`,
		schema: z.union([PaginatedFeriadoSchema, z.array(FeriadoSchema)]),
		queryOptions: {
			select: (parsed) => {
				return Array.isArray(parsed) ? parsed : (parsed.results as Feriado[]);
			},
		},
	});
};

export const useCreateFeriado = () => {
	const queryClient = useQueryClient();
	return useApiCreate({
		url: `${FERIADOS_URL}/`,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["feriados"] });
			},
		},
	});
};

export const useUpdateFeriado = () => {
	const queryClient = useQueryClient();
	return useApiUpdate({
		baseUrl: FERIADOS_URL,
		method: "PATCH",
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["feriados"] });
			},
		},
	});
};

export const useDeleteFeriado = () => {
	const queryClient = useQueryClient();
	return useApiDelete({
		baseUrl: FERIADOS_URL,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["feriados"] });
			},
		},
	});
};
