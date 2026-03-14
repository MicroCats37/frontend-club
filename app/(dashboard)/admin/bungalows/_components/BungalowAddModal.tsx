// _components/BungalowAddModal.tsx
"use client";

import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import { AlertCircle, Home } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCreateBungalow } from "@/hooks/useBungalows";
import {
	BungalowUpdateSchema,
	type BungalowUpdate,
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
					containerClassName: "col-span-12 flex justify-center pb-6",
				},
				{
					name: "nombre",
					label: "Nombre / Identificador",
					type: "text",
					required: true,
					containerClassName: "col-span-12",
				},
				{
					name: "numero",
					label: "Número",
					type: "text",
					required: true,
					containerClassName: "col-span-12 md:col-span-4",
				},
				{
					name: "zona",
					label: "Zona",
					type: "text",
					containerClassName: "col-span-12 md:col-span-4",
				},
				{
					name: "piso",
					label: "Piso",
					type: "number",
					containerClassName: "col-span-12 md:col-span-4",
					defaultValue: 1,
				},
				{
					name: "capacidad",
					label: "Capacidad (Personas)",
					type: "number",
					required: true,
					containerClassName: "col-span-12 md:col-span-4",
				},
				{
					name: "descripcion",
					label: "Descripción Detallada",
					type: "textarea",
					containerClassName: "col-span-12",
				},
			],
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
				<DialogHeader className="p-8 bg-[#FBFCFB] border-b border-[#E0E7E0]">
					<DialogTitle className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight">
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
