import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";

export interface CotizacionIngresante {
	persona_id: string;
	tipo_entrada_id: string;
	con_cupon: boolean;
}

export interface CotizacionRequest {
	fecha_inicio: string;
	fecha_fin: string;
	ingresantes: CotizacionIngresante[];
}

export interface PersonaCotizada {
	persona_id: string;
	nombre_completo: string;
	precio_unitario: number;
	total_persona: number;
	usa_cupon: boolean;
}

export interface CotizacionResponse {
	total: number;
	desglose: PersonaCotizada[];
}

export function useCotizarVisita() {
	return useMutation({
		mutationFn: async (payload: CotizacionRequest) => {
			const { data } = await api.post<CotizacionResponse>(
				"/api/control/visitas/cotizar",
				payload,
			);
			return data;
		},
		onError: (err) => {
			console.error("Error al cotizar:", err);
			// No mostramos toast aquí para evitar ruido si es un cambio rápido en el UI
		},
	});
}

export function useRegistrarPaseDiario() {
	return useMutation({
		mutationFn: async (payload: any) => {
			const { data } = await api.post(
				"/api/control/visitas/registrar-pases",
				payload,
			);
			return data;
		},
		onSuccess: () => {
			toast.success("Visita registrada correctamente");
		},
		onError: (err) => toast.error(handleApiError(err)),
	});
}

export function useRegistrarBungalow() {
	return useMutation({
		mutationFn: async (payload: any) => {
			const { data } = await api.post(
				"/api/control/visitas/registrar-bungalow",
				payload,
			);
			return data;
		},
		onSuccess: () => {
			toast.success("Reserva de bungalow registrada correctamente");
		},
		onError: (err) => toast.error(handleApiError(err)),
	});
}
