import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { getErrorMessage, handleApiError } from "@/lib/api/error-handler";

export interface PagoManualPayload {
	orden_id: string;
	monto: number;
	metodo: "EFECTIVO" | "TRANSFERENCIA" | "YAPE" | "PLIN" | "OTRO";
	referencia: string;
}

export function usePagoActions() {
	const queryClient = useQueryClient();

	const registrarPagoManual = useMutation({
		mutationFn: async (payload: PagoManualPayload) => {
			const { data } = await api.post(
				"/api/finanzas/pagos/confirmar-manual",
				payload,
			);
			return data;
		},
		onSuccess: () => {
			toast.success("Pago registrado correctamente");
			// Invalidar consultas relacionadas con finanzas y visitas
			queryClient.invalidateQueries({ queryKey: ["visitas"] });
			queryClient.invalidateQueries({ queryKey: ["visita"] });
		},
		onError: (err) => {
			toast.error(getErrorMessage(err));
		},
	});

	return {
		registrarPagoManual,
	};
}
