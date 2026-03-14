import { z } from "zod";

export const ReglaTarifaSchema = z.object({
	id: z.string().optional(),
	dias_semana: z.array(z.coerce.number()),
	precios_base: z.array(z.object({
		capacidad: z.number(),
		precio_con_privilegio: z.number(),
		precio_sin_privilegio: z.number(),
	})).optional(),
});

export type ReglaTarifa = z.infer<typeof ReglaTarifaSchema>;

export const TipoTarifaSchema = z.object({
	id: z.string(),
	nombre: z.string(),
	reglas: z.array(ReglaTarifaSchema).optional().default([]),
	es_temporal: z.boolean(),
	es_paquete: z.boolean(),
	activo: z.boolean(),
	fecha_inicio: z.string(),
	fecha_fin: z.string().nullable().optional(),
});

export type TipoTarifa = z.infer<typeof TipoTarifaSchema>;

export const PaginatedTipoTarifaSchema = z.object({
	count: z.number(),
	next: z.string().nullable().optional(),
	previous: z.string().nullable().optional(),
	results: z.array(TipoTarifaSchema),
});

export type PaginatedTipoTarifa = z.infer<typeof PaginatedTipoTarifaSchema>;
