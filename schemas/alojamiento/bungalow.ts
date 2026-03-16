import { z } from "zod";

export const BungalowEstadoEnum = z.enum([
	"DISPONIBLE",
	"MANTENIMIENTO",
	"BLOQUEADO",
]);

export const BungalowImagenSchema = z.object({
	id: z.coerce.number(),
	imagen: z.string(),
	orden: z.coerce.number(),
});

export const TarifaBungalowSchema = z.object({
	id: z.coerce.number(),
	tipo_tarifa: z.coerce.number().nullable().optional(),
	precios_override: z.record(z.string(), z.any()).nullable().optional(),
	nombre_tipo: z.string().optional(),
	activo: z.boolean().optional(),
	// Legacy fields - Marked optional to prevent validation crashes
	con_privilegio: z.boolean().optional(),
	precio: z.coerce.number().optional(),
	fecha_fin: z.string().nullable().optional(),
	dias_semana: z.array(z.coerce.number()).optional(),
	dias_tarifa_id: z.string().optional(),
});

export const BungalowSchema = z.object({
	id: z.coerce.number(),
	numero: z.string(),
	nombre: z.string(),
	zona: z.string().nullable(),
	piso: z.coerce.number().nullable(),
	capacidad: z.coerce.number(),
	estado: BungalowEstadoEnum,
	descripcion: z.string().nullable().optional(),
	image_main: z.string().nullable(),
	imagenes: z.array(BungalowImagenSchema).optional(),
	tarifas: z.array(TarifaBungalowSchema).optional(),
});

export const PaginatedBungalowSchema = z.object({
	count: z.number(),
	next: z.string().nullable(),
	previous: z.string().nullable(),
	results: z.array(BungalowSchema),
});

export const BungalowUpdateSchema = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	numero: z.string().optional(),
	zona: z.string().nullish(),
	piso: z.number().nullish(),
	capacidad: z.number().min(1, "La capacidad debe ser al menos 1"),
	descripcion: z.string().nullish(),
	image_main: z.any().nullish(), // UUID o File object
});

export const BungalowEstadoUpdateSchema = z.object({
	estado: BungalowEstadoEnum,
	descripcion_estado: z.string().optional().nullable(),
});

export const BatchGaleriaItemSchema = z.object({
	action: z.enum(["CREATE", "UPDATE", "DELETE"]),
	id: z.number().optional(),
	file: z.any().optional(), // File object in browser
	descripcion: z.string().optional(),
});

export const BatchGaleriaUploadSchema = z.object({
	imagenes: z.array(BatchGaleriaItemSchema),
});

export const BungalowPriceDetailSchema = z.object({
	tipo_tarifa_id: z.string(),
	tipo_tarifa_nombre: z.string(),
	regla_idx: z.coerce.number(),
	precio_con_privilegio: z.coerce.number(),
	precio_sin_privilegio: z.coerce.number(),
	activo: z.boolean(),
	es_temporal: z.boolean(),
	es_paquete: z.boolean(),
	motor: z.string(),
});

export const BungalowPricingListSchema = z.object({
	id: z.coerce.number(),
	numero: z.string(),
	nombre: z.string(),
	zona: z.string(),
	capacidad: z.coerce.number(),
	precios: z.array(BungalowPriceDetailSchema),
});

export const NocheOcupadaSchema = z.object({
	fecha: z.string(),
	reserva_id: z.string(),
	titular_nombre: z.string(),
	estado_pago: z.string(),
	color_status: z.string(),
	es_continuacion: z.boolean().optional(),
});

export const BungalowOcupacionSchema = z.object({
	id: z.coerce.number(),
	numero: z.string(),
	nombre: z.string(),
	noches: z.array(NocheOcupadaSchema),
});

export type Bungalow = z.infer<typeof BungalowSchema>;
export type BungalowImagen = z.infer<typeof BungalowImagenSchema>;
export type TarifaBungalow = z.infer<typeof TarifaBungalowSchema>;
export type BungalowUpdate = z.infer<typeof BungalowUpdateSchema>;
export type BatchGaleriaItem = z.infer<typeof BatchGaleriaItemSchema>;
export type BungalowPricingList = z.infer<typeof BungalowPricingListSchema>;
export type NocheOcupada = z.infer<typeof NocheOcupadaSchema>;
export type BungalowOcupacion = z.infer<typeof BungalowOcupacionSchema>;
