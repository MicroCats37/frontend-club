"use client";

import type { LucideIcon } from "lucide-react";
import type React from "react";
import type {
	Control,
	FieldErrors,
	FieldValues,
	UseFormRegister,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { getInputComponent } from "./inputs";

// =====================================================================
// 1. DEFINICIÓN DE WRAPPERS (Interfaces para Inyección de Estilos)
// =====================================================================

/** Para envolver una SECCIÓN completa (Card, Acordeón, Div invisible) */
export interface SectionWrapperProps {
	children: React.ReactNode;
	title?: string;
	description?: string;
	icon?: LucideIcon;
	className?: string;
}

/** Para envolver un INPUT individual (Label + Input + Error) */
export interface FieldWrapperProps {
	children: React.ReactNode;
	field: FormField;
	error?: { message?: string };
	labelId: string;
}

/** Wrapper por defecto: Diseño vertical estándar */
export const DefaultFieldWrapper: React.FC<FieldWrapperProps> = ({
	children,
	field,
	error,
	labelId,
}) => {
	return (
		<div className={`space-y-2 ${field.containerClassName || "col-span-12"}`}>
			{!field.hidden && (
				<Label htmlFor={labelId} className="text-sm font-medium">
					{field.label}
					{field.required && <span className="text-destructive ml-1">*</span>}
				</Label>
			)}
			{children}
			{error && !field.hidden && (
				<p className="text-sm text-destructive font-medium">{error.message}</p>
			)}
			{field.description && !field.hidden && field.type !== "checkbox" && (
				<p className="text-sm text-muted-foreground">{field.description}</p>
			)}
		</div>
	);
};

// =====================================================================
// 2. TIPOS DE DATOS
// =====================================================================

export type FieldType =
	| "text"
	| "password"
	| "number"
	| "checkbox"
	| "radio"
	| "select"
	| "textarea"
	| "hidden"
	| "date"
	| "custom";

export interface FormField {
	name: string;
	label: string;
	type: FieldType;
	defaultValue?: unknown;
	options?: readonly { label: string; value: string | number | boolean }[];
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	isLoading?: boolean;
	hidden?: boolean;
	valueType?: "string" | "number" | "boolean";

	// Propiedades Visuales
	icon?: LucideIcon;
	className?: string;
	containerClassName?: string;
	required?: boolean;
}

export interface FormSection {
	title: string;
	icon?: LucideIcon;
	description?: string;
	className?: string;
	fields: FormField[];
	wrapper?: React.ComponentType<SectionWrapperProps>;
}

// =====================================================================
// 3. COMPONENTE GENERIC INPUT (Refactorizado con Registry)
// =====================================================================

interface GenericInputProps {
	field: FormField;
	register: UseFormRegister<FieldValues>;
	control: Control<FieldValues>;
	errors: FieldErrors;
	FieldWrapper?: React.ComponentType<FieldWrapperProps>;
}

export const GenericInput: React.FC<GenericInputProps> = ({
	field,
	register,
	control,
	errors,
	FieldWrapper = DefaultFieldWrapper,
}) => {
	const error = errors[field.name] as { message?: string } | undefined;
	const labelId = field.name;

	// Skip custom fields (se manejan externamente via customFields prop)
	if (field.type === "custom") return null;

	// Hidden inputs no necesitan wrapper
	if (field.hidden || field.type === "hidden") {
		const HiddenInput = getInputComponent("hidden");
		return (
			<HiddenInput
				field={field}
				register={register}
				control={control}
				error={error}
				id={labelId}
			/>
		);
	}

	// Obtener componente del registry
	const InputComponent = getInputComponent(field.type);

	// Renderizar input dentro del wrapper
	return (
		<FieldWrapper field={field} error={error} labelId={labelId}>
			<InputComponent
				field={field}
				register={register}
				control={control}
				error={error}
				id={labelId}
			/>
		</FieldWrapper>
	);
};
