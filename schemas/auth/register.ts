import { z } from "zod";
import { LoginResponseSchema } from "./login";

// ==========================================
// PASO 1: VALIDAR CIP
// ==========================================
export const ValidateCIPSchema = z.object({
	cip: z
		.string()
		.min(1, "El CIP es requerido")
		.regex(/^\d+$/, "El CIP debe contener solo números"),
});

export type ValidateCIPData = z.infer<typeof ValidateCIPSchema>;

export const ValidateCIPResponseSchema = z.object({
	detail: z.string(),
	masked_contact: z.string(),
	debug_code: z.string().optional(), // Solo desarrollo
});

// ==========================================
// PASO 2: VALIDAR CÓDIGO (SMS/Email)
// ==========================================

// Schema base (sin CIP)
export const ValidateCodeFormSchema = z.object({
	code: z
		.string()
		.min(6, "El código debe tener 6 dígitos")
		.max(6, "El código debe tener 6 dígitos"),
});

// Schema completo (con CIP para el API)
export const ValidateCodeSchema = ValidateCodeFormSchema.extend({
	cip: z.string(),
});

export type ValidateCodeData = z.infer<typeof ValidateCodeSchema>;
export type ValidateCodeFormData = z.infer<typeof ValidateCodeFormSchema>;

// ==========================================
// PASO 3: REGISTRO FINAL (Set Password)
// ==========================================

// Schema del formulario (sin CIP, con validación de contraseñas)
export const RegisterPasswordFormSchema = z
	.object({
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		password_confirm: z.string(),
	})
	.refine((data) => data.password === data.password_confirm, {
		message: "Las contraseñas no coinciden",
		path: ["password_confirm"],
	});

export type RegisterPasswordFormData = z.infer<
	typeof RegisterPasswordFormSchema
>;

// Schema completo para el API (con CIP, sin refinement)
export const RegisterUserSchema = z.object({
	cip: z.string(),
	password: z.string().min(8),
	password_confirm: z.string(),
});

export type RegisterUserData = z.infer<typeof RegisterUserSchema>;

/**
 * La respuesta del registro final retorna mensaje, usuario y tokens (como un login)
 */
export const RegisterResponseSchema = z.object({
	message: z.string(),
	user: LoginResponseSchema.shape.user,
	tokens: z.object({
		access: z.string(),
		refresh: z.string(),
	}),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
