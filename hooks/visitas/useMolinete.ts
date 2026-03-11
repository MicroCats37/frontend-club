import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";

export interface IngresanteMolinete {
	ingresante_id: string;
	persona_id: string;
	dni: string;
	nombre_completo: string;
	tipo_entrada: string;
	saldo_pendiente: number;
	estado_actual: "PENDIENTE" | "EN_CLUB" | "RETIRADO" | "RE_INGRESO";
	puede_ingresar: boolean;
	puede_salir: boolean;
	mensaje_restriccion?: string;
}

export function useMolineteSearch(dni: string) {
	return useQuery<IngresanteMolinete | null>({
		queryKey: ["molinete-search", dni],
		queryFn: async () => {
			if (!dni || dni.length < 8) return null;
			const response = await api.get(`/api/control/molinete/search?dni=${dni}`);
			return response.data;
		},
		enabled: dni.length >= 8,
	});
}

export function useMolineteActions() {
	const checkIn = useMutation({
		mutationFn: async ({
			persona_id,
			puerta = "PRINCIPAL",
		}: {
			persona_id: string;
			puerta?: string;
		}) => {
			const response = await api.post("/api/control/molinete/check-in", {
				persona_id,
				puerta,
			});
			return response.data;
		},
		onSuccess: (data) => {
			if (data.success) {
				toast.success(data.motivo);
			} else {
				toast.error(data.motivo);
			}
		},
		onError: (error) => handleApiError(error),
	});

	const checkOut = useMutation({
		mutationFn: async ({
			persona_id,
			puerta = "PRINCIPAL",
		}: {
			persona_id: string;
			puerta?: string;
		}) => {
			const response = await api.post("/api/control/molinete/check-out", {
				persona_id,
				puerta,
			});
			return response.data;
		},
		onSuccess: (data) => {
			if (data.success) {
				toast.success(data.motivo);
			} else {
				toast.error(data.motivo);
			}
		},
		onError: (error) => handleApiError(error),
	});

	return { checkIn, checkOut };
}
