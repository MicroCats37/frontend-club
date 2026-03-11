import { useApiQuery } from "@/hooks/useApiQuery";
import { type ResumenUser, ResumenUserSchema } from "@/schemas/auth/user";

export function useResumen() {
	return useApiQuery<ResumenUser>({
		queryKey: ["auth-resumen"],
		url: "/api/auth/me/resumen/",
		schema: ResumenUserSchema,
		queryOptions: {
			staleTime: 1000 * 60 * 5, // 5 minutos
		},
	});
}
