import { z } from "zod";

// --- Enums ---
export const VisitaEstadoEnum = z.enum([
	"PENDIENTE",
	"PAGADA",
	"CONFIRMADA",
	"EN_CURSO",
	"FINALIZADA",
	"CANCELADA",
]);

// --- Base Schemas ---
export const PagoSchema = z.object({
	id: z.string().uuid(),
	monto: z.union([z.number(), z.string()]),
	metodo: z.string(),
	referencia: z.string(),
	created_at: z.string(),
	metadatos: z.any().optional(),
});

export const OrdenCobroSchema = z.object({
	id: z.string().uuid(),
	monto_total: z.union([z.number(), z.string()]),
	saldo_pendiente: z.union([z.number(), z.string()]),
	esta_pagada: z.boolean(),
	estado: z.string(),
	fecha_limite_pago: z.string().nullable().optional(),
	pagos: z.array(PagoSchema).optional().default([]),
});

export const PersonaDetalleSchema = z.object({
	id: z.string().uuid(),
	dni: z.string(),
	nombres: z.string(),
	apellidos: z.string(),
	nombre_completo: z.string(),
	edad: z.number().nullable().optional(),
});

export const TipoPaseSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string(),
	descripcion: z.string().optional(),
});

export const IngresanteSchema = z.object({
	id: z.string().uuid(),
	persona: PersonaDetalleSchema,
	tipo_entrada: TipoPaseSchema.nullable().optional(),
	fecha_valido_desde: z.string(),
	fecha_valido_hasta: z.string(),
	precio_entrada: z.union([z.number(), z.string()]),
	con_cupon: z.boolean(),
	fecha_checkin: z.string().nullable().optional(),
	fecha_checkout: z.string().nullable().optional(),
	es_listado: z.boolean(),
});

export const ListaIngresantesSchema = z.object({
	id: z.string().uuid(),
	titular_id: z.string().uuid(),
	orden_cobro_id: z.string().uuid().nullable().optional(),
	orden_cobro: OrdenCobroSchema.nullable().optional(),
	fecha_valido_desde: z.string(),
	fecha_valido_hasta: z.string(),
	con_cargos_pendientes: z.boolean(),
	total_ingresantes: z.number(),
	monto_total: z.union([z.number(), z.string()]),
	esta_pagada: z.boolean(),
	ingresantes: z.array(IngresanteSchema),
});

export const BungalowReservadoSchema = z.object({
	id: z.number(),
	bungalow: z.object({
		id: z.number(),
		numero: z.string(),
		nombre: z.string(),
	}),
	desglose_noches: z.array(z.any()),
	precio_subtotal: z.union([z.number(), z.string()]),
});

export const ReservaMaestraDetailSchema = z.object({
	id: z.string().uuid(),
	orden_cobro_id: z.string().uuid().nullable().optional(),
	orden_cobro: OrdenCobroSchema.nullable().optional(),
	fecha_inicio: z.string(),
	fecha_fin: z.string(),
	bungalows_alquilados: z.array(BungalowReservadoSchema),
	capacidad_total: z.number(),
	precio_total: z.union([z.number(), z.string()]).optional(),
	esta_pagada: z.boolean().optional(),
});

export const VisitaSchema = z.object({
	id: z.string().uuid(),
	titular_id: z.string().uuid().nullable().optional(),
	estado: VisitaEstadoEnum,
	reserva_asociada_id: z.string().uuid().nullable().optional(),
	lista_ingresantes: ListaIngresantesSchema.nullable().optional(),
	created_at: z.string(),
	// Campos resueltos del backend
	fecha_inicio: z.string().nullable().optional(),
	fecha_fin: z.string().nullable().optional(),
	total_personas: z.number().optional(),
	monto_total: z.union([z.number(), z.string()]).optional(),
	saldo_total: z.union([z.number(), z.string()]).optional(),
	pagado: z.boolean().optional(),
	id_publico: z.string().nullable().optional(),
	fecha_limite_pago: z.string().nullable().optional(),
	fecha_limite_cancelacion: z.string().nullable().optional(),
	is_bungalow: z.boolean().optional(),
	titular: PersonaDetalleSchema.optional(),
});

export const PaginatedVisitaSchema = z.object({
	results: z.array(VisitaSchema),
	count: z.number(),
});

export const VisitaQuerySchema = VisitaSchema.extend({
	reserva_asociada: ReservaMaestraDetailSchema.nullable().optional(),
});

// --- Flow Schemas (Inputs) ---

export const RegistroIngresanteSchema = z.object({
	persona_id: z.string().uuid(),
	tipo_entrada_id: z.string().uuid(),
	con_cupon: z.boolean(),
});

export const RegistroVisitaPasesSchema = z.object({
	fecha_inicio: z.string(),
	fecha_fin: z.string(),
	ingresantes: z.array(RegistroIngresanteSchema),
});

export const RegistroVisitaBungalowSchema = z.object({
	bungalow_ids: z.array(z.string()),
	fecha_llegada: z.string(),
	fecha_salida: z.string(),
	tipo_tarifa_id: z.string().uuid(),
	con_privilegio: z.boolean(),
	ingresantes: z.array(RegistroIngresanteSchema),
});

// --- Other Schemas ---

export const RelatedPersonSchema = z.object({
	persona: PersonaDetalleSchema,
	tipo: z.string(),
	tiene_privilegios: z.boolean().default(false),
	vinculo: z.string().nullable().optional(),
	etiqueta: z.string().nullable().optional(),
});

export const GrupoFamiliarResponseSchema = z.object({
	cupos_disponibles: z.number().default(0),
	grupo: z.array(RelatedPersonSchema),
});

export const BungalowDisponibleSchema = z.object({
	id: z.number().or(z.string()),
	numero: z.string(),
	nombre: z.string(),
	capacidad: z.number(),
	precio_noche: z.number().optional(),
	precio_total_estancia: z.union([z.number(), z.string()]).optional(),
	zona: z.string().nullable().optional(),
});

export const VisitanteSeleccionadoSchema = z.object({
	id: z.string(), // Puede ser UUID o ID temporal
	nombre: z.string(),
	dni: z.string(),
	tipo: z.string(), // "Socio", "Invitado", etc.
	precio_final: z.number(),
	precio_calculado: z.union([z.number(), z.string()]).optional(),
	usar_privilegio: z.boolean().optional(),
	en_bungalow: z.boolean().optional(),
});

export const PricingPersonSchema = z.object({
	persona_id: z.string().uuid(),
	nombre: z.string(),
	categoria: z.string(),
	precio: z.number(),
});

export const VisitaListSchema = PaginatedVisitaSchema;
export const PricingPersonListSchema = z.array(PricingPersonSchema);

// --- Types ---

export type Visita = z.infer<typeof VisitaSchema>;
export type Ingresante = z.infer<typeof IngresanteSchema>;
export type BungalowDisponible = z.infer<typeof BungalowDisponibleSchema>;
export type VisitanteSeleccionado = z.infer<typeof VisitanteSeleccionadoSchema>;
export type PricingPerson = z.infer<typeof PricingPersonSchema>;
export type VisitaList = z.infer<typeof PaginatedVisitaSchema>;
export type VisitaQuery = z.infer<typeof VisitaQuerySchema>;
export type TipoPase = z.infer<typeof TipoPaseSchema>;
export type PricingPersonList = z.infer<typeof PricingPersonListSchema>;

export type RegistroVisitaPases = z.infer<typeof RegistroVisitaPasesSchema>;
export type RegistroVisitaBungalow = z.infer<
	typeof RegistroVisitaBungalowSchema
>;
