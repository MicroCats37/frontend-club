"use client";

import { format } from "date-fns";
import {
	ArrowRight,
	Info,
	Loader2,
	Tag,
	Ticket,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetGrupoFamiliar } from "@/hooks/visitas/useGetGrupoFamiliar";
import { useCotizarVisita } from "@/hooks/visitas/useVisitaFlow";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepPricingAndCoupons() {
	const {
		fechas,
		guestSelections,
		updateGuest,
		setPaso,
		tipoVisita,
		totalEstimado,
		setTotalEstimado,
	} = useVisitaRegistrationStore();

	const { data: grupo } = useGetGrupoFamiliar();
	const { mutate: cotizar, isPending: isCotizando } = useCotizarVisita();

	// Optimizamos la dependencia para evitar re-renders infinitos
	const guestsSelectionTrigger = JSON.stringify(
		guestSelections.map((g) => ({
			id: g.persona_id,
			tipo: g.tipo_entrada_id,
			cupon: g.con_cupon,
		})),
	);

	const quotingInputs = useMemo(() => {
		return {
			start: fechas.start ? format(fechas.start, "yyyy-MM-dd") : null,
			end: fechas.end ? format(fechas.end, "yyyy-MM-dd") : null,
			ingresantes: guestSelections.map((g) => ({
				persona_id: g.persona_id,
				tipo_entrada_id: g.tipo_entrada_id,
				con_cupon: g.con_cupon,
			})),
		};
	}, [fechas.start, fechas.end, guestsSelectionTrigger]);

	useEffect(() => {
		if (tipoVisita === "BUNGALOW") {
			setTotalEstimado(0);
			guestSelections.forEach((g) => {
				updateGuest(g.persona_id, {
					precio_unitario: 0,
					total_persona: 0,
					usa_cupon: false,
				});
			});
			return;
		}

		if (
			quotingInputs.ingresantes.length > 0 &&
			quotingInputs.start &&
			quotingInputs.end
		) {
			cotizar(
				{
					fecha_inicio: quotingInputs.start,
					fecha_fin: quotingInputs.end,
					ingresantes: quotingInputs.ingresantes,
				},
				{
					onSuccess: (res) => {
						setTotalEstimado(res.total);
						res.desglose.forEach((cot) => {
							updateGuest(cot.persona_id, {
								precio_unitario: Number(cot.precio_unitario),
								total_persona: Number(cot.total_persona),
								usa_cupon: cot.usa_cupon,
							});
						});
					},
				},
			);
		}
	}, [quotingInputs, cotizar, setTotalEstimado, updateGuest, tipoVisita]);

	const cuponesEnUsoCount = useMemo(
		() => guestSelections.filter((g) => g.con_cupon).length,
		[guestSelections],
	);

	const totalCuponesDisponibles = grupo?.cupos_disponibles || 0;
	const cuponesRestantes = Math.max(
		0,
		totalCuponesDisponibles - cuponesEnUsoCount,
	);

	return (
		<div className="max-w-7xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
			<div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 px-4">
				<div className="max-w-xl">
					<h2 className="text-4xl font-black text-[#2C3A2C] mb-3 tracking-tighter">
						Revisión y Cupones
					</h2>
					<p className="text-muted-foreground font-medium leading-relaxed">
						Verifica los precios calculados según el tipo de pase y aplica tus
						cupones libres disponibles.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-2 rounded-[28px] border shadow-sm w-full xl:w-auto">
					<div className="flex-1 px-5 py-3 bg-gray-50/50 rounded-[20px] border border-gray-100 flex items-center justify-between gap-6 md:gap-10 min-w-0">
						<div className="shrink-0">
							<p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-wider">
								Total Estimado
							</p>
							<p className="text-xl font-black text-[#2C3A2C] leading-none">
								{isCotizando ? (
									<span className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" /> ...
									</span>
								) : (
									`S/ ${Number(totalEstimado || 0).toFixed(2)}`
								)}
							</p>
						</div>

						<div className="flex items-center gap-6 md:gap-10 border-l pl-6 md:pl-10 border-gray-200">
							<div className="shrink-0 text-center">
								<p className="text-[10px] uppercase font-black text-green-600 mb-1 tracking-wider">
									Cupones
								</p>
								<p className="text-base font-black text-green-900 leading-none">
									{cuponesRestantes}
								</p>
							</div>
						</div>
					</div>

					<Button
						disabled={isCotizando}
						onClick={() => setPaso(tipoVisita === "BUNGALOW" ? 6 : 5)}
						className="h-14 px-10 rounded-[20px] font-black bg-[#2C3A2C] hover:bg-black text-white shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95"
					>
						Confirmar Visita <ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
				{guestSelections.map((selection) => {
					const memberInfo = grupo?.grupo?.find(
						(m) => m.persona.id === selection.persona_id,
					);
					const isSocioVip = !!memberInfo?.tiene_privilegios;
					const isPriceFree = isSocioVip || selection.usa_cupon;

					return (
						<div
							key={selection.persona_id}
							className="bg-white rounded-[32px] border-2 border-gray-100 p-6 flex flex-col gap-6 shadow-sm hover:border-amber-200 transition-all"
						>
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
									<Users className="h-6 w-6" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-black text-[#2C3A2C] line-clamp-1">
										{selection.nombre_completo}
									</h3>
									<Badge
										variant="secondary"
										className="text-[9px] font-black uppercase tracking-widest mt-1"
									>
										{selection.en_bungalow ? "Bungalow" : "Full Day"}
									</Badge>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between text-xs font-bold px-1">
									<div className="flex items-center gap-2 text-gray-400 uppercase tracking-widest">
										<Tag className="h-3.5 w-3.5" />
										<span>Costo Individual</span>
									</div>
									<span
										className={`text-sm font-black transition-colors ${isPriceFree ? "text-green-600" : "text-[#2C3A2C]"}`}
									>
										{isCotizando
											? "..."
											: isPriceFree
												? "S/ 0.00"
												: `S/ ${selection.total_persona.toFixed(2)}`}
									</span>
								</div>

								<div
									className={`p-4 rounded-[24px] border-2 transition-all duration-300 ${
										selection.con_cupon ||
										isSocioVip ||
										tipoVisita === "BUNGALOW"
											? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/20"
											: cuponesRestantes <= 0
												? "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed"
												: "bg-gray-50 border-gray-100 hover:border-green-200"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
													selection.con_cupon ||
													isSocioVip ||
													tipoVisita === "BUNGALOW"
														? "bg-white text-green-600"
														: "bg-white text-gray-300 shadow-sm"
												}`}
											>
												<Ticket className="h-4.5 w-4.5" />
											</div>
											<div>
												<span
													className={`text-[12px] block font-black leading-none ${selection.con_cupon || isSocioVip || tipoVisita === "BUNGALOW" ? "text-white" : "text-gray-700"}`}
												>
													{tipoVisita === "BUNGALOW"
														? "Huésped Bungalow"
														: isSocioVip
															? "Privilegio Socio"
															: selection.con_cupon
																? "Cupón Aplicado"
																: "Usar Cupón Libre"}
												</span>
												<span
													className={`text-[9px] font-bold leading-none ${selection.con_cupon || isSocioVip || tipoVisita === "BUNGALOW" ? "text-white/80" : "text-gray-400"}`}
												>
													{tipoVisita === "BUNGALOW"
														? "Costo diferido al check-in"
														: isSocioVip
															? "Sin costo (VIP)"
															: selection.con_cupon
																? "Descuento 100%"
																: cuponesRestantes <= 0
																	? "Sin stock"
																	: "Disponible"}
												</span>
											</div>
										</div>
										<Checkbox
											checked={
												selection.con_cupon ||
												isSocioVip ||
												tipoVisita === "BUNGALOW"
											}
											disabled={
												tipoVisita === "BUNGALOW" ||
												isSocioVip ||
												(!selection.con_cupon && cuponesRestantes <= 0)
											}
											onCheckedChange={(val) =>
												updateGuest(selection.persona_id, {
													con_cupon: val as boolean,
												})
											}
											className={`h-6 w-6 rounded-lg transition-all ${
												selection.con_cupon ||
												isSocioVip ||
												tipoVisita === "BUNGALOW"
													? "bg-white text-green-600 border-none"
													: "border-gray-200"
											}`}
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-20 px-4 max-w-4xl mx-auto">
				<div className="bg-amber-50/50 p-8 rounded-[40px] border border-amber-100/50 flex flex-col sm:flex-row items-start gap-6">
					<div className="h-14 w-14 bg-white rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
						{tipoVisita === "BUNGALOW" ? (
							<Zap className="h-7 w-7 text-amber-500" />
						) : (
							<Info className="h-7 w-7 text-amber-500" />
						)}
					</div>
					<div>
						<h4 className="font-black text-amber-900 mb-1 text-lg tracking-tight">
							{tipoVisita === "BUNGALOW"
								? "Acceso para Huéspedes"
								: "Política de Cupones"}
						</h4>
						<p className="text-amber-800/60 leading-relaxed font-medium text-sm">
							{tipoVisita === "BUNGALOW"
								? "El pago por derecho de área común de tus invitados se gestiona directamente en el counter al momento del check-in. En esta reserva solo confirmas los nombres para el listado de ingreso."
								: "Si aplicas un cupón libre, el costo de entrada de esa persona será S/ 0.00. Asegúrate de que los datos de tus invitados sean correctos antes de continuar a la confirmación final."}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
