import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiCreate } from "@/hooks/useApiCreate";
import { useApiDelete } from "@/hooks/useApiDelete";
import api from "@/lib/api/config";
import { buildApiPayload } from "@/utils/payload/format";

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

export function useAddFamiliar() {
	const queryClient = useQueryClient();

	return useApiCreate({
		url: FAMILIARES_URL,
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
		url: `${FAMILIARES_URL}convertir-contacto`,
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

export function useSolicitarBeneficio() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
			const payload = buildApiPayload(data);
			const { data: response } = await api.post(
				`${FAMILIARES_URL}solicitar-beneficiario/${id}`,
				payload,
			);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
		},
	});
}

export function useVincularPorDni() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			dni: string;
			tipo: "FAMILIAR" | "CONTACTO";
			vinculo?: string;
			etiqueta?: string;
		}) => {
			const { data: response } = await api.post(
				"/api/usuarios/mi-grupo/vincular-dni",
				data,
			);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
		},
	});
}

export function useBuscarPersona() {
	return useMutation({
		mutationFn: async (dni: string) => {
			const { data: response } = await api.get<{
				encontrado: boolean;
				nombres: string;
				apellidos: string;
				ya_en_grupo: boolean;
				es_titular: boolean;
				tiene_privilegios_independientes: boolean;
			}>(`/api/usuarios/mi-grupo/buscar-persona/${dni}`);
			return response;
		},
	});
}
