"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepDateSelection() {
	const { tipoVisita, fechas, setFechas, setPaso } =
		useVisitaRegistrationStore();

	const handleSelect = (range: any) => {
		if (tipoVisita === "PASE_DIARIO") {
			// Para Pase Diario solo tomamos una fecha
			setFechas(range || null, range || null);
		} else {
			// Para Bungalow es un rango
			setFechas(range?.from || null, range?.to || null);
		}
	};

	const isNextDisabled =
		!fechas.start || (tipoVisita === "BUNGALOW" && !fechas.end);

	return (
		<div className="max-w-5xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col lg:flex-row gap-8 items-start">
				{/* Calendar Card */}
				<Card className="flex-1 rounded-[32px] border-gray-100 shadow-sm overflow-hidden">
					<CardHeader className="p-8 pb-4 bg-gray-50/50">
						<CardTitle className="text-2xl font-black text-[#2C3A2C] flex items-center gap-3">
							<div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border">
								<Info className="h-5 w-5 text-amber-500" />
							</div>
							{tipoVisita === "PASE_DIARIO"
								? "Selecciona el día de tu visita"
								: "Periodo de estadía en Bungalow"}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 md:p-12 flex justify-center bg-white">
						<Calendar
							mode={tipoVisita === "PASE_DIARIO" ? "single" : "range"}
							selected={
								tipoVisita === "PASE_DIARIO"
									? fechas.start || undefined
									: ({
											from: fechas.start || undefined,
											to: fechas.end || undefined,
										} as any)
							}
							onSelect={handleSelect}
							required={true}
							locale={es}
							disabled={(date) =>
								date < new Date(new Date().setHours(0, 0, 0, 0))
							}
							className="rounded-2xl border-none p-0 scale-110"
							classNames={{
								month: "space-y-4 w-full",
								caption: "flex justify-center pt-1 relative items-center mb-4",
								caption_label:
									"text-sm font-black text-[#2C3A2C] uppercase tracking-wider",
								nav: "space-x-1 flex items-center",
								nav_button:
									"h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
								table: "w-full border-collapse space-y-1",
								head_row: "flex w-full",
								head_cell:
									"text-muted-foreground rounded-md w-full font-bold text-[10px] uppercase",
								row: "flex w-full mt-2",
								cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
								day: "h-11 w-11 p-0 font-bold aria-selected:opacity-100 rounded-xl hover:bg-gray-100 transition-all",
								day_selected:
									"bg-amber-500 text-white hover:bg-amber-600 hover:text-white focus:bg-amber-500 focus:text-white",
								day_today: "bg-gray-100 text-[#2C3A2C]",
								day_outside: "text-muted-foreground opacity-30",
								day_disabled:
									"text-muted-foreground opacity-10 cursor-not-allowed",
								day_range_middle:
									"aria-selected:bg-amber-50 aria-selected:text-amber-900 rounded-none",
								day_hidden: "invisible",
							}}
						/>
					</CardContent>
				</Card>

				{/* Side Info & Actions */}
				<div className="w-full lg:w-96 space-y-6">
					<div className="p-8 bg-[#2C3A2C] rounded-[32px] text-white shadow-xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
							<CalendarIcon className="h-24 w-24" />
						</div>

						<p className="text-[10px] uppercase font-black text-amber-400 mb-6 tracking-widest">
							Resumen de Fecha
						</p>

						<div className="space-y-6">
							<div>
								<span className="text-white/60 text-xs block mb-1">
									{tipoVisita === "BUNGALOW"
										? "Fecha de Ingreso"
										: "Fecha de Visita"}
								</span>
								<span className="text-xl font-black">
									{fechas.start
										? format(fechas.start, "PPP", { locale: es })
										: "—"}
								</span>
							</div>

							{tipoVisita === "BUNGALOW" && (
								<div className="pt-4 border-t border-white/10">
									<span className="text-white/60 text-xs block mb-1">
										Fecha de Salida
									</span>
									<span className="text-xl font-black">
										{fechas.end
											? format(fechas.end, "PPP", { locale: es })
											: "—"}
									</span>
								</div>
							)}
						</div>

						<Button
							disabled={isNextDisabled}
							onClick={() => setPaso(3)}
							className="w-full h-14 rounded-2xl font-black text-lg bg-amber-500 hover:bg-amber-600 text-white mt-10 shadow-lg shadow-amber-900/20"
						>
							Continuar <ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</div>

					<Card className="rounded-[24px] bg-white border-gray-100 shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-start gap-3">
								<div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
									<Info className="h-4 w-4 text-amber-600" />
								</div>
								<div className="text-sm">
									<p className="font-bold text-[#2C3A2C] mb-1">Aviso</p>
									<p className="text-muted-foreground leading-relaxed">
										{tipoVisita === "PASE_DIARIO"
											? "Los pases solo son válidos para el día seleccionado."
											: "El precio del bungalow varía según sea día de semana o fin de semana."}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
