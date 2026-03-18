"use client";

import { Home, Info, Loader2, Sparkles, UserCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTipoTarifaTarifario } from "@/hooks/useTarifas";
import type { TipoTarifa } from "@/schemas/alojamiento/tarifa";
import { formatCurrency } from "@/utils/format/currency";

interface TipoTarifaPricingModalProps {
	tipoTarifa: TipoTarifa | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TipoTarifaPricingModal({
	tipoTarifa,
	open,
	onOpenChange,
}: TipoTarifaPricingModalProps) {
	const { data: pricing, isLoading } = useTipoTarifaTarifario(
		tipoTarifa?.id || null,
	);

	if (!tipoTarifa) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full sm:max-w-[900px] max-h-[90vh] rounded-[2.5rem] border-none shadow-2xl p-0 flex flex-col overflow-hidden bg-white">
				<DialogHeader className="p-8 bg-amber-600 text-white shrink-0 relative overflow-hidden">
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />

					<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="flex items-center gap-5">
							<div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 rotate-3 shadow-xl">
								<Home className="h-8 w-8 text-white" />
							</div>
							<div>
								<div className="flex items-center gap-2 mb-1">
									<Badge className="bg-white/20 text-white border-none text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
										Tarifas de Alojamiento
									</Badge>
									{tipoTarifa.reglas?.some((r) => r.es_paquete_obligatorio) && (
										<Badge className="bg-amber-400 text-amber-950 border-none text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
											Paquetes Activos
										</Badge>
									)}
								</div>
								<DialogTitle className="text-3xl font-black tracking-tight leading-none text-white">
									{tipoTarifa.nombre}
								</DialogTitle>
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-gray-50/30">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-20 gap-4">
							<Loader2 className="h-12 w-12 animate-spin text-amber-500/40" />
							<p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
								Calculando tarifario dinámico...
							</p>
						</div>
					) : pricing && pricing.length > 0 ? (
						<div className="relative px-12">
							<Carousel
								opts={{ align: "start", loop: false }}
								className="w-full"
							>
								<CarouselContent>
									{pricing.map((item, idx) => (
										<CarouselItem
											key={idx}
											className="basis-full md:basis-1/2 lg:basis-1/2 p-4"
										>
											<div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
												<div className="p-8 flex-1">
													<div className="flex items-center justify-between mb-6">
														<div className="flex items-center gap-3">
															<div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
																<Users className="h-5 w-5" />
															</div>
															<div>
																<p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
																	Capacidad
																</p>
																<h5 className="text-xl font-black text-[#2C3A2C]">
																	{item.capacidad} Personas
																</h5>
															</div>
														</div>
														{item.es_paquete && (
															<Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-black px-3 py-1 uppercase tracking-tighter">
																PAQUETE
															</Badge>
														)}
													</div>

													<div className="grid grid-cols-1 gap-4 mb-6">
														<div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100/50 flex items-center justify-between">
															<div className="flex items-center gap-3">
																<div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
																	<UserCheck className="h-4 w-4" />
																</div>
																<span className="text-xs font-black text-[#2C3A2C] uppercase tracking-tight">
																	Con Privilegio
																</span>
															</div>
															<span className="text-2xl font-black text-emerald-600 tracking-tighter">
																{formatCurrency(Math.ceil(Number(item.precio_con_privilegio)))}
															</span>
														</div>

														<div className="bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between">
															<div className="flex items-center gap-3">
																<div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
																	<Users className="h-4 w-4" />
																</div>
																<span className="text-xs font-black text-[#2C3A2C] uppercase tracking-tight">
																	Sin Privilegio
																</span>
															</div>
															<span className="text-2xl font-black text-[#2C3A2C] tracking-tighter">
																{formatCurrency(Math.ceil(Number(item.precio_sin_privilegio)))}
															</span>
														</div>
													</div>

													<div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight pl-2">
														<Sparkles className="h-3 w-3 text-amber-400" />
														Aplicable en: {item.regla_nombre}
													</div>
												</div>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="flex -left-6" />
								<CarouselNext className="flex -right-6" />
								<CarouselDots className="mt-8" />
							</Carousel>
						</div>
					) : (
						<div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
							<Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
							<p className="text-gray-400 font-black tracking-tight">
								No hay precios definidos para esta categoría de tarifa.
							</p>
						</div>
					)}

					<div className="bg-amber-50/50 rounded-[2rem] p-6 flex gap-4 border border-amber-100/50">
						<Info className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
						<div>
							<h5 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">
								Información de Reserva
							</h5>
							<p className="text-[11px] text-amber-800/80 leading-relaxed font-medium">
								Los precios mostrados son referenciales y pueden variar según la
								temporada, feriados o promociones vigentes. El precio final se
								confirmará al seleccionar las fechas de su estadía en el
								siguiente paso.
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
