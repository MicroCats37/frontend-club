"use client";

import { AlignLeft, Home, Layers, MapPin, Tag, Users } from "lucide-react";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateBungalow } from "@/hooks/useBungalows";

import {
	type Bungalow,
	type BungalowUpdate,
	BungalowUpdateSchema,
} from "@/schemas/alojamiento/bungalow";

interface BungalowDetailsEditorProps {
	bungalow: Bungalow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function BungalowDetailsEditor({
	bungalow,
	open,
	onOpenChange,
}: BungalowDetailsEditorProps) {
	if (!bungalow) return null;

	const updateMutation = useUpdateBungalow();
	const handleUpdate = async (data: BungalowUpdate) => {
		try {
			await updateMutation.mutateAsync({ id: bungalow.id, data });
			onOpenChange(false);
		} catch (_error) {
			// useApiUpdate ya maneja los toasts de error
		}
	};

	const sections: FormSection[] = [
		{
			title: "Información General",
			description: "Datos básicos e imagen de portada del bungalow.",
			icon: Home,
			fields: [
				{
					name: "image_main",
					label: "Imagen Principal",
					type: "image",
					containerClassName: "col-span-12 flex justify-center pb-8",
					defaultValue: bungalow.image_main,
				},
				{
					name: "nombre",
					label: "Nombre del Bungalow",
					type: "text",
					placeholder: "Ej: Bungalow Suite Familiar",
					icon: Tag,
					required: true,
					containerClassName: "col-span-12 md:col-span-8",
					defaultValue: bungalow.nombre,
				},
				{
					name: "capacidad",
					label: "Capacidad",
					type: "number",
					icon: Users,
					required: true,
					placeholder: "0",
					containerClassName: "col-span-12 md:col-span-4",
					defaultValue: bungalow.capacidad,
				},
				{
					name: "zona",
					label: "Zona / Bloque",
					type: "text",
					icon: MapPin,
					placeholder: "Ej: Zona A",
					containerClassName: "col-span-12 md:col-span-6",
					defaultValue: bungalow.zona,
				},
				{
					name: "piso",
					label: "Nivel / Piso",
					type: "number",
					icon: Layers,
					placeholder: "1",
					containerClassName: "col-span-12 md:col-span-6",
					defaultValue: bungalow.piso,
				},
				{
					name: "descripcion",
					label: "Descripción del Alojamiento",
					type: "textarea",
					icon: AlignLeft,
					placeholder: "Detalla las características, servicios y amenidades...",
					containerClassName: "col-span-12",
					defaultValue: bungalow.descripcion,
				},
			],
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] border-none shadow-2xl rounded-none p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
				<DialogHeader className="p-10 bg-[#FBFCFB] border-b border-[#E0E7E0]">
					<DialogTitle className="text-4xl font-black text-[#111827] tracking-tighter uppercase">
						Editar Bungalow
					</DialogTitle>
				</DialogHeader>

				<div className="p-2">
					<GenericForm
						schema={BungalowUpdateSchema}
						onSubmit={handleUpdate}
						formSections={sections}
						submitButtonText="Guardar Cambios"
						cancelButtonText="Cerrar"
						onCancel={() => onOpenChange(false)}
						isLoading={updateMutation.isPending}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
