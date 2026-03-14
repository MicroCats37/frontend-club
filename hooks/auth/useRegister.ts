"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApiCreate } from "@/hooks/useApiCreate";
import { setAuthCookies } from "@/lib/auth/actions";
import {
	type RegisterResponse,
	RegisterResponseSchema,
	type ValidateCIPData,
	ValidateCIPResponseSchema,
	type ValidateCodeData,
} from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Paso 1: Validar CIP y enviar código
 */
export const useValidateCIP = () => {
	return useApiCreate<any, ValidateCIPData>({
		url: "/api/auth/validate-cip/",
		schema: ValidateCIPResponseSchema,
		options: {
			onSuccess: (_data) => {
				toast.success("CIP validado exitosamente");
			},
		},
	});
};

/**
 * Paso 2: Validar Código de Verificación
 */
export const useValidateCode = () => {
	return useApiCreate<any, ValidateCodeData>({
		url: "/api/auth/validate-code/",
	});
};

/**
 * Paso 3: Registro Final y Generación de Contraseña
 */
export const useRegisterFinal = () => {
	const router = useRouter();
	const _logoutStore = useAuthStore((state) => state.logout);
	const loginAction = useAuthStore((state) => state.login);

	return useApiCreate<RegisterResponse, any>({
		url: "/api/auth/register/",
		schema: RegisterResponseSchema,
		options: {
			onSuccess: async (data) => {
				const userData = {
					...data.user,
					full_name: `${data.user.nombres} ${data.user.apellidos}`,
				};

				// Guardar en Zustand con token
				loginAction(userData, data.access);

				// Guardar en Cookies
				await setAuthCookies(data.access, data.refresh, userData as any);

				toast.success("¡Cuenta activada exitosamente!");

				// Redirigir al panel principal según el rol
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
