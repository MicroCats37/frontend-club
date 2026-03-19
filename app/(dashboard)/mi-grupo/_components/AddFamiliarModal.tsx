"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Calendar,
	Fingerprint,
	Heart,
	Info,
	User,
	Users,
	VenusAndMars,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type {
	FormField,
	FormSection,
} from "@/components/generic/genericForm/GenericInput";
import { CardFieldWrapper } from "@/components/generic/genericForm/ui/CardFieldWrapper";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useAddFamiliar,
	useBuscarPersona,
	useVincularPorDni,
} from "@/hooks/auth/useGrupoActions";
import { buildApiPayload } from "@/utils/payload/format";
import { SmartFileField } from "./SmartFileField";

const registrarFamiliarSchema = z.object({
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

type RegistrarFamiliarValues = z.infer<typeof registrarFamiliarSchema>;

const vincularFamiliarSchema = z.object({
	persona: z.object({
		dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
	}),
	parentesco: z.string().min(1, "El parentesco es obligatorio"),
});

type VincularFamiliarValues = z.infer<typeof vincularFamiliarSchema>;

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
	const [personaEncontrada, setPersonaEncontrada] = useState(false);
	const [yaEnGrupo, setYaEnGrupo] = useState(false);
	const [esTitular, setEsTitular] = useState(false);
	const [tienePrivilegiosIndependientes, setTienePrivilegiosIndependientes] =
		useState(false);

	const { mutateAsync: addFamiliar, isPending: isAdding } = useAddFamiliar();
	const { mutateAsync: vincularPorDni, isPending: isLinking } =
		useVincularPorDni();
	const { mutateAsync: buscarPersona, isPending: isSearching } =
		useBuscarPersona();

	const registrarForm = useForm<RegistrarFamiliarValues>({
		resolver: zodResolver(registrarFamiliarSchema),
		defaultValues: {
			persona: {
				dni: "",
				nombres: "",
				apellidos: "",
				fecha_nacimiento: "",
				genero: "M" as any,
			},
			parentesco: "HIJO",
		},
	});

	const vincularForm = useForm<VincularFamiliarValues>({
		resolver: zodResolver(vincularFamiliarSchema),
		defaultValues: {
			persona: { dni: "" },
			parentesco: "HIJO",
		},
	});

	const dniValue = registrarForm.watch("persona.dni");
	const vincularDniValue = vincularForm.watch("persona.dni");

	// Sincronizar DNI y Parentesco entre formularios
	useEffect(() => {
		if (personaEncontrada) {
			// Si persona encontrada, el formulario de vínculo manda
			if (dniValue !== vincularDniValue) {
				registrarForm.setValue("persona.dni", vincularDniValue);
			}
			const vincularParentesco = vincularForm.getValues("parentesco");
			if (registrarForm.getValues("parentesco") !== vincularParentesco) {
				registrarForm.setValue("parentesco", vincularParentesco);
			}
		} else {
			// Si no encontrada (flujo registro), el formulario de registro manda
			if (vincularDniValue !== dniValue) {
				vincularForm.setValue("persona.dni", dniValue);
			}
			const registrarParentesco = registrarForm.getValues("parentesco");
			if (vincularForm.getValues("parentesco") !== registrarParentesco) {
				vincularForm.setValue("parentesco", registrarParentesco);
			}
		}
	}, [
		dniValue,
		vincularDniValue,
		personaEncontrada,
		registrarForm,
		vincularForm,
	]);

	// Efecto de búsqueda (basado en el form activo)
	const activeDni = personaEncontrada ? vincularDniValue : dniValue;

	useEffect(() => {
		if (activeDni?.length === 8) {
			const triggerSearch = async () => {
				const res = await buscarPersona(activeDni);
				if (res.encontrado) {
					setPersonaEncontrada(true);
					setYaEnGrupo(res.ya_en_grupo);
					setEsTitular(res.es_titular);
					setTienePrivilegiosIndependientes(
						res.tiene_privilegios_independientes,
					);

					// Pre-llenar vincular form
					vincularForm.setValue("persona.dni", activeDni);

					if (res.ya_en_grupo) {
						toast.info("Esta persona ya forma parte de tu grupo.");
					} else if (res.es_titular || res.tiene_privilegios_independientes) {
						toast.warning(
							"Esta persona ya tiene acceso propio y no puede ser familiar con beneficios.",
						);
					} else {
						toast.success(
							`Persona encontrada: ${res.nombres} ${res.apellidos}`,
						);
					}
				} else {
					setPersonaEncontrada(false);
					setYaEnGrupo(false);
					setEsTitular(false);
					setTienePrivilegiosIndependientes(false);
					// Si veníamos de una persona encontrada y ahora no lo está,
					// nos aseguramos que el registrarForm tenga el DNI
					registrarForm.setValue("persona.dni", activeDni);
				}
			};
			triggerSearch();
		} else {
			setPersonaEncontrada(false);
			setYaEnGrupo(false);
			setEsTitular(false);
			setTienePrivilegiosIndependientes(false);
		}
	}, [
		activeDni,
		buscarPersona, // Si veníamos de una persona encontrada y ahora no lo está,
		// nos aseguramos que el registrarForm tenga el DNI
		registrarForm, // Pre-llenar vincular form
		vincularForm,
	]);

	const _isPending = isAdding || isLinking || isSearching;

	const parentescoOptions = [
		{ label: "Cónyuge", value: "CONYUGE" },
		{ label: "Hijo/a", value: "HIJO" },
		{ label: "Padre", value: "PADRE" },
		{ label: "Madre", value: "MADRE" },
		{ label: "Hermano/a", value: "HERMANO" },
		{ label: "Otro", value: "OTRO" },
	];

	const registrarSections: FormSection[] = [
		{
			title: "Datos de Identidad",
			description: "Información principal de la persona",
			icon: Fingerprint,
			fields: [
				{
					name: "persona.dni",
					label: "DNI",
					type: "text",
					icon: Fingerprint,
					placeholder: "12345678",
					required: true,
					containerClassName: "col-span-12",
					helperText: isSearching
						? "Buscando..."
						: "Ingrese 8 dígitos para buscar",
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
			],
		},
		{
			title: "Información del Vínculo",
			description: "Detalles adicionales y relación",
			icon: Heart,
			fields: [
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
					name: "parentesco",
					label: "Parentesco",
					type: "select",
					icon: Users,
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
			],
		},
	];

	const vincularSections: FormSection[] = [
		{
			title: "Vincular Persona",
			description: "La persona ya existe en el sistema",
			icon: Heart,
			fields: [
				{
					name: "persona.dni",
					label: "DNI",
					type: "text",
					icon: Fingerprint,
					placeholder: "12345678",
					required: true,
					containerClassName: "col-span-12",
					helperText: "DNI validado",
				},
				{
					name: "parentesco",
					label: "Parentesco",
					type: "select",
					icon: Users,
					required: true,
					options: parentescoOptions,
					containerClassName: "col-span-12",
				},
			],
		},
	];

	const _quickAddFields: FormField[] = [
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

	async function onRegistrarSubmit(values: RegistrarFamiliarValues) {
		if (yaEnGrupo) {
			toast.warning("Esta persona ya está en tu grupo.");
			return;
		}
		try {
			const payload = buildApiPayload({
				...values,
				tipo_vinculo: "FAMILIAR",
			});
			await addFamiliar(payload);
			toast.success("Familiar registrado exitosamente.");
			onOpenChange(false);
			registrarForm.reset();
			vincularForm.reset();
		} catch (error: any) {
			toast.error(
				error.response?.data?.detail || "Error al registrar familiar.",
			);
		}
	}

	async function onVincularSubmit(values: VincularFamiliarValues) {
		if (yaEnGrupo) {
			toast.warning("Esta persona ya está en tu grupo.");
			return;
		}
		try {
			await vincularPorDni({
				dni: values.persona.dni,
				tipo: "FAMILIAR",
				vinculo: values.parentesco,
			});
			toast.success("Familiar vinculado exitosamente.");
			onOpenChange(false);
			registrarForm.reset();
			vincularForm.reset();
		} catch (error: any) {
			toast.error(
				error.response?.data?.detail || "Error al vincular familiar.",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden p-0 border-none shadow-2xl ring-0 focus:outline-none">
				<div className="h-2 w-full bg-blue-500" />

				<div className="p-4 md:p-5">
					<DialogHeader className="flex-row items-center gap-4 space-y-0">
						<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 shrink-0">
							<Heart className="h-5 w-5" />
						</div>
						<div className="text-left">
							<DialogTitle className="text-lg md:text-xl font-black text-[#2C3A2C] leading-tight">
								Agregar Familiar
							</DialogTitle>
							<DialogDescription className="text-xs text-[#8BA18B]">
								Añade a un miembro de tu familia a tu grupo.
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="mt-4">
						{personaEncontrada &&
							!yaEnGrupo &&
							!esTitular &&
							!tienePrivilegiosIndependientes && (
								<div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-4 duration-300">
									<div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
										<Heart className="h-3.5 w-3.5" />
									</div>
									<div>
										<p className="text-xs text-blue-900 font-bold leading-tight">
											¡Persona encontrada!
										</p>
										<p className="text-[10px] text-blue-700 leading-tight">
											Esta persona ya existe. Indica el parentesco.
										</p>
									</div>
								</div>
							)}

						{(esTitular || tienePrivilegiosIndependientes) && !yaEnGrupo && (
							<div className="bg-red-50/50 border border-red-100 rounded-xl p-3 mb-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="p-1.5 bg-red-100 rounded-lg text-red-600">
									<Info className="h-3.5 w-3.5" />
								</div>
								<div>
									<p className="text-xs text-red-900 font-bold leading-tight">
										Acceso independiente detectado
									</p>
									<p className="text-[10px] text-red-700 leading-tight">
										Esta persona es titular o ya tiene privilegios. No puede ser
										familiar con beneficios. Agréguela como contacto desde la
										sección de Invitados.
									</p>
								</div>
							</div>
						)}

						{yaEnGrupo && (
							<div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 mb-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
									<Heart className="h-3.5 w-3.5" />
								</div>
								<div>
									<p className="text-xs text-amber-900 font-bold leading-tight">
										Ya en el grupo
									</p>
									<p className="text-[10px] text-amber-700 leading-tight">
										Esta persona ya forma parte de tus contactos.
									</p>
								</div>
							</div>
						)}

						{personaEncontrada ? (
							<GenericForm<VincularFamiliarValues>
								formMethods={vincularForm}
								schema={vincularFamiliarSchema}
								formSections={vincularSections}
								onSubmit={onVincularSubmit}
								submitButtonText={
									_isPending ? "PROCESANDO…" : "VINCULAR PERSONA"
								}
								isLoading={_isPending}
								isDisabled={
									yaEnGrupo ||
									isSearching ||
									esTitular ||
									tienePrivilegiosIndependientes
								}
								globalFieldWrapper={CardFieldWrapper}
								onCancel={() => {
									onOpenChange(false);
									registrarForm.reset();
									vincularForm.reset();
								}}
							/>
						) : (
							<GenericForm<RegistrarFamiliarValues>
								formMethods={registrarForm}
								schema={registrarFamiliarSchema}
								formSections={registrarSections}
								onSubmit={onRegistrarSubmit}
								submitButtonText={
									_isPending ? "PROCESANDO…" : "REGISTRAR FAMILIAR"
								}
								isLoading={_isPending}
								isDisabled={
									yaEnGrupo ||
									isSearching ||
									esTitular ||
									tienePrivilegiosIndependientes
								}
								globalFieldWrapper={CardFieldWrapper}
								onCancel={() => {
									onOpenChange(false);
									registrarForm.reset();
									vincularForm.reset();
								}}
								customFields={
									{
										foto_frontal: (methods: any) => (
											<div className="mt-2 text-left">
												<SmartFileField
													control={methods.control}
													name="foto_frontal"
													label="Foto Frontal DNI"
													error={methods.formState.errors.foto_frontal as any}
													description="Sube una foto clara del frente del documento."
												/>
											</div>
										),
									} as any
								}
							/>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
