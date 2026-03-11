import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";

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
	const actualizarPases = useMutation({
		mutationFn: async ({ id, payload }: { id?: string; payload: any }) => {
			const targetId = id || defaultVisitaId;
			const { data } = await api.patch(
				`/api/control/visitas/${targetId}/pases`,
				payload,
			);
			return data;
		},
		onSuccess: (_, variables) => {
			toast.success("Pases actualizados correctamente");
			invalidate(variables.id);
		},
		onError: (err) => toast.error(handleApiError(err)),
	});

	/**
	 * Actualiza una visita de bungalow (Delta CRUD: añadir ingresantes).
	 */
	const actualizarBungalow = useMutation({
		mutationFn: async ({ id, payload }: { id?: string; payload: any }) => {
			const targetId = id || defaultVisitaId;
			const { data } = await api.patch(
				`/api/control/visitas/${targetId}/bungalow`,
				payload,
			);
			return data;
		},
		onSuccess: (_, variables) => {
			toast.success("Lista de bungalow actualizada");
			invalidate(variables.id);
		},
		onError: (err) => toast.error(handleApiError(err)),
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
		onError: (err) => toast.error(handleApiError(err)),
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
		onError: (err) => toast.error(handleApiError(err)),
	});

	return {
		actualizarPases,
		actualizarBungalow,
		cancelarVisita,
		liquidarVisita,
	};
}
