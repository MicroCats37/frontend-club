"use client";

import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import {
	type FormField,
	GenericInput,
} from "@/components/generic/genericForm/GenericInput";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCreateFeriado, useUpdateFeriado } from "@/hooks/useFeriados";
import {
	type Feriado,
	FeriadoCreateSchema,
} from "@/schemas/alojamiento/feriado";

interface FeriadoFormModalProps {
	feriado: Feriado | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function FeriadoFormModal({
	feriado,
	open,
	onOpenChange,
}: FeriadoFormModalProps) {
	const createMutation = useCreateFeriado();
	const updateMutation = useUpdateFeriado();

	const isEdit = !!feriado;

	const handleSubmit = async (values: any) => {
		try {
			// Limpiar campos según el tipo para el backend
			const processedData = { ...values };
			if (values.tipo === "FIJO") {
				processedData.fecha = null;
			} else {
				processedData.mes = null;
				processedData.dia = null;
			}

			if (isEdit) {
				await updateMutation.mutateAsync({
					id: feriado.id,
					data: processedData,
				});
				toast.success("Feriado actualizado exitosamente");
			} else {
				await createMutation.mutateAsync(processedData);
				toast.success("Feriado creado exitosamente");
			}
			onOpenChange(false);
		} catch (_error) {
			// El hook maneja el error
		}
	};

	const fields: FormField[] = [
		{
			name: "nombre",
			label: "Nombre del Feriado",
			type: "text",
			placeholder: "Ej: Navidad, Año Nuevo...",
			required: true,
			containerClassName: "col-span-12",
			defaultValue: feriado?.nombre,
		},
		{
			name: "tipo",
			label: "Tipo de Feriado",
			type: "select",
			required: true,
			containerClassName: "col-span-12 md:col-span-6",
			options: [
				{ label: "Fijo (Se repite anualmente)", value: "FIJO" },
				{ label: "Variable (Año específico)", value: "VARIABLE" },
			],
			defaultValue: feriado?.tipo || "FIJO",
		},
		{
			name: "activo",
			label: "¿Día Activo?",
			type: "checkbox",
			containerClassName: "col-span-12 md:col-span-6 flex items-end pb-3",
			defaultValue: feriado ? feriado.activo : true,
		},
		{
			name: "conditional_fields",
			label: "",
			type: "custom",
			containerClassName: "col-span-12",
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
				<div className="h-2 w-full bg-primary" />

				<div className="p-8">
					<DialogHeader>
						<div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 text-primary">
							<Calendar className="h-6 w-6" />
						</div>
						<DialogTitle className="text-2xl font-black text-[#2C3A2C] leading-none mb-2">
							{isEdit ? "Editar Feriado" : "Nuevo Feriado"}
						</DialogTitle>
						<DialogDescription className="text-[#8BA18B] font-medium">
							{isEdit
								? "Modifica los detalles del día festivo configurado."
								: "Registra un nuevo día feriado para aplicar tarifas especiales."}
						</DialogDescription>
					</DialogHeader>

					<div className="mt-8">
						<GenericForm
							schema={FeriadoCreateSchema}
							onSubmit={handleSubmit}
							fields={fields}
							initialData={{
								nombre: feriado?.nombre || "",
								tipo: feriado?.tipo || "FIJO",
								activo: feriado ? feriado.activo : true,
								mes: feriado?.mes,
								dia: feriado?.dia,
								fecha: feriado?.fecha,
							}}
							customFields={{
								conditional_fields: (methods) => {
									const tipo = methods.watch("tipo");

									if (tipo === "FIJO") {
										return (
											<div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
												<div className="col-span-1">
													<GenericInput
														field={{
															name: "mes",
															label: "Mes",
															type: "select",
															required: true,
															valueType: "number",
															options: [
																{ label: "Enero", value: 1 },
																{ label: "Febrero", value: 2 },
																{ label: "Marzo", value: 3 },
																{ label: "Abril", value: 4 },
																{ label: "Mayo", value: 5 },
																{ label: "Junio", value: 6 },
																{ label: "Julio", value: 7 },
																{ label: "Agosto", value: 8 },
																{ label: "Septiembre", value: 9 },
																{ label: "Octubre", value: 10 },
																{ label: "Noviembre", value: 11 },
																{ label: "Diciembre", value: 12 },
															],
															defaultValue: feriado?.mes,
														}}
														register={methods.register as any}
														control={methods.control as any}
														errors={methods.formState.errors}
													/>
												</div>
												<div className="col-span-1">
													<GenericInput
														field={{
															name: "dia",
															label: "Día",
															type: "number",
															required: true,
															placeholder: "1-31",
															defaultValue: feriado?.dia,
														}}
														register={methods.register as any}
														control={methods.control as any}
														errors={methods.formState.errors}
													/>
												</div>
											</div>
										);
									}

									if (tipo === "VARIABLE") {
										return (
											<div className="animate-in fade-in slide-in-from-top-2 duration-300">
												<GenericInput
													field={{
														name: "fecha",
														label: "Fecha Específica",
														type: "date",
														required: true,
														defaultValue: feriado?.fecha,
													}}
													register={methods.register as any}
													control={methods.control as any}
													errors={methods.formState.errors}
												/>
											</div>
										);
									}

									return null;
								},
							}}
							submitButtonText={
								isEdit
									? updateMutation.isPending
										? "GUARDANDO..."
										: "GUARDAR CAMBIOS"
									: createMutation.isPending
										? "REGISTRANDO..."
										: "CREAR FERIADO"
							}
							cancelButtonText="CANCELAR"
							onCancel={() => onOpenChange(false)}
							isLoading={createMutation.isPending || updateMutation.isPending}
							formClassName="gap-y-4"
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
