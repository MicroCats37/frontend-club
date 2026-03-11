import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/config";
import { handleApiError } from "@/lib/api/error-handler";

const CONTACTOS_URL = "/api/usuarios/contactos/";
const FAMILIARES_URL = "/api/usuarios/familiares/";

export function useAddContacto() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			persona: { dni: string; nombres: string; apellidos: string };
			etiqueta?: string;
		}) => {
			const response = await api.post(CONTACTOS_URL, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			toast.success("Contacto agregado correctamente.");
		},
		onError: (error) => {
			toast.error(handleApiError(error));
		},
	});
}

export function useDeleteContacto() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (contactoId: string) => {
			await api.delete(`${CONTACTOS_URL}${contactoId}/`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			toast.success("Contacto eliminado.");
		},
		onError: (error) => {
			toast.error(handleApiError(error));
		},
	});
}

export function useConvertirAFamiliar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			contactoId,
			data,
			frontal,
			reverso,
		}: {
			contactoId: string;
			data: any;
			frontal: File;
			reverso: File;
		}) => {
			const formData = new FormData();
			formData.append(
				"data",
				JSON.stringify({ ...data, contacto_id: contactoId }),
			);

			// Front-end identifies these as file_<uuid> but the backend might expect specific names if using helper
			// However, the helper 'extract_and_hydrate_payload' maps files by key in 'data'
			// We need to be careful with the keys.

			formData.append("foto_frontal", frontal);
			formData.append("foto_reverso", reverso);

			const response = await api.post(
				`${FAMILIARES_URL}convertir-desde-contacto/`,
				formData,
				{
					headers: { "Content-Type": "multipart/form-data" },
				},
			);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			toast.success("Solicitud de ascenso enviada. Pendiente de aprobación.");
		},
		onError: (error) => {
			toast.error(handleApiError(error));
		},
	});
}

export function useBajaFamiliar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (familiarId: string) => {
			const response = await api.post(
				`${FAMILIARES_URL}${familiarId}/dar-de-baja/`,
			);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["mi-grupo"] });
			toast.success("Baja procesada.");
		},
		onError: (error) => {
			toast.error(handleApiError(error));
		},
	});
}
