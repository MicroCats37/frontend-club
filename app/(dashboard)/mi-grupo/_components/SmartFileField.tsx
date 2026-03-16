"use client";

import { FileText, Trash2, UploadCloud } from "lucide-react";
import {
	type Control,
	type FieldValues,
	type Path,
	useController,
} from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SmartFileFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label?: string;
	description?: string;
	error?: any;
}

export const SmartFileField = <T extends FieldValues>({
	control,
	name,
	label = "Archivo",
	description,
	error,
}: SmartFileFieldProps<T>) => {
	const {
		field: { value, onChange, ref },
	} = useController({ name, control });

	const isExistingUrl = typeof value === "string" && value.length > 0;

	function isFile(value: unknown): value is File {
		return (
			typeof File !== "undefined" &&
			typeof value === "object" &&
			value !== null &&
			value instanceof File
		);
	}

	const isNewFile = isFile(value);

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center px-1">
				<Label
					className={`font-bold text-[#4A5D4A] ${error ? "text-destructive" : ""}`}
				>
					{label}
				</Label>
				{isExistingUrl && (
					<Badge
						variant="outline"
						className="bg-muted/50 text-muted-foreground"
					>
						Registrado
					</Badge>
				)}
				{isNewFile && (
					<Badge
						variant="outline"
						className="bg-emerald-50 text-emerald-600 border-emerald-200"
					>
						Cargado
					</Badge>
				)}
			</div>

			{!isExistingUrl && (
				<div className="space-y-3">
					<Input
						type="file"
						ref={ref}
						accept="image/*"
						className="cursor-pointer file:text-primary file:font-semibold"
						onChange={(e) => {
							const file = e.target.files?.[0];
							onChange(file || null);
						}}
					/>

					{isNewFile && (
						<div className="flex items-center justify-between p-2 bg-green-50 text-green-700 rounded border border-green-100 text-sm animate-in fade-in zoom-in duration-200">
							<span className="flex items-center gap-2 truncate">
								<UploadCloud className="h-4 w-4" />
								{value.name}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-6 w-6 text-green-700 hover:text-red-600"
								onClick={() => onChange(null)}
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						</div>
					)}
				</div>
			)}

			{isExistingUrl && (
				<div className="flex items-center gap-3 p-3 border rounded-md bg-[#F8FAF8] border-[#E0E7E0]">
					<div className="p-2 bg-white border border-[#E0E7E0] rounded shadow-sm">
						<FileText className="h-5 w-5 text-primary" />
					</div>
					<div className="flex-1 overflow-hidden">
						<p className="text-sm font-bold text-[#2C3A2C] truncate whitespace-nowrap overflow-hidden">
							DNI Registrado
						</p>
						<p className="text-xs text-muted-foreground italic">
							Documento verificado anteriormente
						</p>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-primary hover:text-primary/80 font-bold"
						onClick={() => onChange(null as any)}
					>
						Cambiar
					</Button>
				</div>
			)}

			{description && (
				<p className="text-xs text-muted-foreground px-1">{description}</p>
			)}
			{error && (
				<p className="text-sm font-medium text-destructive px-1">
					{error.message}
				</p>
			)}
		</div>
	);
};
