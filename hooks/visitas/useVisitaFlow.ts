import { toast } from "sonner";
import { useApiCreate } from "@/hooks/useApiCreate";
import { z } from "zod";

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
	return useApiCreate<CotizacionResponse, CotizacionRequest>({
		url: "/api/control/visitas/cotizar",
		options: {
			onError: (err) => {
				console.error("Error al cotizar:", err);
				// Custom hooks show toast by default, but useVisitaFlow original had a comment:
				// "No mostramos toast aquí para evitar ruido si es un cambio rápido en el UI"
				// Note: current useApiCreate ALWAYS shows toast on catch. 
			},
		},
	});
}

export function useRegistrarPaseDiario() {
	return useApiCreate({
		url: "/api/control/visitas/registrar-pases",
		options: {
			onSuccess: () => {
				toast.success("Visita registrada correctamente");
			},
		},
	});
}

export function useRegistrarBungalow() {
	return useApiCreate({
		url: "/api/control/visitas/registrar-bungalow",
		options: {
			onSuccess: () => {
				toast.success("Reserva de bungalow registrada correctamente");
			},
		},
	});
}
