import { z } from "zod";

export const FeriadoSchema = z.object({
	id: z.number(),
	nombre: z.string().min(1, "El nombre es requerido"),
	tipo: z.enum(["FIJO", "VARIABLE"]),
	mes: z.number().min(1).max(12).nullable().optional(),
	dia: z.number().min(1).max(31).nullable().optional(),
	fecha: z.string().nullable().optional(),
	activo: z.boolean(),
	created_at: z.string(),
});

export type Feriado = z.infer<typeof FeriadoSchema>;

export const PaginatedFeriadoSchema = z.object({
	count: z.number(),
	next: z.string().nullable(),
	previous: z.string().nullable(),
	results: z.array(FeriadoSchema),
});

export const FeriadoCreateSchema = z
	.object({
		nombre: z.string().min(1, "El nombre es requerido"),
		tipo: z.enum(["FIJO", "VARIABLE"]),
		mes: z.number().min(1).max(12).optional().nullable(),
		dia: z.number().min(1).max(31).optional().nullable(),
		fecha: z.string().optional().nullable(),
		activo: z.boolean().default(true),
	})
	.refine(
		(data) => {
			if (data.tipo === "FIJO") {
				return data.mes !== null && data.dia !== null;
			}
			return true;
		},
		{
			message: "Mes y día son requeridos para feriados fijos",
			path: ["mes"],
		},
	)
	.refine(
		(data) => {
			if (data.tipo === "VARIABLE") {
				return data.fecha !== null && data.fecha !== undefined;
			}
			return true;
		},
		{
			message: "La fecha es requerida para feriados variables",
			path: ["fecha"],
		},
	);

export type FeriadoCreate = z.infer<typeof FeriadoCreateSchema>;
