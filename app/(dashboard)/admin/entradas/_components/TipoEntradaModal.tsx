"use client";

import { Ticket, X } from "lucide-react";
import { z } from "zod";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCategoriaActions } from "@/hooks/visitas/usePasesAdmin";

const TipoEntradaUpdateSchema = z.object({
	nombre: z.string().min(1, "El nombre es requerido"),
	descripcion: z.string().optional().nullable(),
	activo: z.boolean().default(true),
	image_main: z.any().optional().nullable(),
});

interface TipoEntradaModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingCat: any;
}

export function TipoEntradaModal({
	isOpen,
	onOpenChange,
	editingCat,
}: TipoEntradaModalProps) {
	const { updateCategoria, createCategoria } = useCategoriaActions();

	const handleSubmit = async (data: any) => {
		if (editingCat?.id) {
			await updateCategoria.mutateAsync({
				id: editingCat.id,
				data: data,
			});
		} else {
			await createCategoria.mutateAsync(data);
		}
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-[2.5rem] max-w-xl p-0 overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-white/95 backdrop-blur-xl animate-in zoom-in-95 duration-300">
				<div className="absolute top-6 right-6 z-10">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onOpenChange(false)}
						className="rounded-full hover:bg-black/5"
					>
						<X className="w-5 h-5 text-[#8BA18B]" />
					</Button>
				</div>

				<DialogHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 pb-6">
					<div className="flex items-center gap-6">
						<div className="p-4 rounded-[1.25rem] bg-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] text-primary border border-primary/5">
							<Ticket className="w-8 h-8" />
						</div>
						<div className="space-y-1">
							<DialogTitle className="text-3xl font-black text-[#2C3A2C] tracking-tight">
								{editingCat?.id ? "Editar Tipo" : "Nuevo Tipo"}
							</DialogTitle>
							<DialogDescription className="text-[#8BA18B] text-base font-medium">
								{editingCat?.id
									? "Ajusta los detalles de este acceso."
									: "Crea una nueva categoría de entrada."}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="p-10 pt-4 bg-white/50">
					<GenericForm
						schema={TipoEntradaUpdateSchema}
						initialData={editingCat}
						onSubmit={handleSubmit}
						submitButtonText={
							editingCat?.id ? "Actualizar Configuración" : "Crear Tipo de Entrada"
						}
						onCancel={() => onOpenChange(false)}
						fields={[
							{
								name: "nombre",
								label: "Nombre Distintivo",
								type: "text",
								placeholder: "Ej: Full Day VIP, Acceso General",
								required: true,
							},
							{
								name: "descripcion",
								label: "Descripción Detallada",
								type: "textarea",
								placeholder: "Explica qué incluye este tipo de entrada...",
							},
							{
								name: "image_main",
								label: "Imagen Representativa",
								type: "image",
								required: false,
							},
							{
								name: "activo",
								label: "Habilitar para venta inmediata",
								type: "checkbox",
							},
						]}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
