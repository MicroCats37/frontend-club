import { z } from "zod";

/**
 * Roles del sistema (Basado en RolSistema del Backend)
 */
export const RolSistema = {
	ADMIN: "ADMIN",
	PORTERO: "PORTERO",
	INGENIERO: "INGENIERO",
	CLIENTE: "CLIENTE",
} as const;

export type RolSistema = (typeof RolSistema)[keyof typeof RolSistema];

/**
 * Esquema base del usuario logueado
 */
export const LoggedUserSchema = z.object({
	id: z.string(),
	dni: z.string(),
	nombres: z.string(),
	apellidos: z.string(),
	user_type: z.enum(["ADMIN", "PORTERO", "INGENIERO", "CLIENTE"]),
	roles: z.array(z.string()),
	cip: z.string().nullable().optional(),
	privilegios: z.boolean().default(false),
	categoria: z.string().nullable().optional(),
});

export const UserBaseSchema = LoggedUserSchema;
export type LoggedUser = z.infer<typeof LoggedUserSchema>;
export type UserBase = LoggedUser;

export const ResumenUserSchema = z.object({
	full_name: z.string(),
	categoria: z.string().nullable(),
	privilegios: z.boolean(),
	es_cumpleanero: z.boolean().default(false),
	cupos_invitados_restantes: z.number().default(0),
	total_beneficiarios_activos: z.number().default(0),
	beneficiarios_limite: z.number().default(0),
	beneficiarios_disponibles: z.number().default(0),
	beneficiarios_usados: z.number().default(0),
	beneficiarios_label: z.string().optional(),
	proxima_visita: z.any().nullable(),
	user_type: z.string().optional(),
	roles: z.array(z.string()).optional(),
});

export type ResumenUser = z.infer<typeof ResumenUserSchema>;
