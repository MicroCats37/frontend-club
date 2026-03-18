"use client";

import {
	addDays,
	format,
	getISODay,
	isSameDay,
	parseISO,
	startOfISOWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import {
	AlertCircle,
	ArrowRight,
	Calendar as CalendarIcon,
	Info,
	Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTipoTarifa } from "@/hooks/useTarifas";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepDateSelection() {
	const {
		tipoVisita,
		fechas,
		setFechas,
		noches,
		setNoches,
		setPaso,
		tipoTarifaId,
		selectedTariff,
		setSelectedTariff,
	} = useVisitaRegistrationStore();

	const [showValidation, setShowValidation] = useState(false);
	const [validationMsg, setValidationMsg] = useState("");

	// Optimizamos: No pedimos la lista completa si ya tenemos el objeto o el ID
	const { data: fetchedTariff } = useTipoTarifa(
		selectedTariff ? null : tipoTarifaId,
	);

	// Sincronizar el store si recuperamos la tarifa por ID
	useEffect(() => {
		if (fetchedTariff && !selectedTariff) {
			setSelectedTariff(fetchedTariff);
		}
	}, [fetchedTariff, selectedTariff, setSelectedTariff]);

	const activeTariff = selectedTariff || fetchedTariff;

	const getDatesForRule = (date: Date, rule: any): Date[] => {
		if (!rule) return [];
		const config = rule.config || {};
		let packageDates: Date[] = [];

		if (rule.motor === "DIAS_SEMANA" && Array.isArray(config.dias)) {
			const weekStart = startOfISOWeek(date);
			packageDates = config.dias.map((d: number) => addDays(weekStart, d - 1));
		} else if (
			rule.motor === "FECHAS_PUNTUALES" &&
			Array.isArray(config.fechas)
		) {
			packageDates = config.fechas.map((d: string) => parseISO(d));
		} else if (
			rule.motor === "RANGO" &&
			typeof config.desde === "string" &&
			typeof config.hasta === "string"
		) {
			let curr = parseISO(config.desde);
			const end = parseISO(config.hasta);
			while (curr <= end) {
				packageDates.push(new Date(curr));
				curr = addDays(curr, 1);
			}
		}
		return packageDates;
	};

	const handleSelect = (val: any) => {
		if (tipoVisita === "PASE_DIARIO") {
			const date = val as Date;
			if (date) {
				setFechas(date, date);
			} else {
				setFechas(null, null);
			}
		} else {
			// BUNGALOW mode: Range based
			const range = val as { from?: Date; to?: Date };

			if (!range || !range.from) {
				setFechas(null, null);
				setNoches([]);
				return;
			}

			let start = range.from;
			let end = range.to || range.from;

			// Smart Validation: Check if start or end belongs to a mandatory package
			if (activeTariff?.reglas) {
				// Check start date's rule
				const startStr = format(start, "yyyy-MM-dd");
				const startDay = getISODay(start);
				const startRule = activeTariff.reglas.find((r: any) => {
					if (r.motor === "DIAS_SEMANA")
						return r.config.dias?.includes(startDay);
					if (r.motor === "FECHAS_PUNTUALES")
						return r.config.fechas?.includes(startStr);
					if (r.motor === "RANGO")
						return startStr >= r.config.desde && startStr <= r.config.hasta;
					return false;
				});

				if (startRule?.es_paquete_obligatorio) {
					const pkg = getDatesForRule(start, startRule);
					if (pkg.length > 0) {
						const pkgStart = pkg[0];
						if (pkgStart < start) start = pkgStart;
					}
				}

				// Check end date's rule
				const endStr = format(end, "yyyy-MM-dd");
				const endDay = getISODay(end);
				const endRule = activeTariff.reglas.find((r: any) => {
					if (r.motor === "DIAS_SEMANA") return r.config.dias?.includes(endDay);
					if (r.motor === "FECHAS_PUNTUALES")
						return r.config.fechas?.includes(endStr);
					if (r.motor === "RANGO")
						return endStr >= r.config.desde && endStr <= r.config.hasta;
					return false;
				});

				if (endRule?.es_paquete_obligatorio) {
					const pkg = getDatesForRule(end, endRule);
					if (pkg.length > 0) {
						const pkgEnd = pkg[pkg.length - 1];
						if (pkgEnd > end) end = pkgEnd;
					}
				}
			}

			// Sync Store
			setFechas(start, end);

			// Generate nights array
			const newNoches: Date[] = [];
			let curr = new Date(start);
			while (curr <= end) {
				newNoches.push(new Date(curr));
				curr = addDays(curr, 1);
			}
			setNoches(newNoches);
		}
	};

	const handlePackageRemoval = (_dateToRemove: Date) => {
		// In range mode, removing a date usually resets the whole range or collapses it.
		// For simplicity, we reset the selection if they "delete" from summary
		setFechas(null, null);
		setNoches([]);
	};

	const checkIncompleteRule = () => {
		if (
			tipoVisita !== "BUNGALOW" ||
			!activeTariff ||
			!fechas.start ||
			!fechas.end
		)
			return null;

		const nights: Date[] = [];
		let curr = new Date(fechas.start);
		while (curr <= fechas.end) {
			nights.push(new Date(curr));
			curr = addDays(curr, 1);
		}

		for (const noche of nights) {
			const dayNum = getISODay(noche);
			const dStr = format(noche, "yyyy-MM-dd");
			const rule = activeTariff.reglas?.find((r: any) => {
				if (r.motor === "DIAS_SEMANA") return r.config.dias?.includes(dayNum);
				if (r.motor === "FECHAS_PUNTUALES")
					return r.config.fechas?.includes(dStr);
				if (r.motor === "RANGO")
					return dStr >= r.config.desde && dStr <= r.config.hasta;
				return false;
			});

			if (rule?.es_paquete_obligatorio) {
				const pkg = getDatesForRule(noche, rule);
				const isComplete = pkg.every((pd) =>
					nights.some((n) => isSameDay(n, pd)),
				);
				if (!isComplete) return rule;
			}
		}
		return null;
	};

	const handleContinue = () => {
		if (tipoVisita === "PASE_DIARIO") {
			if (fechas.start) setPaso(3);
			return;
		}

		if (!fechas.start || !fechas.end) return;

		const incomplete = checkIncompleteRule();
		if (incomplete) {
			setValidationMsg(
				`La tarifa "${incomplete.nombre || "Seleccionada"}" requiere que selecciones todas las noches del paquete.`,
			);
			setShowValidation(true);
			return;
		}

		setPaso(3);
	};

	const isNextDisabled =
		tipoVisita === "PASE_DIARIO" ? !fechas.start : !fechas.start || !fechas.end;

	const calendarDisabled = (date: Date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (date < today) return true;

		const day = getISODay(date);
		
		// Lunes siempre está bloqueado (mantenimiento)
		if (day === 1) return true;
		
		// Domingos solo bloqueados para BUNGALOW (pernoctación)
		if (day === 7 && tipoVisita === "BUNGALOW") return true;

		if (tipoVisita === "BUNGALOW") {
			if (!activeTariff) return true;
			const hasMatchingRule = activeTariff.reglas?.some((regla: any) => {
				const dStr = format(date, "yyyy-MM-dd");
				const rConfig = regla.config || {};
				if (regla.motor === "DIAS_SEMANA") return rConfig.dias?.includes(day);
				if (regla.motor === "FECHAS_PUNTUALES")
					return rConfig.fechas?.includes(dStr);
				if (regla.motor === "RANGO")
					return rConfig.desde && rConfig.hasta
						? dStr >= rConfig.desde && dStr <= rConfig.hasta
						: false;
				return false;
			});
			if (!hasMatchingRule) return true;
		}
		return false;
	};

	const calendarClassNames = {
		month: "space-y-4 w-full",
		caption: "flex justify-center pt-1 relative items-center mb-4",
		caption_label: "text-sm font-black text-[#2C3A2C] uppercase tracking-wider",
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
			"text-muted-foreground/30 opacity-50 cursor-not-allowed line-through",
		day_range_middle:
			"aria-selected:bg-amber-50 aria-selected:text-amber-900 rounded-none",
		day_hidden: "invisible",
	};

	return (
		<div className="max-w-5xl mx-auto py-2 sm:py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex flex-col lg:flex-row gap-8 items-start">
				<Card className="flex-1 rounded-[24px] sm:rounded-[32px] border-gray-100 shadow-sm overflow-hidden">
					<CardHeader className="p-6 sm:p-8 pb-4 bg-gray-50/50">
						<CardTitle className="text-xl sm:text-2xl font-black text-[#2C3A2C] flex items-center gap-3">
							<div className="h-9 w-9 sm:h-10 sm:w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border">
								<CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
							</div>
							{tipoVisita === "PASE_DIARIO"
								? "Día de tu visita"
								: "Noches de estadía"}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 md:p-12 flex justify-center bg-white overflow-visible">
						{tipoVisita === "PASE_DIARIO" ? (
							<Calendar
								mode="single"
								selected={fechas.start || undefined}
								onSelect={(val: any) => handleSelect(val)}
								required={true}
								locale={es}
								disabled={calendarDisabled}
								className="rounded-2xl border-none p-0 scale-100 sm:scale-110"
								classNames={calendarClassNames}
							/>
						) : (
							<Calendar
								mode="range"
								selected={{
									from: fechas.start || undefined,
									to: fechas.end || undefined,
								}}
								onSelect={(val: any) => handleSelect(val)}
								required={true}
								locale={es}
								disabled={calendarDisabled}
								className="rounded-2xl border-none p-0 scale-100 sm:scale-110"
								classNames={calendarClassNames}
							/>
						)}
					</CardContent>
				</Card>

				<div className="w-full lg:w-96 space-y-6">
					<div className="p-6 sm:p-8 bg-[#2C3A2C] rounded-[24px] sm:rounded-[32px] text-white shadow-xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
							<Layers className="h-20 w-20 sm:h-24 sm:w-24" />
						</div>

						<p className="text-[10px] uppercase font-black text-amber-400 mb-4 sm:mb-6 tracking-widest">
							Resumen de estadía
						</p>

						<div className="space-y-4 sm:space-y-6">
							{tipoVisita === "PASE_DIARIO" ? (
								<div>
									<span className="text-white/60 text-[10px] sm:text-xs block mb-1">
										Fecha de Visita
									</span>
									<span className="text-lg sm:text-xl font-black">
										{fechas.start
											? format(fechas.start, "PPP", { locale: es })
											: "—"}
									</span>
								</div>
							) : (
								<div className="space-y-3">
									<div className="flex justify-between items-end">
										<span className="text-white/60 text-[10px] sm:text-xs">
											Noches seleccionadas
										</span>
										<Badge className="bg-amber-500 hover:bg-amber-500 border-none">
											{noches.length} {noches.length === 1 ? "noche" : "noches"}
										</Badge>
									</div>
									<div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
										{noches.length > 0 ? (
											[...noches]
												.sort((a, b) => a.getTime() - b.getTime())
												.map((d, idx) => (
													<div
														key={idx}
														className="flex items-center justify-between text-sm py-1 border-b border-white/5"
													>
														<span className="font-bold">
															{format(d, "eee dd MMM", { locale: es })}
														</span>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-white/40 hover:text-white"
															onClick={() => handlePackageRemoval(d)}
														>
															×
														</Button>
													</div>
												))
										) : (
											<p className="text-white/30 text-xs italic">
												Ninguna seleccionada
											</p>
										)}
									</div>
								</div>
							)}
						</div>

						<Button
							disabled={isNextDisabled}
							onClick={handleContinue}
							className="w-full h-12 sm:h-14 rounded-2xl font-black text-base sm:text-lg bg-amber-500 hover:bg-amber-600 text-white mt-8 sm:mt-10 shadow-lg shadow-amber-900/20 active:scale-95 transition-all"
						>
							Continuar <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
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
									<p className="text-muted-foreground leading-relaxed text-xs">
										{tipoVisita === "PASE_DIARIO"
											? "Los lunes el centro permanece cerrado por mantenimiento. Los pases son válidos para el resto de días seleccionados."
											: "Lunes y Domingos no se atiende pernoctación. Los paquetes se seleccionan automáticamente por bloque."}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={showValidation} onOpenChange={setShowValidation}>
				<DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
					<div className="bg-amber-500 p-8 text-center relative overflow-hidden">
						<div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
							<CalendarIcon className="h-24 w-24 text-white" />
						</div>
						<div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 backdrop-blur-md relative z-10">
							<AlertCircle className="h-8 w-8" />
						</div>
						<DialogTitle className="text-white text-2xl font-black tracking-tight mb-2 relative z-10">
							Selección Incompleta
						</DialogTitle>
						<DialogDescription className="text-white/80 font-medium text-sm relative z-10">
							{validationMsg}
						</DialogDescription>
					</div>
					<div className="p-8 bg-white">
						<Button
							onClick={() => setShowValidation(false)}
							className="w-full h-14 rounded-2xl bg-[#2C3A2C] hover:bg-black text-white font-black transition-all active:scale-95"
						>
							Entendido, volver al calendario
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
