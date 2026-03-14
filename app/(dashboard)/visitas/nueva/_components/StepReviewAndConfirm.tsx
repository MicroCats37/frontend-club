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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useRegistrarBungalow,
	useRegistrarPaseDiario,
} from "@/hooks/visitas/useVisitaFlow";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";
import { useTipoTarifas } from "@/hooks/useTarifas";

export function StepReviewAndConfirm() {
	const router = useRouter();
	const {
		tipoVisita,
		fechas,
		guestSelections,
		bungalowsSeleccionados,
		totalEstimado: totalPases,
		tipoTarifaId,
		reset,
	} = useVisitaRegistrationStore();

	const { data: response } = useTipoTarifas();
	const categorias = response && !Array.isArray(response) ? response.results : (response as any[]);
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

	const { setCreatedVisitId, setOrdenCobroId, setPaso } = useVisitaRegistrationStore();

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
						setPaso(5);
					},
				},
			);
		} else {
			registrarBungalow(
				{
					bungalow_ids: bungalowsSeleccionados.map((b) => b.id.toString()),
					fecha_llegada: format(fechas.start!, "yyyy-MM-dd"),
					fecha_salida: format(fechas.end!, "yyyy-MM-dd"),
					tipo_tarifa_id: tipoTarifaId!,
					con_privilegio: false,
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
							data.reserva?.orden_cobro_id || 
							data.reserva?.orden_cobro?.id ||
							data.lista_ingresantes?.orden_cobro_id || 
							data.lista_ingresantes?.orden_cobro?.id;

						if (ordenId) setOrdenCobroId(ordenId);
						setPaso(5);
					},
				},
			);
		}
	};

	const isPending = submetiendoPases || submetiendoBungalow;

	return (
		<div className="max-w-5xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="text-center mb-10">
				<h2 className="text-3xl font-black text-[#2C3A2C] mb-2 tracking-tight">
					Resumen y Confirmación
				</h2>
				<p className="text-muted-foreground font-medium">
					Verifica los detalles antes de finalizar tu registro.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
				{/* Detalles de la Visita */}
				<div className="lg:col-span-2 space-y-6">
					<Card className="rounded-[32px] border-gray-100 shadow-sm overflow-hidden">
						<CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
							<CardTitle className="text-lg font-black flex items-center gap-2 text-[#2C3A2C]">
								<Calendar className="h-5 w-5 text-amber-500" />
								Información General
							</CardTitle>
						</CardHeader>
						<CardContent className="p-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest leading-none">
										Modalidad
									</p>
									<Badge
										className={`px-4 py-1.5 rounded-xl font-black ${
											tipoVisita === "PASE_DIARIO"
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
									<div className="font-bold text-[#2C3A2C] text-sm">
										{format(fechas.start!, "PPP", { locale: es })}
										{tipoVisita === "BUNGALOW" &&
											` al ${format(fechas.end!, "PPP", { locale: es })}`}
									</div>
								</div>
								{tipoVisita === "BUNGALOW" && (
									<div>
										<p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest leading-none">
											Categoría de Tarifa
										</p>
										<Badge className="bg-amber-500 text-white font-black border-none">
											{categoriaSeleccionada?.nombre || "Cargando..."}
										</Badge>
									</div>
								)}
							</div>

							{tipoVisita === "BUNGALOW" &&
								bungalowsSeleccionados.length > 0 && (
									<div className="mt-8 pt-8 border-t border-gray-100">
										<p className="text-[10px] uppercase font-black text-gray-400 mb-4 tracking-widest leading-none">
											Unidades Seleccionadas
										</p>
										<div className="flex flex-wrap gap-3">
											{bungalowsSeleccionados.map((b) => (
												<div
													key={b.id}
													className="flex items-center gap-3 bg-gray-50/50 p-3 pr-5 rounded-2xl border border-gray-100"
												>
													<div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500 border border-blue-50">
														<Home className="h-5 w-5" />
													</div>
													<div>
														<p className="text-[9px] font-black leading-none mb-1 text-gray-400 uppercase tracking-tighter">
															B-{b.numero}
														</p>
														<p className="text-xs font-black text-[#2C3A2C] leading-none">
															{b.nombre}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
						</CardContent>
					</Card>

					<Card className="rounded-[32px] border-gray-100 shadow-sm overflow-hidden">
						<CardHeader className="bg-gray-50/50 p-6 border-b border-gray-100">
							<CardTitle className="text-lg font-black flex items-center gap-2 text-[#2C3A2C]">
								<Users className="h-5 w-5 text-amber-500" />
								Invitados ({guestSelections.length})
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<div className="divide-y divide-gray-100">
								{guestSelections.map((guest) => (
									<div
										key={guest.persona_id}
										className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/30 transition-colors"
									>
										<div className="flex items-center gap-4">
											<div className="h-11 w-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 font-black border border-amber-100 text-lg">
												{guest.nombre_completo.charAt(0)}
											</div>
											<div>
												<p className="font-black text-[#2C3A2C] text-sm leading-tight mb-1.5 line-clamp-2">
													{guest.nombre_completo}
												</p>
												<div className="flex items-center gap-2">
													{guest.usa_cupon ? (
														<Badge className="h-4.5 px-2 py-0 bg-green-500 text-white border-none text-[8px] font-black uppercase tracking-wider">
															Pase Libre
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="h-4.5 px-2 py-0 border-gray-100 text-[8px] font-black uppercase text-gray-400"
														>
															Invitado
														</Badge>
													)}
													<p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
														ID: {guest.persona_id.split("-")[0]}...
													</p>
												</div>
											</div>
										</div>
										<div className="text-right">
											<p
												className={`font-black text-sm ${guest.usa_cupon ? "text-green-600" : "text-[#2C3A2C]"}`}
											>
												{guest.usa_cupon
													? "S/ 0.00"
													: `S/ ${Number(guest.total_persona || 0).toFixed(2)}`}
											</p>
											<p className="text-[9px] font-bold text-gray-400 tracking-tighter leading-none mt-1">
												Precio final
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Resumen de Pago */}
				<div className="space-y-6">
					<Card className="rounded-[40px] bg-[#2C3A2C] text-white overflow-hidden shadow-2xl relative border-none">
						<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
							<CreditCard className="h-32 w-32" />
						</div>

						<CardContent className="p-8 pt-10 relative z-10">
							<div className="flex items-center gap-3 mb-8">
								<div className="h-1.5 w-8 bg-amber-500 rounded-full" />
								<p className="text-[10px] uppercase font-black text-amber-400 tracking-widest">
									Resumen de Pago
								</p>
							</div>

							<div className="space-y-5 mb-10">
								<div className="flex justify-between items-center text-sm font-bold opacity-70">
									<span className="flex items-center gap-2">
										<Users className="h-3.5 w-3.5" /> Pases y Entradas
									</span>
									<span>S/ {Number(totalPases || 0).toFixed(2)}</span>
								</div>
								{tipoVisita === "BUNGALOW" && (
									<div className="flex justify-between items-center text-sm font-bold opacity-70">
										<span className="flex items-center gap-2">
											<Home className="h-3.5 w-3.5" /> Alojamiento
										</span>
										<span>S/ {Number(totalAlojamiento || 0).toFixed(2)}</span>
									</div>
								)}
								<div className="h-px bg-white/10 w-full my-6 shadow-sm shadow-black/20" />
								<div className="flex justify-between items-end">
									<div>
										<p className="text-[10px] uppercase font-black text-amber-400/80 leading-none mb-3 tracking-tighter">
											Monto Total Estimado
										</p>
										<p className="text-4xl sm:text-5xl font-black tracking-tighter">
											S/ {Number(totalFinal || 0).toFixed(2)}
										</p>
									</div>
								</div>
							</div>

							<Button
								disabled={isPending}
								onClick={handleConfirm}
								className="w-full h-16 rounded-[24px] bg-amber-500 hover:bg-amber-600 text-white font-black text-lg transition-all hover:scale-[1.02] shadow-xl shadow-amber-900/40 active:scale-95 border-none"
							>
								{isPending ? (
									<span className="flex items-center gap-3">
										<Loader2 className="h-6 w-6 animate-spin" /> Procesando...
									</span>
								) : (
									<span className="flex items-center gap-3">
										<CheckCircle2 className="h-6 w-6" /> Finalizar Registro
									</span>
								)}
							</Button>

							<div className="mt-8 flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
								<AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
								<p className="text-[9px] text-white/40 uppercase font-black tracking-widest leading-relaxed">
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
