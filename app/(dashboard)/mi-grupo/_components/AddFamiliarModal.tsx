"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormField } from "@/components/generic/genericForm/GenericInput";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useAddFamiliar,
	useVincularPorDni,
} from "@/hooks/auth/useGrupoActions";
import { buildApiPayload } from "@/utils/payload/format";
import { SmartFileField } from "./SmartFileField";

const familiarSchema = z.object({
	persona: z.object({
		dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
		nombres: z.string().min(2, "Mínimo 2 caracteres"),
		apellidos: z.string().min(2, "Mínimo 2 caracteres"),
		fecha_nacimiento: z
			.string()
			.min(1, "La fecha de nacimiento es obligatoria")
			.refine((val) => {
				const birthDate = new Date(val);
				const today = new Date();
				let age = today.getFullYear() - birthDate.getFullYear();
				const m = today.getMonth() - birthDate.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
					age--;
				}
				return age >= 3;
			}, "El familiar debe tener al menos 3 años de edad"),
		genero: z.enum(["M", "F"], { message: "Seleccione un género válido" }),
	}),
	parentesco: z.string().min(1, "El parentesco es obligatorio"),
	foto_frontal: z
		.any()
		.refine((file) => file instanceof File, "La foto frontal es obligatoria"),
});

type FamiliarFormValues = z.infer<typeof familiarSchema>;

const vincularDniFamiliarSchema = z.object({
	dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
	vinculo: z.string().min(1, "El parentesco es obligatorio"),
});

type VincularDniFamiliarValues = z.infer<typeof vincularDniFamiliarSchema>;

export function AddFamiliarModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { mutateAsync: addFamiliar, isPending: isAdding } = useAddFamiliar();
	const { mutateAsync: vincularPorDni, isPending: isLinking } =
		useVincularPorDni();

	const _isPending = isAdding || isLinking;

	const parentescoOptions = [
		{ label: "Cónyuge", value: "CONYUGE" },
		{ label: "Hijo/a", value: "HIJO" },
		{ label: "Padre", value: "PADRE" },
		{ label: "Madre", value: "MADRE" },
		{ label: "Hermano/a", value: "HERMANO" },
		{ label: "Otro", value: "OTRO" },
	];

	const familiarFields: FormField[] = [
		{
			name: "persona.dni",
			label: "DNI",
			type: "text",
			placeholder: "12345678",
			required: true,
			containerClassName: "col-span-12",
		},
		{
			name: "persona.nombres",
			label: "Nombres",
			type: "text",
			placeholder: "Juan",
			required: true,
			containerClassName: "col-span-6",
		},
		{
			name: "persona.apellidos",
			label: "Apellidos",
			type: "text",
			placeholder: "Pérez",
			required: true,
			containerClassName: "col-span-6",
		},
		{
			name: "persona.fecha_nacimiento",
			label: "Fecha de Nacimiento",
			type: "date",
			required: true,
			containerClassName: "col-span-6",
		},
		{
			name: "persona.genero",
			label: "Género",
			type: "select",
			required: true,
			options: [
				{ label: "Masculino", value: "M" },
				{ label: "Femenino", value: "F" },
			],
			containerClassName: "col-span-6",
		},
		{
			name: "parentesco",
			label: "Parentesco",
			type: "select",
			required: true,
			options: parentescoOptions,
			containerClassName: "col-span-12",
		},
		{
			name: "foto_frontal",
			label: "Foto Frontal DNI",
			type: "custom",
			required: true,
			containerClassName: "col-span-12",
		},
	];

	const quickAddFields: FormField[] = [
		{
			name: "dni",
			label: "DNI de la Persona",
			type: "text",
			placeholder: "12345678",
			required: true,
			containerClassName: "col-span-12",
		},
		{
			name: "vinculo",
			label: "Parentesco",
			type: "select",
			required: true,
			options: parentescoOptions,
			containerClassName: "col-span-12",
		},
	];

	async function onSubmit(values: FamiliarFormValues) {
		const payload = buildApiPayload({
			...values,
			tipo_vinculo: "FAMILIAR",
		});
		await addFamiliar(payload);
		toast.success("Familiar registrado exitosamente.");
		onOpenChange(false);
	}

	async function onQuickSubmit(values: VincularDniFamiliarValues) {
		try {
			await vincularPorDni({
				...values,
				tipo: "FAMILIAR",
			});
			toast.success("Familiar vinculado exitosamente.");
			onOpenChange(false);
		} catch (error: any) {
			toast.error(
				error.response?.data?.detail || "No se pudo vincular al familiar.",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
				<div className="h-2 w-full bg-blue-500" />

				<div className="p-6">
					<DialogHeader>
						<div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-blue-100 text-blue-600">
							<Heart className="h-6 w-6" />
						</div>
						<DialogTitle className="text-2xl font-black text-[#2C3A2C] leading-none mb-2">
							Agregar Familiar
						</DialogTitle>
						<DialogDescription className="text-[#8BA18B]">
							Añade a un miembro de tu familia a tu grupo.
						</DialogDescription>
					</DialogHeader>

					<div className="mt-6">
						<Tabs defaultValue="new" className="w-full">
							<TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100/50 p-1 rounded-xl">
								<TabsTrigger value="new" className="rounded-lg font-bold">
									NUEVO REGISTRO
								</TabsTrigger>
								<TabsTrigger value="dni" className="rounded-lg font-bold">
									POR DNI
								</TabsTrigger>
							</TabsList>

							<TabsContent value="dni">
								<div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3 items-center">
									<div className="p-2 bg-blue-100 rounded-lg text-blue-600">
										<Heart className="h-4 w-4" />
									</div>
									<p className="text-xs text-blue-800 font-medium">
										Usa esta opción si tu familiar ya está en el sistema. Los
										beneficios se podrán solicitar después.
									</p>
								</div>
								<GenericForm<VincularDniFamiliarValues>
									schema={vincularDniFamiliarSchema}
									fields={quickAddFields}
									onSubmit={onQuickSubmit}
									initialData={{ dni: "", vinculo: "HIJO" }}
									submitButtonText={
										isLinking ? "BUSCANDO…" : "VINCULAR POR DNI"
									}
									isLoading={isLinking}
									onCancel={() => onOpenChange(false)}
								/>
							</TabsContent>

							<TabsContent value="new">
								<GenericForm<FamiliarFormValues>
									schema={familiarSchema}
									fields={familiarFields}
									onSubmit={onSubmit}
									initialData={{
										persona: { dni: "", nombres: "", apellidos: "" },
										parentesco: "HIJO",
									}}
									submitButtonText={
										isAdding ? "GUARDANDO…" : "REGISTRAR FAMILIAR"
									}
									isLoading={isAdding}
									onCancel={() => onOpenChange(false)}
									customFields={{
										foto_frontal: (methods) => (
											<div className="mt-2">
												<SmartFileField
													control={methods.control}
													name="foto_frontal"
													label="Foto Frontal DNI"
													error={(methods.formState.errors as any).foto_frontal}
													description="Sube una foto clara del frente del documento."
												/>
											</div>
										),
									}}
								/>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
