"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	date?: Date;
	setDate: (date?: Date) => void;
	placeholder?: string;
	disabled?: boolean;
	isDateDisabled?: (date: Date) => boolean;
	minDate?: Date;
	maxDate?: Date;
	className?: string;
}

export function DatePickerCustom({
	date,
	setDate,
	placeholder = "Seleccionar fecha",
	disabled = false,
	isDateDisabled,
	minDate,
	maxDate,
	className,
}: DatePickerProps) {
	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal h-12 rounded-xl bg-muted/5 border-muted-foreground/10",
							!date && "text-muted-foreground",
							disabled && "opacity-50 cursor-not-allowed",
						)}
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? (
							format(date, "PPP", { locale: es })
						) : (
							<span>{placeholder}</span>
						)}
						{date && !disabled && (
							<X
								className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
								onClick={(e) => {
									e.stopPropagation();
									setDate(undefined);
								}}
							/>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto p-0 rounded-2xl overflow-hidden"
					align="start"
				>
					<Calendar
						mode="single"
						selected={date}
						onSelect={(date) => {
							setDate(date || undefined);
						}}
						disabled={(date) => {
							// 1. Validar si está deshabilitado por lógica externa
							if (isDateDisabled?.(date)) return true;

							// 2. Validar rango min/max (sin mutar originales)
							if (minDate) {
								const min = new Date(minDate);
								min.setHours(0, 0, 0, 0);
								if (date < min) return true;
							}
							if (maxDate) {
								const max = new Date(maxDate);
								max.setHours(23, 59, 59, 999);
								if (date > max) return true;
							}
							return false;
						}}
						initialFocus
						locale={es}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
