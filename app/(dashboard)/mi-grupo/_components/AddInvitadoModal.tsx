"use client";

import {
	Calendar,
	Fingerprint,
	Tag,
	User,
	Users,
	VenusAndMars,
} from "lucide-react";
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
	useAddContacto,
	useVincularPorDni,
} from "@/hooks/auth/useGrupoActions";
import { buildApiPayload } from "@/utils/payload/format";
import { SmartFileField } from "./SmartFileField";

const invitadoSchema = z.object({
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
			}, "El invitado debe tener al menos 3 años de edad"),
		genero: z.enum(["M", "F"], { message: "Seleccione un género válido" }),
	}),
	etiqueta: z.string().min(1, "La etiqueta es obligatoria"),
	foto_frontal: z
		.any()
		.refine((file) => file instanceof File, "La foto frontal es obligatoria"),
});

type InvitadoFormValues = z.infer<typeof invitadoSchema>;

const vincularDniSchema = z.object({
	dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
	etiqueta: z.string().min(1, "La etiqueta es obligatoria"),
});

type VincularDniValues = z.infer<typeof vincularDniSchema>;

export function AddInvitadoModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { mutateAsync: addContacto, isPending: isAdding } = useAddContacto();
	const { mutateAsync: vincularPorDni, isPending: isLinking } =
		useVincularPorDni();

	const _isPending = isAdding || isLinking;

	const invitadoFields: FormField[] = [
		// ... (mismo contenido que antes, se mantiene igual)
		{
			name: "persona.dni",
			label: "DNI",
			type: "text",
			icon: Fingerprint,
			placeholder: "12345678",
			required: true,
			containerClassName: "col-span-12",
		},
		{
			name: "persona.nombres",
			label: "Nombres",
			type: "text",
			icon: User,
			placeholder: "Juan",
			required: true,
			containerClassName: "col-span-6",
		},
		{
			name: "persona.apellidos",
			label: "Apellidos",
			type: "text",
			icon: User,
			placeholder: "Pérez",
			required: true,
			containerClassName: "col-span-6",
		},
		{
			name: "persona.fecha_nacimiento",
			label: "Fecha de Nacimiento",
			type: "date",
			icon: Calendar,
			required: true,
			containerClassName: "col-span-6",
		},
		{
			name: "persona.genero",
			label: "Género",
			type: "select",
			icon: VenusAndMars,
			required: true,
			options: [
				{ label: "Masculino", value: "M" },
				{ label: "Femenino", value: "F" },
			],
			containerClassName: "col-span-6",
		},
		{
			name: "etiqueta",
			label: "Etiqueta",
			type: "text",
			icon: Tag,
			placeholder: "Ej: Amigo, Colega",
			required: true,
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
			icon: Fingerprint,
			placeholder: "12345678",
			required: true,
			containerClassName: "col-span-12",
		},
		{
			name: "etiqueta",
			label: "Etiqueta",
			type: "text",
			icon: Tag,
			placeholder: "Ej: Amigo, Colega",
			required: true,
			containerClassName: "col-span-12",
		},
	];

	async function onSubmit(values: InvitadoFormValues) {
		const payload = buildApiPayload({
			...values,
			tipo_vinculo: "CONTACTO",
		});
		await addContacto(payload);
		toast.success("Invitado registrado exitosamente.");
		onOpenChange(false);
	}

	async function onQuickSubmit(values: VincularDniValues) {
		try {
			await vincularPorDni({
				...values,
				tipo: "CONTACTO",
			});
			toast.success("Persona vinculada exitosamente.");
			onOpenChange(false);
		} catch (error: any) {
			toast.error(
				error.response?.data?.detail || "No se pudo vincular a la persona.",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
				<div className="h-2 w-full bg-emerald-500" />

				<div className="p-6">
					<DialogHeader>
						<div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600">
							<Users className="h-6 w-6" />
						</div>
						<DialogTitle className="text-2xl font-black text-[#2C3A2C] leading-none mb-2">
							Agregar Invitado
						</DialogTitle>
						<DialogDescription className="text-[#8BA18B]">
							Añade a alguien a tu lista de invitados frecuentes.
						</DialogDescription>
					</DialogHeader>

					<div className="mt-6">
						<Tabs defaultValue="new" className="w-full">
							<TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100/50 p-1 rounded-xl">
								<TabsTrigger value="dni" className="rounded-lg font-bold">
									POR DNI
								</TabsTrigger>
								<TabsTrigger value="new" className="rounded-lg font-bold">
									NUEVO REGISTRO
								</TabsTrigger>
							</TabsList>

							<TabsContent value="dni">
								<div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-6 flex gap-3 items-center">
									<div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
										<Users className="h-4 w-4" />
									</div>
									<p className="text-xs text-emerald-800 font-medium">
										Usa esta opción si la persona ya ha visitado el club antes o
										ya está registrada en el sistema.
									</p>
								</div>
								<GenericForm<VincularDniValues>
									schema={vincularDniSchema}
									fields={quickAddFields}
									onSubmit={onQuickSubmit}
									initialData={{ dni: "", etiqueta: "Invitado" }}
									submitButtonText={
										isLinking ? "BUSCANDO…" : "VINCULAR POR DNI"
									}
									isLoading={isLinking}
									onCancel={() => onOpenChange(false)}
								/>
							</TabsContent>

							<TabsContent value="new">
								<GenericForm<InvitadoFormValues>
									schema={invitadoSchema}
									fields={invitadoFields}
									onSubmit={onSubmit}
									initialData={{
										persona: { dni: "", nombres: "", apellidos: "" },
										etiqueta: "Invitado",
									}}
									submitButtonText={
										isAdding ? "GUARDANDO…" : "REGISTRAR INVITADO"
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
