"use client";

import {
	addDays,
	eachDayOfInterval,
	endOfWeek,
	format,
	isSameDay,
	isToday,
	startOfWeek,
	subDays,
} from "date-fns";
import { es } from "date-fns/locale";
import {
	CalendarDays,
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useBungalowOcupacion } from "@/hooks/useBungalows";
import type {
	BungalowOcupacion,
	NocheOcupada,
} from "@/schemas/alojamiento/bungalow";
import { useAuthStore } from "@/store/useAuthStore";

export default function BungalowEstadiaPage() {
	const user = useAuthStore((state) => state.user);
	const _router = useRouter();

	const [currentDate, setCurrentDate] = useState(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	// Calculamos rango de la semana (Lunes a Domingo)
	const f_inicio_dt = startOfWeek(currentDate, { weekStartsOn: 1 });
	const f_fin_dt = endOfWeek(currentDate, { weekStartsOn: 1 });

	const f_inicio = format(f_inicio_dt, "yyyy-MM-dd");
	const f_fin = format(f_fin_dt, "yyyy-MM-dd");

	const { data: ocupacion, isLoading } = useBungalowOcupacion({
		f_inicio,
		f_fin,
	});

	const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
	const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
	const handleToday = () => setCurrentDate(new Date());

	const daysInWeek = eachDayOfInterval({
		start: f_inicio_dt,
		end: f_fin_dt,
	});

	if (!user) return null;

	return (
		<div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
			{/* Header de la Página */}
			<div className="mb-8 px-2">
				<h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
					Ocupación Semanal
				</h1>
				<p className="text-gray-500 font-medium text-sm sm:text-base">
					Gestión de alojamiento del{" "}
					<span className="font-bold text-gray-700">
						{format(f_inicio_dt, "d 'de' MMMM", { locale: es })}
					</span>{" "}
					al{" "}
					<span className="font-bold text-gray-700">
						{format(f_fin_dt, "d 'de' MMMM", { locale: es })}
					</span>
				</p>
			</div>

			<Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] overflow-hidden">
				{/* Controles de Navegación del Calendario */}
				<CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-gray-100 pb-6 gap-6">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 sm:h-14 sm:w-14 bg-[#2C3A2C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2C3A2C]/20 shrink-0">
							<CalendarIcon className="text-white h-6 w-6 sm:h-7 sm:w-7" />
						</div>
						<div>
							<CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 capitalize leading-tight">
								Semana {format(f_inicio_dt, "w")} -{" "}
								{format(f_inicio_dt, "yyyy")}
							</CardTitle>
							<p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
								Vista de 7 Días
							</p>
						</div>
					</div>

					{/* Controles interactivos */}
					<div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full lg:w-auto justify-center lg:justify-end">
						<Button
							variant="ghost"
							size="icon"
							onClick={handlePrevWeek}
							className="rounded-xl hover:bg-white hover:shadow-sm"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>

						<Button
							variant="ghost"
							className="font-bold text-sm px-4 rounded-xl hover:bg-white hover:shadow-sm"
							onClick={handleToday}
						>
							Hoy
						</Button>

						{/* PICKER MEJORADO: Sombrea la semana y selecciona con 1 clic */}
						<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="gap-2 rounded-xl border-gray-200 hover:bg-white hover:border-gray-300 font-bold shadow-sm"
								>
									<CalendarDays className="h-4 w-4 text-gray-500" />
									<span className="hidden sm:inline">
										Del {format(f_inicio_dt, "d")} al{" "}
										{format(f_fin_dt, "d 'de' MMM", { locale: es })}
									</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0 rounded-2xl border-gray-100 shadow-xl"
								align="center"
							>
								<Calendar
									mode="range"
									selected={{
										from: f_inicio_dt,
										to: f_fin_dt,
									}}
									// Usamos onDayClick en lugar de onSelect para evitar el doble clic
									onDayClick={(day) => {
										setCurrentDate(day);
										setIsCalendarOpen(false); // Cierra automáticamente
									}}
									initialFocus
									locale={es}
									className="p-3"
								/>
							</PopoverContent>
						</Popover>

						<Button
							variant="ghost"
							size="icon"
							onClick={handleNextWeek}
							className="rounded-xl hover:bg-white hover:shadow-sm"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				</CardHeader>

				{/* Grilla de Días */}
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
							{[1, 2, 3, 4, 5, 6, 7].map((i) => (
								<Skeleton key={i} className="h-40 lg:h-80 w-full rounded-2xl" />
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 min-h-[400px] lg:min-h-[600px]">
							{daysInWeek.map((day) => {
								const isDayToday = isToday(day);
								const tieneOcupacion = ocupacion?.some(
									(bg: BungalowOcupacion) =>
										bg.noches.some((n: NocheOcupada) =>
											isSameDay(new Date(n.fecha), day),
										),
								);

								return (
									<div
										key={day.toString()}
										className={`flex flex-col lg:min-h-[300px] transition-colors ${isDayToday ? "bg-amber-50/30" : ""}`}
									>
										{/* Header del Día */}
										<div
											className={`p-3 sm:p-4 border-b border-gray-100 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-2 lg:gap-0 sticky top-0 z-10 ${isDayToday ? "bg-amber-100/50" : "bg-gray-50/80 backdrop-blur-md"}`}
										>
											<span
												className={`text-xs lg:text-[10px] uppercase font-black tracking-widest ${isDayToday ? "text-amber-600" : "text-gray-400"}`}
											>
												{format(day, "EEEE", { locale: es })}
											</span>
											<div className="flex items-center gap-2 lg:flex-col lg:gap-0">
												<span
													className={`text-xl lg:text-3xl font-black leading-none lg:mt-1 ${isDayToday ? "text-amber-700" : "text-gray-900"}`}
												>
													{format(day, "dd")}
												</span>
												<span className="lg:hidden text-xs font-bold text-gray-400">
													{format(day, "MMM", { locale: es })}
												</span>
											</div>
										</div>

										{/* Contenido (Tarjetas de Reservas) */}
										<div
											className={`p-3 space-y-3 flex-grow overflow-y-auto scrollbar-hide ${!tieneOcupacion ? "min-h-[120px] lg:min-h-[auto]" : ""}`}
										>
											{ocupacion?.map((bg: BungalowOcupacion) => {
												const noche = bg.noches.find((n: NocheOcupada) =>
													isSameDay(new Date(n.fecha), day),
												);
												if (!noche) return null;

												return (
													<Popover key={`${bg.id}-${noche.reserva_id}`}>
														<PopoverTrigger asChild>
															<div
																className="group relative p-3 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col gap-1.5 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
																style={{
																	borderLeft: `5px solid ${noche.color_status}`,
																}}
															>
																{/* Fondo sutil usando el color de estado */}
																<div
																	className="absolute inset-0 opacity-[0.03]"
																	style={{ backgroundColor: noche.color_status }}
																/>

																<div className="relative z-10">
																	<span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
																		Bung. {bg.numero}
																	</span>

																	<p className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight my-0.5">
																		{noche.titular_nombre}
																	</p>

																	<Badge
																		variant="outline"
																		className="w-fit text-[9px] py-0 px-1.5 font-bold uppercase tracking-widest border-0 mt-1"
																		style={{
																			backgroundColor: `${noche.color_status}15`,
																			color: noche.color_status,
																		}}
																	>
																		{noche.estado_pago.replace(/_/g, " ")}
																	</Badge>
																</div>
															</div>
														</PopoverTrigger>
														<PopoverContent className="w-64 p-4 rounded-2xl shadow-2xl border-gray-100">
															<div className="space-y-3">
																<div className="space-y-1">
																	<h4 className="font-bold text-sm text-gray-900">
																		Gestión de Estancia
																	</h4>
																	<p className="text-xs text-gray-500 font-medium">
																		Titular: {noche.titular_nombre}
																	</p>
																</div>
																<div className="pt-2 border-t border-gray-50 flex flex-col gap-2">
																	{noche.visita_id ? (
																		<Button
																			variant="default"
																			size="sm"
																			className="w-full rounded-xl bg-[#2C3A2C] hover:bg-[#1C251C] font-bold text-xs gap-2"
																			onClick={() =>
																				window.open(
																					`/admin/visitas/${noche.visita_id}`,
																					"_blank",
																				)
																			}
																		>
																			Ver Gestión de Visita
																		</Button>
																	) : (
																		<p className="text-[10px] text-gray-400 font-bold uppercase text-center py-2 bg-gray-50 rounded-lg">
																			Sin visita asociada
																		</p>
																	)}
																	<p className="text-[9px] text-gray-400 text-center font-medium">
																		Reserva: {noche.reserva_id.split("-")[0]}
																	</p>
																</div>
															</div>
														</PopoverContent>
													</Popover>
												);
											})}

											{/* Empty State para el día */}
											{!tieneOcupacion && (
												<div className="h-full flex flex-col items-center justify-center opacity-40 py-6 lg:py-12">
													<Info className="h-6 w-6 text-gray-400 mb-2" />
													<span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
														Libre
													</span>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Leyenda Visual */}
			<div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-[24px] border border-gray-100 shadow-sm w-fit mx-auto">
				{[
					{ color: "#22c55e", label: "En Curso / Pagado" },
					{ color: "#3b82f6", label: "Próxima / Vigente" },
					{ color: "#f59e0b", label: "Pendiente Pago" },
					{ color: "#64748b", label: "Finalizada" },
				].map((item) => (
					<div key={item.label} className="flex items-center gap-2">
						<div
							className="h-3 w-3 rounded-full shadow-sm"
							style={{ backgroundColor: item.color }}
						/>
						<span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-widest">
							{item.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
