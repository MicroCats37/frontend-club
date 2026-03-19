"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { getErrorMessage, handleApiError } from "@/lib/api/error-handler";

interface UpdateVisitaPasesPayload {
	fecha_inicio?: string;
	fecha_fin?: string;
	add: {
		persona_id: string;
		tipo_entrada_id: string;
		con_cupon: boolean;
	}[];
	delete: string[];
	update: {
		ingresante_id: string;
		tipo_entrada_id?: string;
		con_cupon?: boolean;
	}[];
}

interface UpdateVisitaBungalowPayload {
	add: {
		persona_id: string;
		tipo_entrada_id: string;
		con_cupon: boolean;
	}[];
	delete: string[];
	update: {
		ingresante_id: string;
		con_cupon?: boolean;
	}[];
}

export function useUpdateVisitaPases(visitaId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateVisitaPasesPayload) => {
			const { data } = await api.patch(
				`/api/control/visitas/${visitaId}/pases`,
				payload,
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visita", visitaId] });
			toast.success("Lista de invitados actualizada correctamente");
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}

export function useUpdateVisitaBungalow(visitaId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateVisitaBungalowPayload) => {
			const { data } = await api.patch(
				`/api/control/visitas/${visitaId}/pases-bungalows`,
				payload,
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["visita", visitaId] });
			toast.success("Lista de invitados (Bungalow) actualizada correctamente");
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}
