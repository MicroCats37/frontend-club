"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	type DefaultValues,
	type FieldValues,
	type UseFormReturn,
	useForm,
} from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { handleApiError } from "@/lib/api/error-handler";
import {
	type FieldWrapperProps,
	type FormField,
	type FormSection,
	GenericInput,
	type SectionWrapperProps,
} from "./GenericInput";

// =====================================================================
// WRAPPERS INTERNOS POR DEFECTO
// =====================================================================

// 1. Ghost (Invisible): Para formularios planos/simples
const GhostWrapper: React.FC<SectionWrapperProps> = ({
	children,
	title,
	className,
}) => (
	<div className={`w-full ${className || ""}`}>
		{title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
		{children}
	</div>
);

// 2. Card (Estándar): Diseño con borde y sombra
const CardWrapper: React.FC<SectionWrapperProps> = ({
	children,
	title,
	description,
	icon: Icon,
	className,
}) => (
	<div className={`border rounded-xl p-3 md:p-4 bg-card shadow-sm ${className || ""}`}>
		<div className="flex flex-col gap-0.5 mb-3 pb-2 border-b">
			<div className="flex items-center gap-2">
				{Icon && (
					<div className="p-1 bg-primary/10 rounded-md text-primary">
						<Icon className="w-3.5 h-3.5" />
					</div>
				)}
				<h3 className="font-semibold text-sm md:text-base tracking-tight">{title}</h3>
			</div>
			{description && (
				<p className="text-[10px] md:text-xs text-muted-foreground ml-0.5">{description}</p>
			)}
		</div>
		{children}
	</div>
);

// =====================================================================
// COMPONENTE PRINCIPAL
// =====================================================================

type CustomFieldRenderer<T extends FieldValues> = (
	methods: UseFormReturn<T>,
) => React.ReactNode;

export interface GenericFormProps<T extends FieldValues> {
	// A. DATOS (Modo Automático)
	formSections?: FormSection[]; // Estructura compleja
	fields?: FormField[]; // Estructura simple (plana)

	// B. CONTROL LÓGICO
	schema: z.ZodType<T, any, any>;
	onSubmit: (data: T) => any | Promise<any>;
	initialData?: DefaultValues<T>;

	// C. PERSONALIZACIÓN UI (Modo Híbrido)
	title?: string;
	description?: string;
	submitButtonText?: string;
	cancelButtonText?: string;
	onCancel?: () => void;
	isLoading?: boolean;
	isDisabled?: boolean;
	activateSubmitButton?: boolean;
	formMethods?: UseFormReturn<T>;

	// Inyecciones UI (Wrappers y Custom Footer)
	globalSectionWrapper?: React.ComponentType<SectionWrapperProps>; // Cambia todas las Cards
	globalFieldWrapper?: React.ComponentType<FieldWrapperProps>; // Cambia todos los Inputs
	renderFooter?: (props: {
		// Cambia los botones
		isSubmitting: boolean;
		onCancel?: () => void;
		onSubmit: () => void;
		methods: UseFormReturn<T>;
	}) => React.ReactNode;

	formClassName?: string; // Clases para el tag <form>

	// D. CONTROL TOTAL (Modo Manual)
	// Si usas esto, tú dibujas TODO el HTML dentro (inputs, layouts y botones).
	children?: (props: {
		methods: UseFormReturn<T>;
		isSubmitting: boolean;
		onSubmit: () => void;
		submissionMessage: { type: "success" | "error"; message: string } | null;
	}) => React.ReactNode;

	// E. EXTRAS
	onFieldChange?: (fieldName: string, value: any) => void;
	customFields?: Record<string, CustomFieldRenderer<T>>;
}

export const GenericForm = <T extends FieldValues>({
	formSections,
	fields,
	schema,
	onSubmit,
	title,
	description,
	initialData,
	submitButtonText = "Enviar",
	cancelButtonText = "Cancelar",
	onCancel,
	onFieldChange,
	customFields = {},
	isLoading = false,
	isDisabled = false,
	activateSubmitButton = true,
	formMethods,

	// Custom injections
	globalSectionWrapper,
	globalFieldWrapper,
	renderFooter,
	formClassName,
	children, // Render prop para modo manual
}: GenericFormProps<T>) => {
	// 1. NORMALIZACIÓN (Solo importa si NO usamos 'children')
	const { normalizedSections, allFieldsFlat } = useMemo(() => {
		// Si estamos en modo manual total (children), solo necesitamos una lista plana para validación básica
		// pero si no nos pasan nada, asumimos vacío.
		let sections: FormSection[] = [];
		let flatFields: FormField[] = [];

		if (formSections && formSections.length > 0) {
			sections = formSections;
			flatFields = formSections.flatMap((s) => s.fields);
		} else if (fields && fields.length > 0) {
			// Modo simple: convertimos a sección fantasma
			sections = [{ title: "", fields: fields, wrapper: GhostWrapper }];
			flatFields = fields;
		}
		return { normalizedSections: sections, allFieldsFlat: flatFields };
	}, [formSections, fields]);

	// 2. SETUP DE REACT HOOK FORM
	const defaultValues = { ...initialData } as DefaultValues<T>;

	// Rellenamos defaults basados en configuración si no existen en initialData
	allFieldsFlat.forEach((field) => {
		if (
			defaultValues &&
			!(field.name in defaultValues) &&
			field.defaultValue !== undefined
		) {
			defaultValues[field.name] =
				field.type === "radio" || field.type === "select"
					? String(field.defaultValue)
					: field.defaultValue;
		}
	});

	const internalMethods = useForm<T>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	const methods = formMethods || internalMethods;

	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors, isSubmitting },
	} = methods;

	const [submissionMessage, setSubmissionMessage] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		if (onFieldChange) {
			const subscription = watch((value, { name }) => {
				if (name) onFieldChange(name, value[name as string]);
			});
			return () => subscription.unsubscribe();
		}
	}, [watch, onFieldChange]);

	const formValues = watch();

	const isHidden = (field: FormField) => {
		if (typeof field.hidden === "function") {
			return field.hidden(formValues);
		}
		return !!field.hidden;
	};

	// 3. HANDLER DE SUBMIT
	const handleFormSubmit = async (data: FieldValues) => {
		setSubmissionMessage(null);
		const processedData: any = {};

		// Procesamiento de tipos (Number, Boolean) antes de enviar
		for (const key in data) {
			// Buscamos la config del campo (si existe en modo automático)
			const fieldConfig = allFieldsFlat.find((f) => f.name === key);

			// Si no hay config (modo manual total sin fields definidos), pasamos el dato crudo
			if (!fieldConfig) {
				processedData[key] = data[key];
				continue;
			}

			if (fieldConfig.type === "custom") {
				processedData[key] = data[key];
				continue;
			}

			if (fieldConfig.type === "number") {
				processedData[key] =
					data[key] === null || data[key] === ""
						? undefined
						: Number(data[key]);
			} else if (fieldConfig.type === "checkbox") {
				processedData[key] = Boolean(data[key]);
			} else if (
				fieldConfig.type === "radio" ||
				fieldConfig.type === "select"
			) {
				const optionValue = fieldConfig.options?.find(
					(opt) => String(opt.value) === String(data[key]),
				)?.value;
				processedData[key] = optionValue ?? data[key];
			} else {
				processedData[key] = data[key];
			}
		}

		try {
			await onSubmit(processedData as T);
			// toast.success("¡Operación realizada con éxito!");
			setSubmissionMessage({ type: "success", message: "¡Operación exitosa!" });
		} catch (e: any) {
			const msg = handleApiError(e);
			setSubmissionMessage({ type: "error", message: msg });
			// NOTA: No disparamos toast.error(msg) aquí porque los hooks generados
			// (useApiCreate) ya disparan el toast internamente.
			// Si el onSubmit es manual y no dispara toast, el usuario verá el mensaje
			// detallado en el cuerpo del formulario (setSubmissionMessage).
			throw e;
		}
	};

	const isLocked = isSubmitting || isLoading || isDisabled;
	const onSubmitFn = handleSubmit(handleFormSubmit, (errs) => {
		console.warn("🔥 Error de validación Zod:", errs);

		// Función recursiva para extraer todos los mensajes de error de un objeto anidado
		const showAllErrors = (obj: any) => {
			if (!obj) return;
			if (obj.message && typeof obj.message === "string") {
				toast.error(obj.message);
				return;
			}
			Object.values(obj).forEach((val) => showAllErrors(val));
		};

		showAllErrors(errs);
	});

	// -------------------------------------------------------------------
	// RENDERIZADO
	// -------------------------------------------------------------------

	// A. MODO MANUAL (CONTROL TOTAL DEL USUARIO)
	// Si se pasa 'children' como función, GenericForm delega todo el renderizado.
	if (children) {
		return (
			<Form {...methods}>
				<form onSubmit={onSubmitFn} className={formClassName}>
					{children({
						methods,
						isSubmitting: isLocked,
						onSubmit: onSubmitFn,
						submissionMessage,
					})}
				</form>
			</Form>
		);
	}

	// B. MODO AUTOMÁTICO / HÍBRIDO (SECCIONES Y CARDS)
	const DefaultFooter = (
		<div className="flex justify-end gap-3 mt-4">
			{onCancel && (
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isLocked}
				>
					{cancelButtonText}
				</Button>
			)}
			{activateSubmitButton && (
				<Button type="submit" disabled={isLocked}>
					{isLocked && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{submitButtonText}
				</Button>
			)}
		</div>
	);

	return (
		<div className="w-full mx-auto border-0 shadow-none py-0 bg-none opacity-100">
			{(title || description) && (
				<CardHeader className="px-0 pb-6">
					{title && <CardTitle className="text-2xl">{title}</CardTitle>}
					{description && <CardDescription>{description}</CardDescription>}
				</CardHeader>
			)}
			<CardContent className="px-0 gap-2">
				<Form {...methods}>
					<form
						onSubmit={onSubmitFn}
						className={`space-y-4 ${formClassName || ""}`}
					>
						<fieldset disabled={isLocked} className="space-y-4">
							{normalizedSections.map((section, idx) => {
								// Prioridad Wrapper: Global -> Sección -> Default (Card/Ghost)
								const Container =
									globalSectionWrapper ||
									section.wrapper ||
									(formSections ? CardWrapper : GhostWrapper);

								// Verificar si todos los campos de la sección están ocultos
								const areAllFieldsHidden = section.fields.every((f) =>
									isHidden(f),
								);
								if (areAllFieldsHidden) return null;

								return (
									<Container
										key={`section-${idx}`}
										title={section.title}
										description={section.description}
										icon={section.icon}
										className={section.className}
									>
										<div className=" grid grid-cols-1 md:grid-cols-12 gap-x-4">
											{section.fields.map((field) => {
												const fieldIsHidden = isHidden(field);

												// Custom Fields
												if (customFields[field.name]) {
													if (fieldIsHidden) return null; // Respetar propiedad hidden
													return (
														<div
															key={field.name}
															className={`w-full ${field.containerClassName || "col-span-12"}`}
														>
															{customFields[field.name](methods)}
														</div>
													);
												}

												if (fieldIsHidden) return null;
												// Generic Inputs
												return (
													<GenericInput
														key={field.name}
														field={field}
														register={register as any}
														control={control as any}
														errors={errors}
														FieldWrapper={globalFieldWrapper}
													/>
												);
											})}
										</div>
									</Container>
								);
							})}
						</fieldset>

						{/* Footer Dinámico: O custom, o default */}
						{renderFooter
							? renderFooter({
									isSubmitting: isLocked,
									onCancel,
									onSubmit: onSubmitFn,
									methods,
								})
							: DefaultFooter}
					</form>
				</Form>
			</CardContent>
		</div>
	);
};
