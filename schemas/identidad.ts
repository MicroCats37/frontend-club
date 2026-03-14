import { z } from "zod";

export const PrivilegioDetalleSchema = z.object({
	origen: z.string(),
	nombre_origen: z.string(),
	fecha_inicio: z.string(),
	fecha_fin: z.string().nullable(),
	activo: z.boolean(),
	notas: z.string().nullable().optional(),
});

export const PerfilValidacionSchema = z.object({
	cip: z.string(),
	categoria: z.string(),
	nombre_categoria: z.string(),
	deuda: z.boolean(),
	ultimo_periodo_pagado: z.string().nullable().optional(),
});

export const VinculoValidacionSchema = z.object({
	id: z.string(),
	titular_nombre: z.string(),
	titular_dni: z.string(),
	parentesco: z.string(),
	nombre_parentesco: z.string(),
	estado: z.string(),
	nombre_estado: z.string(),
});

export const PersonaValidacionSchema = z.object({
	persona: z.object({
		id: z.string(),
		dni: z.string(),
		nombres: z.string(),
		apellidos: z.string(),
		nombre_completo: z.string(),
		fecha_nacimiento: z.string(),
		genero: z.string(),
	}),
	usuario: z.any().nullable(),
	perfil: PerfilValidacionSchema.nullable(),
	privilegios: z.array(PrivilegioDetalleSchema),
	vinculos_como_familiar: z.array(VinculoValidacionSchema),
	es_valido: z.boolean(),
	mensaje_error: z.string().nullable().optional(),
});

export type PersonaValidacion = z.infer<typeof PersonaValidacionSchema>;

export const PrivilegioSimpleSchema = z.object({
	origen: z.string(),
	nombre_origen: z.string(),
	activo: z.boolean(),
});

export const ValidacionListaItemSchema = z.object({
	id: z.string(),
	persona: z.object({
		id: z.string(),
		dni: z.string(),
		nombre_completo: z.string(),
	}),
	estado: z.string(),
	nombre_estado: z.string(),
	dni_foto_frontal: z.string().nullable(),
	dni_foto_reverso: z.string().nullable(),
	privilegios: z.array(PrivilegioSimpleSchema),
	vinculos: z.array(VinculoValidacionSchema).optional(),
	es_familiar: z.boolean().optional(),
	es_contacto: z.boolean().optional(),
	motivo_rechazo: z.string().nullable().optional(),
	created_at: z.string(),
});

export const PaginatedValidacionSchema = z.object({
	items: z.array(ValidacionListaItemSchema),
	count: z.number(),
});

export type ValidacionListaItem = z.infer<typeof ValidacionListaItemSchema>;
export type PaginatedValidacion = z.infer<typeof PaginatedValidacionSchema>;
export type PrivilegioSimple = z.infer<typeof PrivilegioSimpleSchema>;
