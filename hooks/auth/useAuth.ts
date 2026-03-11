"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiCreate } from "@/hooks/useApiCreate";

import { setAuthCookies } from "@/lib/auth/actions";
import { type LoginResponse, LoginResponseSchema } from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Hook personalizado para manejar el inicio de sesión
 */
export const useLogin = () => {
	const router = useRouter();
	const loginStore = useAuthStore((state) => state.login);

	return useApiCreate<LoginResponse, any>({
		// Use any for TBody here to allow transformation
		url: "/api/auth/login/",
		schema: LoginResponseSchema,
		options: {
			onSuccess: async (data) => {
				// 1. Datos formateados para el store
				const userData = {
					...data.user,
					full_name: `${data.user.nombres} ${data.user.apellidos}`,
				};

				// 2. Guardar en Zustand (Cliente) con token
				loginStore(userData, data.access);

				// 3. Guardar en Cookies seguras (Servidor via Action)
				await setAuthCookies(data.access, data.refresh, userData as any);

				toast.success(`¡Bienvenido, ${data.user.nombres}!`);

				// 4. Redirigir al panel principal según el rol
				if (
					data.user.user_type === "ADMIN" ||
					data.user.user_type === "PORTERO"
				) {
					router.push("/admin");
				} else {
					router.push("/inicio");
				}
			},
		},
	});
};
