// _components/BungalowAddModal.tsx
"use client";

import {
	AlignLeft,
	Hash,
	Home,
	Layers,
	MapPin,
	Tag,
	Users,
} from "lucide-react";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCreateBungalow } from "@/hooks/useBungalows";
import {
	type BungalowUpdate,
	BungalowUpdateSchema,
} from "@/schemas/alojamiento/bungalow";

interface BungalowAddModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function BungalowAddModal({
	open,
	onOpenChange,
}: BungalowAddModalProps) {
	const createMutation = useCreateBungalow();

	const handleCreate = async (data: BungalowUpdate) => {
		try {
			await createMutation.mutateAsync(data);
			onOpenChange(false);
		} catch (_error) {
			// useApiCreate ya maneja los toasts de error
		}
	};

	const sections: FormSection[] = [
		{
			title: "Información General",
			description: "Datos básicos e imagen de portada para el nuevo bungalow.",
			icon: Home,
			fields: [
				{
					name: "image_main",
					label: "Imagen Principal",
					type: "image",
					containerClassName: "col-span-12 flex justify-center pb-8",
				},
				{
					name: "nombre",
					label: "Nombre del Bungalow",
					type: "text",
					icon: Tag,
					placeholder: "Ej: Bungalow Suite Familiar",
					required: true,
					containerClassName: "col-span-12 md:col-span-8",
				},
				{
					name: "numero",
					label: "Número / ID",
					type: "text",
					icon: Hash,
					required: true,
					placeholder: "Ej: 101",
					containerClassName: "col-span-12 md:col-span-4",
				},
				{
					name: "capacidad",
					label: "Capacidad Máxima",
					type: "number",
					icon: Users,
					required: true,
					disabled: true,
					placeholder: "0",
					containerClassName: "col-span-12 md:col-span-4",
				},
				{
					name: "zona",
					label: "Zona / Bloque",
					type: "text",
					icon: MapPin,
					placeholder: "Ej: Zona B",
					containerClassName: "col-span-12 md:col-span-4",
				},
				{
					name: "piso",
					label: "Nivel / Piso",
					type: "number",
					icon: Layers,
					containerClassName: "col-span-12 md:col-span-4",
					defaultValue: 1,
				},
				{
					name: "descripcion",
					label: "Descripción Detallada",
					type: "textarea",
					icon: AlignLeft,
					placeholder:
						"Describe las características únicas de este bungalow...",
					containerClassName: "col-span-12",
				},
			],
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] border-none shadow-2xl rounded-none p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
				<DialogHeader className="p-10 bg-[#FBFCFB] border-b border-[#E0E7E0]">
					<DialogTitle className="text-4xl font-black text-[#111827] tracking-tighter uppercase">
						Nuevo Bungalow
					</DialogTitle>
				</DialogHeader>

				<div className="p-2">
					<GenericForm
						schema={BungalowUpdateSchema}
						onSubmit={handleCreate}
						formSections={sections}
						submitButtonText="Crear Bungalow"
						cancelButtonText="Cancelar"
						onCancel={() => onOpenChange(false)}
						isLoading={createMutation.isPending}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
