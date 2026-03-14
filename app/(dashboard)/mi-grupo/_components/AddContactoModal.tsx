"use client";

import { UserPlus } from "lucide-react";
import * as z from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useAddContacto } from "@/hooks/auth/useGrupoActions";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormField } from "@/components/generic/genericForm/GenericInput";
import { SmartFileField } from "./SmartFileField";
import { buildApiPayload } from "@/utils/payload/format";
import { toast } from "sonner";

const contactSchema = z.object({
	persona: z.object({
		dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
		nombres: z.string().min(2, "Mínimo 2 caracteres"),
		apellidos: z.string().min(2, "Mínimo 2 caracteres"),
		fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria")
			.refine((val) => {
				const birthDate = new Date(val);
				const today = new Date();
				let age = today.getFullYear() - birthDate.getFullYear();
				const m = today.getMonth() - birthDate.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
					age--;
				}
				return age >= 3;
			}, "El contacto debe tener al menos 3 años de edad"),
		genero: z.enum(["M", "F"], { message: "Seleccione un género válido" }),
	}),
	etiqueta: z.string().min(1, "La etiqueta es obligatoria"),
	foto_frontal: z.any().refine((file) => file instanceof File, "La foto frontal es obligatoria"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function AddContactoModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { mutateAsync: addContacto, isPending } = useAddContacto();

	const contactFields: FormField[] = [
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
			name: "etiqueta",
			label: "Etiqueta (Opcional)",
			type: "text",
			placeholder: "Amigo, Primo, etc.",
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

	async function onSubmit(values: ContactFormValues) {
		const payload = buildApiPayload(values);
		await addContacto(payload);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
						<UserPlus className="h-6 w-6 text-primary" />
					</div>
					<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
						Agregar Nuevo Contacto
					</DialogTitle>
					<DialogDescription>
						Registra a tus amigos o invitados frecuentes. Ahora requerimos la foto frontal del DNI para validación.
					</DialogDescription>
				</DialogHeader>

				<GenericForm<ContactFormValues>
					schema={contactSchema}
					fields={contactFields}
					onSubmit={onSubmit}
					initialData={{
						persona: { dni: "", nombres: "", apellidos: "" },
						etiqueta: "Invitado",
					}}
					submitButtonText="GUARDAR CONTACTO"
					isLoading={isPending}
					onCancel={() => onOpenChange(false)}
					customFields={{
						foto_frontal: (methods) => (
							<div className="mb-2">
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
			</DialogContent>
		</Dialog>
	);
}
