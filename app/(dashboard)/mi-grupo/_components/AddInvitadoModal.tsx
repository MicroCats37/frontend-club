"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Calendar,
	Fingerprint,
	Tag,
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
	useAddContacto,
	useBuscarPersona,
	useVincularPorDni,
} from "@/hooks/auth/useGrupoActions";
import { buildApiPayload } from "@/utils/payload/format";
import { SmartFileField } from "./SmartFileField";

const registrarInvitadoSchema = z.object({
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

type RegistrarInvitadoValues = z.infer<typeof registrarInvitadoSchema>;

const vincularInvitadoSchema = z.object({
	persona: z.object({
		dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
	}),
	etiqueta: z.string().min(1, "La etiqueta es obligatoria"),
});

type VincularInvitadoValues = z.infer<typeof vincularInvitadoSchema>;

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
	const [personaEncontrada, setPersonaEncontrada] = useState(false);
	const [yaEnGrupo, setYaEnGrupo] = useState(false);

	const { mutateAsync: addContacto, isPending: isAdding } = useAddContacto();
	const { mutateAsync: vincularPorDni, isPending: isLinking } =
		useVincularPorDni();
	const { mutateAsync: buscarPersona, isPending: isSearching } =
		useBuscarPersona();

	const registrarForm = useForm<RegistrarInvitadoValues>({
		resolver: zodResolver(registrarInvitadoSchema),
		defaultValues: {
			persona: {
				dni: "",
				nombres: "",
				apellidos: "",
				fecha_nacimiento: "",
				genero: "M" as any,
			},
			etiqueta: "Invitado",
		},
	});

	const vincularForm = useForm<VincularInvitadoValues>({
		resolver: zodResolver(vincularInvitadoSchema),
		defaultValues: {
			persona: { dni: "" },
			etiqueta: "Invitado",
		},
	});

	const dniValue = registrarForm.watch("persona.dni");
	const vincularDniValue = vincularForm.watch("persona.dni");

	// Sincronizar DNI y Etiqueta entre formularios
	useEffect(() => {
		if (personaEncontrada) {
			// Si persona encontrada, el formulario de vínculo manda
			if (dniValue !== vincularDniValue) {
				registrarForm.setValue("persona.dni", vincularDniValue);
			}
			const vincularEtiqueta = vincularForm.getValues("etiqueta");
			if (registrarForm.getValues("etiqueta") !== vincularEtiqueta) {
				registrarForm.setValue("etiqueta", vincularEtiqueta);
			}
		} else {
			// Si no encontrada (flujo registro), el formulario de registro manda
			if (vincularDniValue !== dniValue) {
				vincularForm.setValue("persona.dni", dniValue);
			}
			const registrarEtiqueta = registrarForm.getValues("etiqueta");
			if (vincularForm.getValues("etiqueta") !== registrarEtiqueta) {
				vincularForm.setValue("etiqueta", registrarEtiqueta);
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

					// Pre-llenar vincular form
					vincularForm.setValue("persona.dni", activeDni);

					if (res.ya_en_grupo) {
						toast.info("Esta persona ya forma parte de tu grupo.");
					} else {
						toast.success(
							`Persona encontrada: ${res.nombres} ${res.apellidos}`,
						);
					}
				} else {
					setPersonaEncontrada(false);
					setYaEnGrupo(false);
					// Si veníamos de una persona encontrada y ahora no lo está,
					// nos aseguramos que el registrarForm tenga el DNI
					registrarForm.setValue("persona.dni", activeDni);
				}
			};
			triggerSearch();
		} else {
			setPersonaEncontrada(false);
			setYaEnGrupo(false);
		}
	}, [
		activeDni,
		buscarPersona, // Si veníamos de una persona encontrada y ahora no lo está,
		// nos aseguramos que el registrarForm tenga el DNI
		registrarForm, // Pre-llenar vincular form
		vincularForm,
	]);

	const _isPending = isAdding || isLinking || isSearching;

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
			title: "Detalles del Contacto",
			description: "Información adicional para tu grupo",
			icon: Users,
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
			],
		},
	];

	const vincularSections: FormSection[] = [
		{
			title: "Vincular Persona",
			description: "La persona ya existe en el sistema",
			icon: Users,
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
					name: "etiqueta",
					label: "Etiqueta",
					type: "text",
					icon: Tag,
					placeholder: "Ej: Amigo, Colega",
					required: true,
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

	async function onRegistrarSubmit(values: RegistrarInvitadoValues) {
		if (yaEnGrupo) {
			toast.warning("Esta persona ya está en tu grupo.");
			return;
		}
		try {
			const payload = buildApiPayload({
				...values,
				tipo_vinculo: "CONTACTO",
			});
			await addContacto(payload);
			toast.success("Invitado registrado exitosamente.");
			onOpenChange(false);
			registrarForm.reset();
			vincularForm.reset();
		} catch (error: any) {
			toast.error(
				error.response?.data?.detail || "Error al registrar invitado.",
			);
		}
	}

	async function onVincularSubmit(values: VincularInvitadoValues) {
		if (yaEnGrupo) {
			toast.warning("Esta persona ya está en tu grupo.");
			return;
		}
		try {
			await vincularPorDni({
				dni: values.persona.dni,
				tipo: "CONTACTO",
				etiqueta: values.etiqueta,
			});
			toast.success("Persona vinculada exitosamente.");
			onOpenChange(false);
			registrarForm.reset();
			vincularForm.reset();
		} catch (error: any) {
			toast.error(error.response?.data?.detail || "Error al vincular persona.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden p-0 border-none shadow-2xl ring-0 focus:outline-none">
				<div className="h-2 w-full bg-emerald-500" />

				<div className="p-4 md:p-5">
					<DialogHeader className="flex-row items-center gap-4 space-y-0">
						<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 shrink-0">
							<Users className="h-5 w-5" />
						</div>
						<div className="text-left">
							<DialogTitle className="text-lg md:text-xl font-black text-[#2C3A2C] leading-tight">
								Agregar Invitado
							</DialogTitle>
							<DialogDescription className="text-xs text-[#8BA18B]">
								Añade a un contacto o amigo a tu grupo.
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="mt-4">
						{personaEncontrada && !yaEnGrupo && (
							<div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
									<Users className="h-3.5 w-3.5" />
								</div>
								<div>
									<p className="text-xs text-blue-900 font-bold leading-tight">
										¡Persona encontrada!
									</p>
									<p className="text-[10px] text-blue-700 leading-tight">
										Esta persona ya existe. Indica la etiqueta para vincularla.
									</p>
								</div>
							</div>
						)}

						{yaEnGrupo && (
							<div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 mb-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-4 duration-300">
								<div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
									<Users className="h-3.5 w-3.5" />
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
							<GenericForm<VincularInvitadoValues>
								formMethods={vincularForm}
								schema={vincularInvitadoSchema}
								formSections={vincularSections}
								onSubmit={onVincularSubmit}
								submitButtonText={
									_isPending ? "PROCESANDO…" : "VINCULAR PERSONA"
								}
								isLoading={_isPending}
								isDisabled={yaEnGrupo || isSearching}
								globalFieldWrapper={CardFieldWrapper}
								onCancel={() => {
									onOpenChange(false);
									registrarForm.reset();
									vincularForm.reset();
								}}
							/>
						) : (
							<GenericForm<RegistrarInvitadoValues>
								formMethods={registrarForm}
								schema={registrarInvitadoSchema}
								formSections={registrarSections}
								onSubmit={onRegistrarSubmit}
								submitButtonText={
									_isPending ? "PROCESANDO…" : "REGISTRAR INVITADO"
								}
								isLoading={_isPending}
								isDisabled={yaEnGrupo || isSearching}
								globalFieldWrapper={CardFieldWrapper}
								onCancel={() => {
									onOpenChange(false);
									registrarForm.reset();
									vincularForm.reset();
								}}
								customFields={
									{
										foto_frontal: (methods: any) => (
											<div className="mt-2">
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
