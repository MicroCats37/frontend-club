"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	CreditCard,
	Home,
	Loader2,
	Users,
	Edit2,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumen } from "@/hooks/auth/useResumen";
import { useTipoTarifas } from "@/hooks/useTarifas";
import {
	useRegistrarBungalow,
	useRegistrarPaseDiario,
} from "@/hooks/visitas/useVisitaFlow";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepReviewAndConfirm() {
	const _router = useRouter();
	const { data: userResumen } = useResumen();
	const {
		tipoVisita,
		fechas,
		noches,
		guestSelections,
		bungalowsSeleccionados,
		totalEstimado: totalPases,
		tipoTarifaId,
		createdVisitId,
		reset,
	} = useVisitaRegistrationStore();

	const { data: response } = useTipoTarifas();
	const categorias =
		response && !Array.isArray(response)
			? response.results
			: (response as any[]);
	const categoriaSeleccionada = useMemo(() => {
		return categorias?.find((c) => c.id === tipoTarifaId);
	}, [categorias, tipoTarifaId]);

	const { mutate: registrarPases, isPending: submetiendoPases } =
		useRegistrarPaseDiario();
	const { mutate: registrarBungalow, isPending: submetiendoBungalow } =
		useRegistrarBungalow();

	const totalAlojamiento = useMemo(() => {
		return bungalowsSeleccionados.reduce(
			(acc, b) => acc + (Number((b as any).precio_total) || 0),
			0,
		);
	}, [bungalowsSeleccionados]);

	const totalFinal = totalPases + totalAlojamiento;

	const {
		setCreatedVisitId,
		setOrdenCobroId,
		setPaso,
		setTotalEstimado,
		setFechaLimitePago,
	} = useVisitaRegistrationStore();

	// This function is for StepSuccess.tsx, but was included in the provided diff for StepReviewAndConfirm.tsx.
	// It's being moved to where it logically belongs, which is likely StepSuccess.
	// For the purpose of this specific instruction, I will add it as requested,
	// but note that `createdVisitId` is not set until `onSuccess` of `registrarPases`/`registrarBungalow`.
	// If this function is intended for *this* component, `createdVisitId` would be null initially.
	const handleConfirm = () => {
		if (tipoVisita === "PASE_DIARIO") {
			registrarPases(
				{
					fecha_inicio: format(fechas.start!, "yyyy-MM-dd"),
					fecha_fin: format(fechas.end!, "yyyy-MM-dd"),
					ingresantes: guestSelections.map((g) => ({
						persona_id: g.persona_id,
						tipo_entrada_id: g.tipo_entrada_id,
						con_cupon: g.con_cupon,
					})),
				},
				{
					onSuccess: (data: any) => {
						setCreatedVisitId(data.id);
						// Extraemos el ID de la orden de cobro siguiendo el patrón de la vista de detalle
						const ordenId =
							data.orden_cobro_id ||
							data.orden_cobro?.id ||
							data.lista_ingresantes?.orden_cobro_id ||
							data.lista_ingresantes?.orden_cobro?.id;

						if (ordenId) setOrdenCobroId(ordenId);

						// Guardamos la fecha límite de pago
						const fixFechaLimite =
							data.fecha_limite_pago ||
							data.lista_ingresantes?.orden_cobro?.fecha_limite_pago;
						if (fixFechaLimite) setFechaLimitePago(fixFechaLimite);

						const finalTotal =
							data.monto_total ||
							data.lista_ingresantes?.orden_cobro?.monto_total;
						if (finalTotal) setTotalEstimado(Number(finalTotal));

						setPaso(5);
					},
				},
			);
		} else {
			// BUNGALOW: Incluimos 'noches' en el payload
			registrarBungalow(
				{
					bungalow_ids: bungalowsSeleccionados.map((b) => b.id.toString()),
					fecha_llegada: format(fechas.start || new Date(), "yyyy-MM-dd"), // Fallback por si acaso, aunque el backend usará min(noches)
					fecha_salida: format(fechas.end || new Date(), "yyyy-MM-dd"),
					noches: noches.map((d) => format(d, "yyyy-MM-dd")),
					tipo_tarifa_id: tipoTarifaId!,
					con_privilegio: userResumen?.privilegios || false,
					ingresantes: guestSelections.map((g) => ({
						persona_id: g.persona_id,
						tipo_entrada_id: g.tipo_entrada_id,
						con_cupon: g.con_cupon,
					})),
				},
				{
					onSuccess: (data: any) => {
						setCreatedVisitId(data.id);
						// Extraemos el ID de la orden de cobro siguiendo el patrón de la vista de detalle
						const ordenId =
							data.reserva_asociada?.orden_cobro?.id ||
							data.orden_cobro_id ||
							data.orden_cobro?.id ||
							data.reserva?.orden_cobro_id ||
							data.reserva?.orden_cobro?.id ||
							data.lista_ingresantes?.orden_cobro_id ||
							data.lista_ingresantes?.orden_cobro?.id;

						if (ordenId) setOrdenCobroId(ordenId);

						// Guardamos la fecha límite de pago
						const fixFechaLimite =
							data.fecha_limite_pago ||
							data.reserva_asociada?.orden_cobro?.fecha_limite_pago;
						if (fixFechaLimite) setFechaLimitePago(fixFechaLimite);

						const finalTotal =
							data.monto_total ||
							data.reserva_asociada?.orden_cobro?.monto_total;
						if (finalTotal) setTotalEstimado(Number(finalTotal));

						setPaso(6);
					},
				},
			);
		}
	};

	const isPending = submetiendoPases || submetiendoBungalow;

	return (
		<div className="max-w-5xl mx-auto py-2 sm:py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
			<div className="text-center mb-8 sm:mb-12 px-4">
				<h2 className="text-2xl sm:text-4xl font-black text-[#2C3A2C] mb-2 tracking-tight">
					Resumen y Confirmación
				</h2>
				<p className="text-muted-foreground font-medium text-xs sm:text-lg">
					Verifica los detalles antes de finalizar tu registro.
				</p>
			</div>

			{/* Banner Informativo */}
			<div className="mx-4 mb-8 bg-amber-50 border border-amber-200 rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 flex items-start gap-4">
				<div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
					<AlertCircle className="h-6 w-6 text-white" />
				</div>
				<div className="min-w-0">
					<p className="font-black text-amber-900 text-xs sm:text-sm uppercase tracking-wider mb-1">
						Información Importante
					</p>
					<p className="text-[#2C3A2C] text-[11px] sm:text-sm font-bold leading-relaxed">
						{tipoVisita === "BUNGALOW" ? (
							<>
								Podrás{" "}
								<span className="text-amber-600 underline decoration-2 underline-offset-2 uppercase">
									modificar a tus invitados
								</span>{" "}
								hasta un día antes de la reserva. Después de ese plazo, los
								cambios se bloquearán.
							</>
						) : (
							<>
								Si pagas ahora{" "}
								<span className="text-amber-600 underline decoration-2 underline-offset-2 uppercase">
									no podrás modificar
								</span>{" "}
								a tus invitados. Si deseas modificar la lista más adelante,
								deberás contactar con el administrador.
							</>
						)}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
				{/* Detalles de la Visita */}
				<div className="lg:col-span-2 space-y-6">
					<Card className="rounded-[24px] sm:rounded-[32px] border-gray-100 shadow-sm overflow-hidden">
						<CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
							<CardTitle className="text-base sm:text-lg font-black flex items-center gap-2 text-[#2C3A2C]">
								<Calendar className="h-5 w-5 text-amber-500" />
								Información General
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 sm:p-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest leading-none">
										Modalidad
									</p>
									<Badge
										className={`px-4 py-1.5 rounded-xl font-black text-[10px] sm:text-sm ${tipoVisita === "PASE_DIARIO"
											? "bg-amber-100 text-amber-700"
											: "bg-blue-100 text-blue-700"
											}`}
									>
										{tipoVisita === "PASE_DIARIO"
											? "Pase Diario (Full Day)"
											: "Estadía en Bungalow"}
									</Badge>
								</div>
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest leading-none">
										Periodo
									</p>
									<div className="font-bold text-[#2C3A2C] text-xs sm:text-sm">
										{tipoVisita === "PASE_DIARIO" ? (
											format(fechas.start!, "PPP", { locale: es })
										) : (
											<div className="flex flex-col gap-1">
												<span className="text-amber-600">
													{noches.length}{" "}
													{noches.length === 1 ? "noche" : "noches"}{" "}
													seleccionadas
												</span>
												<span className="text-[10px] sm:text-xs opacity-60">
													{noches.length > 0
														? [...noches]
															.sort((a, b) => a.getTime() - b.getTime())
															.map((d) => format(d, "dd MMM", { locale: es }))
															.join(", ")
														: "—"}
												</span>
											</div>
										)}
									</div>
								</div>
								{tipoVisita === "BUNGALOW" && (
									<div>
										<p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest leading-none">
											Categoría de Tarifa
										</p>
										<Badge className="bg-amber-500 text-white font-black border-none text-[10px] sm:text-sm">
											{categoriaSeleccionada?.nombre || "Cargando..."}
										</Badge>
									</div>
								)}
							</div>

							{tipoVisita === "BUNGALOW" &&
								bungalowsSeleccionados.length > 0 && (
									<div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100">
										<p className="text-[10px] uppercase font-black text-gray-400 mb-4 tracking-widest leading-none">
											Unidades Seleccionadas
										</p>
										<div className="flex flex-col gap-3">
											{bungalowsSeleccionados.map((b) => (
												<BungalowReviewItem key={b.id} bungalow={b} />
											))}
										</div>
									</div>
								)}
						</CardContent>
					</Card>

					<Card className="rounded-[24px] sm:rounded-[32px] border-gray-100 shadow-sm overflow-hidden">
						<CardHeader className="bg-gray-50/50 p-5 sm:p-6 border-b border-gray-100">
							<CardTitle className="text-base sm:text-lg font-black flex items-center justify-between text-[#2C3A2C]">
								<div className="flex items-center gap-2">
									<Users className="h-5 w-5 text-amber-500" />
									Invitados
								</div>
								<div className="flex items-center gap-3">
									<Badge
										variant="outline"
										className="border-gray-200 text-gray-400 text-[10px] h-6"
									>
										{guestSelections.length} personas
									</Badge>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 px-3 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-black text-[10px] uppercase tracking-wider transition-all active:scale-95"
										onClick={() => setPaso(tipoVisita === "BUNGALOW" ? 4 : 3)}
									>
										Modificar Lista
									</Button>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<div className="divide-y divide-gray-50">
								{guestSelections.map((guest) => (
									<div
										key={guest.persona_id}
										className="p-4 sm:p-6 flex items-center justify-between gap-4 hover:bg-gray-50/30 transition-colors"
									>
										<div className="flex items-center gap-3 sm:gap-4">
											<div className="h-9 w-9 sm:h-11 sm:w-11 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-600 font-black border border-amber-100 text-base sm:text-lg shrink-0">
												{guest.nombre_completo.charAt(0)}
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2 mb-1 sm:mb-1.5 flex-wrap">
													<p className="font-black text-[#2C3A2C] text-xs sm:text-sm leading-tight line-clamp-1">
														{guest.nombre_completo}
													</p>
													<span className="text-[10px] text-gray-400 font-bold hidden sm:inline">•</span>
													<p className="text-[10px] text-gray-400 font-bold">
														DNI: {guest.dni}
													</p>
												</div>
												<div className="flex items-center gap-2">
													{guest.usa_cupon ? (
														<Badge className="h-4 px-1.5 py-0 bg-green-500 text-white border-none text-[7px] sm:text-[8px] font-black uppercase tracking-wider">
															Pase Libre
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="h-4 px-1.5 py-0 border-gray-100 text-[7px] sm:text-[8px] font-black uppercase text-gray-400"
														>
															Invitado
														</Badge>
													)}
												</div>
											</div>
										</div>
										<div className="text-right shrink-0">
											<p
												className={`font-black text-xs sm:text-sm ${guest.usa_cupon ? "text-green-600" : "text-[#2C3A2C]"}`}
											>
												{guest.usa_cupon
													? "S/ 0"
													: `S/ ${Math.ceil(Number(guest.total_persona || 0))}`}
											</p>
											<p className="text-[8px] sm:text-[9px] font-bold text-gray-400 tracking-tighter leading-none mt-1">
												Precio final
											</p>
										</div>
									</div>
								))}
							</div>

							<div className="p-4 sm:p-6 bg-gray-50/30 border-t border-gray-50">
								<Button
									variant="outline"
									className="w-full h-12 rounded-2xl border-gray-200 text-amber-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 font-extrabold text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
									onClick={() => setPaso(tipoVisita === "BUNGALOW" ? 4 : 3)}
								>
									<Edit2 className="mr-2 h-4 w-4" />
									Modificar Lista de Invitados
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Resumen de Pago */}
				<div className="space-y-6">
					<Card className="rounded-[32px] sm:rounded-[40px] bg-[#2C3A2C] text-white overflow-hidden shadow-2xl relative border-none">
						<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
							<CreditCard className="h-24 sm:h-32 w-24 sm:w-32" />
						</div>

						<CardContent className="p-6 sm:p-8 pt-8 sm:pt-10 relative z-10">
							<div className="flex items-center gap-3 mb-6 sm:mb-8">
								<div className="h-1.5 w-6 sm:w-8 bg-amber-500 rounded-full" />
								<p className="text-[9px] sm:text-[10px] uppercase font-black text-amber-400 tracking-widest">
									Resumen de Pago
								</p>
							</div>

							<div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
								<div className="flex justify-between items-center text-xs sm:text-sm font-bold opacity-70">
									<span className="flex items-center gap-2">
										<Users className="h-3.5 w-3.5" /> Pases y Entradas
									</span>
									<span>S/ {Math.ceil(Number(totalPases || 0))}</span>
								</div>
								{tipoVisita === "BUNGALOW" && (
									<div className="flex justify-between items-center text-xs sm:text-sm font-bold opacity-70">
										<span className="flex items-center gap-2">
											<Home className="h-3.5 w-3.5" /> Alojamiento
										</span>
										<span>S/ {Math.ceil(Number(totalAlojamiento || 0))}</span>
									</div>
								)}
								<div className="h-px bg-white/10 w-full my-4 sm:my-6 shadow-sm shadow-black/20" />
								<div className="flex justify-between items-end">
									<div>
										<p className="text-[9px] sm:text-[10px] uppercase font-black text-amber-400/80 leading-none mb-2 sm:mb-3 tracking-tighter">
											Monto Total Estimado
										</p>
										<p className="text-3xl sm:text-5xl font-black tracking-tighter">
											S/ {Math.ceil(Number(totalFinal || 0))}
										</p>
									</div>
								</div>
							</div>

							<Button
								disabled={isPending}
								onClick={handleConfirm}
								className="w-full h-14 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-amber-500 hover:bg-amber-600 text-white font-black text-sm sm:text-xl transition-all hover:scale-[1.02] shadow-xl shadow-amber-900/40 active:scale-95 border-none px-4"
							>
								{isPending ? (
									<span className="flex items-center justify-center gap-2 sm:gap-4 w-full">
										<Loader2 className="h-5 w-5 sm:h-7 sm:w-7 animate-spin" />
										<span className="truncate">Procesando...</span>
									</span>
								) : (
									<span className="flex items-center justify-center gap-2 sm:gap-4 w-full">
										<CheckCircle2 className="h-5 w-5 sm:h-7 sm:w-7" />
										<span className="truncate">Finalizar Registro y Pagar</span>
									</span>
								)}
							</Button>

							<div className="mt-6 sm:mt-8 flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
								<AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
								<p className="text-[8px] sm:text-[9px] text-white/40 uppercase font-black tracking-widest leading-relaxed">
									Al confirmar, los datos se enviarán al sistema para generar
									las órdenes de pago correspondientes.
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-[32px] bg-white border-gray-100 shadow-sm border-2">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100 text-amber-600">
									<Ticket className="h-5 w-5" />
								</div>
								<div>
									<p className="font-black text-[#2C3A2C] text-xs leading-none mb-1">
										Orden de Pago
									</p>
									<p className="text-[10px] text-muted-foreground font-medium leading-tight">
										Podrás visualizar y pagar tu orden desde la lista de
										visitas.
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

// Subcomponente pequeño para íconos si no está disponible
function Ticket({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
			<path d="M13 5v2"></path>
			<path d="M13 17v2"></path>
			<path d="M13 11v2"></path>
		</svg>
	);
}

function BungalowReviewItem({ bungalow }: { bungalow: any }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-100/50 transition-colors"
			>
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500 border border-blue-50 shrink-0">
						<Home className="h-5 w-5" />
					</div>
					<div className="text-left">
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">
							B-{bungalow.numero}
						</p>
						<p className="text-sm font-black text-[#2C3A2C]">
							{bungalow.nombre}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-right">
						<p className="text-[10px] font-black text-amber-600">
							S/ {Math.ceil(Number(bungalow.precio_total))}
						</p>
						<p className="text-[8px] font-bold text-gray-400 uppercase">
							Total Cabaña
						</p>
					</div>
					{isOpen ? (
						<ChevronUp className="h-4 w-4 text-gray-400" />
					) : (
						<ChevronDown className="h-4 w-4 text-gray-400" />
					)}
				</div>
			</button>

			{isOpen && bungalow.desglose && (
				<div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
					<div className="pt-2 border-t border-gray-100 flex items-center gap-2 mb-2">
						<div className="h-1 w-4 bg-amber-500 rounded-full" />
						<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
							Desglose de Noches
						</p>
					</div>
					{bungalow.desglose.map((dia: any, idx: number) => {
						const fechaObj = parseISO(dia.fecha);
						return (
							<div
								key={idx}
								className="flex justify-between items-center py-1.5 border-b border-gray-100/50 last:border-0"
							>
								<div className="flex items-center gap-2">
									<div className="w-1 h-1 rounded-full bg-gray-200" />
									<p className="text-[11px] font-bold text-gray-600">
										{dia.dia}{" "}
										<span className="text-gray-400 font-medium ml-1">
											{format(fechaObj, "dd 'de' MMM", { locale: es })}
										</span>
									</p>
								</div>
								<div className="flex items-center gap-3">
									{dia.feriado && (
										<Badge className="h-4 px-1 bg-red-100 text-red-600 border-none text-[7px] font-black uppercase">
											Feriado
										</Badge>
									)}
									<p className="text-[11px] font-black text-amber-600">
										S/ {Math.ceil(Number(dia.precio))}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
