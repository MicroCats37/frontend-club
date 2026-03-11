import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormField } from "../GenericInput";

interface FieldWrapperProps {
	children: React.ReactNode;
	field: FormField;
	error?: any;
	labelId: string;
}

/**
 * Wrapper moderno estilo "Card/Stack".
 * - Label superior estático (no flotante).
 * - Input con bordes redondeados (estándar shadcn).
 * - Mensajes de error claros abajo.
 */
export const CardFieldWrapper = ({
	children,
	field,
	error,
	labelId,
}: FieldWrapperProps) => {
	return (
		<div
			className={cn(
				"flex flex-col gap-1.5", // Espaciado vertical consistente
				field.containerClassName || "col-span-12",
			)}
		>
			{/* Label Superior Estándar */}
			{!field.hidden && (
				<Label
					htmlFor={labelId}
					className={cn(
						"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
						error ? "text-destructive" : "text-foreground",
					)}
				>
					{field.label}
					{field.required && <span className="text-destructive ml-1">*</span>}
				</Label>
			)}

			{/* Input Container (Renderiza el input tal cual, sin overrides agresivos) */}
			<div className="relative">{children}</div>

			{/* Mensaje de Error */}
			<div className="min-h-[20px]">
				{error && (
					<p className="text-[0.8rem] font-medium text-destructive animate-in slide-in-from-top-1 fade-in-0">
						{error.message}
					</p>
				)}
			</div>
		</div>
	);
};
