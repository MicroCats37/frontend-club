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
	dni: z
		.string()
		.min(1, "El DNI es requerido")
		.refine((val) => /^\d{8}$/.test(val), {
			message: "El DNI debe tener exactamente 8 números",
		}),
});

export const CipLoginSchema = BaseLoginSchema.extend({
	type: z.literal("CIP"),
	cip: z
		.string()
		.min(1, "El CIP es requerido")
		.refine((val) => /^\d{4,9}$/.test(val), {
			message: "El CIP debe ser un número entre 4 y 9 dígitos",
		}),
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
