import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/config";

export interface MiGrupoItem {
	persona: {
		id: string;
		dni: string;
		nombres: string;
		apellidos: string;
		nombre_completo: string;
		edad: number;
	};
	tipo: "TITULAR" | "FAMILIAR" | "CONTACTO";
	tiene_privilegios: boolean;
	vinculo: string | null;
	etiqueta: string | null;
}

export interface MiGrupoResponse {
	cupos_disponibles: number;
	grupo: MiGrupoItem[];
}

export const useGetMiGrupo = () => {
	return useQuery({
		queryKey: ["mi-grupo"],
		queryFn: async () => {
			const { data } = await api.get<MiGrupoResponse>(
				"/api/usuarios/mi-grupo/",
			);
			return data;
		},
	});
};
