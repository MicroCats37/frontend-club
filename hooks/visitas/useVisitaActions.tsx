import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiUpdate } from "@/hooks/useApiUpdate";
import api from "@/lib/api/config";
import { getErrorMessage, handleApiError } from "@/lib/api/error-handler";

export function useVisitaActions(defaultVisitaId?: string) {
	const queryClient = useQueryClient();

	const invalidate = (id?: string) => {
		queryClient.invalidateQueries({ queryKey: ["user-resumen"] });
		queryClient.invalidateQueries({ queryKey: ["visitas"] });
		const targetId = id || defaultVisitaId;
		if (targetId) {
			queryClient.invalidateQueries({ queryKey: ["visita", targetId] });
		}
	};

	/**
	 * Actualiza una visita de pases diarios (Delta CRUD: add, delete, update).
	 */
	const actualizarPases = useApiUpdate({
		baseUrl: "/api/control/visitas",
		method: "PATCH",
		options: {
			onSuccess: (_data, variables) => {
				toast.success("Pases actualizados correctamente");
				// Note: variables.id here will be something like "123/pases"
				// We extract the ID part for invalidation
				const realId = (variables.id as string).split("/")[0];
				invalidate(realId);
			},
		},
	});

	/**
	 * Actualiza una visita de bungalow (Delta CRUD: añadir ingresantes).
	 */
	const actualizarBungalow = useApiUpdate({
		baseUrl: "/api/control/visitas",
		method: "PATCH",
		options: {
			onSuccess: (_data, variables) => {
				toast.success("Lista de bungalow actualizada");
				const realId = (variables.id as string).split("/")[0];
				invalidate(realId);
			},
		},
	});

	/**
	 * Anulación TOTAL de la visita (Bungalow y/o Pases).
	 */
	const cancelarVisita = useMutation({
		mutationFn: async (id?: string) => {
			const targetId = id || defaultVisitaId;
			const { data } = await api.post(
				`/api/control/visitas/${targetId}/cancelar`,
			);
			return data;
		},
		onSuccess: (_, id) => {
			toast.success("Visita cancelada con éxito");
			invalidate(id);
		},
		onError: (err) => toast.error(getErrorMessage(err)),
	});

	/**
	 * Finalización de la estadía (Checkout).
	 */
	const liquidarVisita = useMutation({
		mutationFn: async (id?: string) => {
			const targetId = id || defaultVisitaId;
			const { data } = await api.post(
				`/api/control/visitas/${targetId}/liquidar`,
			);
			return data;
		},
		onSuccess: (_, id) => {
			toast.success("Estadía liquidada (Checkout finalizado)");
			invalidate(id);
		},
		onError: (err) => toast.error(getErrorMessage(err)),
	});

	return {
		actualizarPases,
		actualizarBungalow,
		cancelarVisita,
		liquidarVisita,
	};
}
