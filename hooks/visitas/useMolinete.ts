import { toast } from "sonner";
import { useApiCreate } from "@/hooks/useApiCreate";
import { useApiQuery } from "@/hooks/useApiQuery";
import { z } from "zod";

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
	return useApiQuery<IngresanteMolinete | null>({
		queryKey: ["molinete-search", dni],
		url: dni.length >= 8 ? "/api/control/molinete/search" : null,
		params: { dni },
		schema: z.any(), // Since original didn't have a rigid schema, using z.any()
		queryOptions: {
			enabled: dni.length >= 8,
		},
	});
}

export function useMolineteActions() {
	const checkIn = useApiCreate({
		url: "/api/control/molinete/check-in",
		options: {
			onSuccess: (data: any) => {
				if (data.success) {
					toast.success(data.motivo);
				} else {
					toast.error(data.motivo);
				}
			},
		},
	});

	const checkOut = useApiCreate({
		url: "/api/control/molinete/check-out",
		options: {
			onSuccess: (data: any) => {
				if (data.success) {
					toast.success(data.motivo);
				} else {
					toast.error(data.motivo);
				}
			},
		},
	});

	return { checkIn, checkOut };
}
