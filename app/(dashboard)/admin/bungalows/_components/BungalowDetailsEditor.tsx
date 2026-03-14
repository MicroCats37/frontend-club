import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import { CheckCircle2, Home } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useUpdateBungalow,
} from "@/hooks/useBungalows";

import {
	type Bungalow,
	BungalowUpdateSchema,
	type BungalowUpdate,
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
					containerClassName: "col-span-12 flex justify-center pb-6",
					defaultValue: bungalow.image_main,
				},
				{
					name: "nombre",
					label: "Nombre / Identificador",
					type: "text",
					required: true,
					containerClassName: "col-span-12",
					defaultValue: bungalow.nombre,
				},
				{
					name: "zona",
					label: "Zona",
					type: "text",
					containerClassName: "col-span-12 md:col-span-4",
					defaultValue: bungalow.zona,
				},
				{
					name: "piso",
					label: "Piso",
					type: "number",
					containerClassName: "col-span-12 md:col-span-4",
					defaultValue: bungalow.piso,
				},
				{
					name: "capacidad",
					label: "Capacidad (Personas)",
					type: "number",
					required: true,
					containerClassName: "col-span-12 md:col-span-4",
					defaultValue: bungalow.capacidad,
				},
				{
					name: "descripcion",
					label: "Descripción Detallada",
					type: "textarea",
					containerClassName: "col-span-12",
					defaultValue: bungalow.descripcion,
				},
			],
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
				<DialogHeader className="p-8 bg-[#FBFCFB] border-b border-[#E0E7E0]">
					<DialogTitle className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight">
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

