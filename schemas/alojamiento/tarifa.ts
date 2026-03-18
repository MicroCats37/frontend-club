import { z } from "zod";

export const ReglaTarifaSchema = z.object({
	id: z.string().optional(),
	nombre: z.string(),
	motor: z.enum(["FECHAS_PUNTUALES", "RANGO", "DIAS_SEMANA"]),
	config: z.object({
		fechas: z.array(z.string()).nullish(),
		desde: z.string().nullish(),
		hasta: z.string().nullish(),
		dias: z.array(z.number()).nullish(),
	}),
	es_paquete_obligatorio: z.boolean().default(false),
	precios_capacidad: z
		.array(
			z.object({
				capacidad: z.number(),
				precios: z.object({
					noche_con_priv: z.number().nullable().optional(),
					noche_sin_priv: z.number().nullable().optional(),
					paquete_con_priv: z.number().nullable().optional(),
					paquete_sin_priv: z.number().nullable().optional(),
				}),
			}),
		)
		.default([]),
});

export type ReglaTarifa = z.infer<typeof ReglaTarifaSchema>;

export const TipoTarifaSchema = z.object({
	id: z.string(),
	nombre: z.string(),
	descripcion: z.string().nullable().optional(),
	reglas: z.array(ReglaTarifaSchema).optional().default([]),
	es_temporal: z.boolean(),
	activo: z.boolean(),
	fecha_inicio: z.string(),
	fecha_fin: z.string().nullable().optional(),
	image_main: z.string().nullable().optional(),
});

export const TipoTarifaInputSchema = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	activo: z.boolean().default(true),
	image_main: z.any().nullish(),
	reglas: z.array(ReglaTarifaSchema).optional().default([]),
});

export type TipoTarifa = z.infer<typeof TipoTarifaSchema>;
export type TipoTarifaInput = z.infer<typeof TipoTarifaInputSchema>;

export const PaginatedTipoTarifaSchema = z.object({
	count: z.number(),
	next: z.string().nullable().optional(),
	previous: z.string().nullable().optional(),
	results: z.array(TipoTarifaSchema),
});

export type PaginatedTipoTarifa = z.infer<typeof PaginatedTipoTarifaSchema>;
