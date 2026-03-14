import { useQueryClient } from "@tanstack/react-query";
import { useApiCreate } from "@/hooks/useApiCreate";
import { useApiDelete } from "@/hooks/useApiDelete";

const CONTACTOS_URL = "/api/usuarios/contactos/";
const FAMILIARES_URL = "/api/usuarios/familiares/";

export function useAddContacto() {
	const queryClient = useQueryClient();

	return useApiCreate({
		url: CONTACTOS_URL,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			},
		},
	});
}

export function useDeleteContacto() {
	const queryClient = useQueryClient();

	return useApiDelete({
		baseUrl: CONTACTOS_URL,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			},
		},
	});
}

export function useConvertirAFamiliar() {
	const queryClient = useQueryClient();

	return useApiCreate({
		url: `${FAMILIARES_URL}convertir-desde-contacto/`,
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			},
		},
	});
}

export function useBajaFamiliar() {
	const queryClient = useQueryClient();

	return useApiCreate({
		url: `${FAMILIARES_URL}dar-de-baja/`, // Note: Base useApiCreate uses POST
		options: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			},
		},
	});
}
