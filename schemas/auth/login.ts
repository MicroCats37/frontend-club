import { z } from "zod";
import { UserBaseSchema } from "./user";

/**
 * Schema del formulario de login
 */
const BaseLoginSchema = z.object({
	password: z.string().min(1, "La contraseña es requerida"),
});

/**
 * Esquemas de Login específicos que coinciden con los campos del Backend.
 */
export const DniLoginSchema = BaseLoginSchema.extend({
	type: z.literal("DNI"),
	username: z
		.string()
		.length(8, "El DNI debe tener exactamente 8 dígitos")
		.regex(/^\d+$/, "El DNI solo debe contener números"),
});

export const CipLoginSchema = BaseLoginSchema.extend({
	type: z.literal("CIP"),
	cip: z
		.string()
		.min(6, "El CIP debe tener al menos 6 dígitos")
		.max(9, "El CIP no puede exceder los 9 dígitos")
		.regex(/^\d+$/, "El CIP solo debe contener números"),
});

/**
 * Unión discriminada para manejar ambos tipos de login de forma nativa.
 */
export const LoginFormSchema = z.discriminatedUnion("type", [
	DniLoginSchema,
	CipLoginSchema,
]);

export type LoginFormData = z.infer<typeof LoginFormSchema>;

/**
 * Respuesta del backend al hacer login satisfactorio
 */
export const LoginResponseSchema = z.object({
	access: z.string(),
	refresh: z.string(),
	user: UserBaseSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
