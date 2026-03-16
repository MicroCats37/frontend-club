"use client";

import {
	DollarSign,
	Home,
	Info,
	LayoutGrid,
	UserCheck,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/format/currency";

interface BungalowPriceDetailsModalProps {
	bungalow: any; // Using any for flexibility with the pricing summary data
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BungalowPriceDetailsModal({
	bungalow,
	open,
	onOpenChange,
}: BungalowPriceDetailsModalProps) {
	if (!bungalow) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full sm:max-w-[700px] max-h-[90vh] rounded-2xl border-none shadow-2xl p-0 flex flex-col overflow-hidden bg-white">
				<DialogHeader className="p-8 bg-[#064E3B] text-white shrink-0 relative overflow-hidden">
					{/* Decorative background element */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />

					<div className="relative z-10">
						<div className="flex items-center gap-4 mb-2">
							<div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
								<Home className="h-6 w-6 text-white" />
							</div>
							<div>
								<DialogTitle className="text-3xl font-black tracking-tight">
									Bungalow #{bungalow.numero}
								</DialogTitle>
								<p className="text-emerald-100/70 text-sm font-bold uppercase tracking-widest mt-0.5">
									{bungalow.nombre}
								</p>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-[10px] font-black rounded-lg px-2 py-0.5">
								{bungalow.zona || "ÁREA GENERAL"}
							</Badge>
							<Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-[10px] font-black rounded-lg px-2 py-0.5">
								CAPACIDAD: {bungalow.capacidad} PERSONAS
							</Badge>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gray-50/30">
					<div className="space-y-6">
						<div className="flex items-center justify-between border-b border-gray-100 pb-4">
							<h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
								<DollarSign className="w-5 h-5 text-emerald-600" />
								Tarifario Vigente
							</h3>
							<Badge
								variant="outline"
								className="text-[10px] font-black border-emerald-100 text-emerald-700 bg-emerald-50"
							>
								{bungalow.precios?.length || 0} REGLAS ACTIVAS
							</Badge>
						</div>

						{bungalow.precios?.length > 0 ? (
							<div className="grid gap-4">
								{bungalow.precios.map((precio: any, idx: number) => (
									<div
										key={`${precio.tipo_tarifa_id}-${idx}`}
										className={`group relative bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-200/50 ${!precio.activo ? "opacity-50 grayscale" : ""}`}
									>
										<div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
														{precio.motor}
													</span>
													{precio.es_paquete && (
														<Badge className="bg-emerald-100 text-emerald-800 border-none text-[8px] font-black px-1.5 py-0">
															PAQUETE
														</Badge>
													)}
												</div>
												<h4 className="text-xl font-black text-[#111827] tracking-tight leading-none group-hover:text-emerald-900 transition-colors">
													{precio.tipo_tarifa_nombre}
												</h4>
											</div>

											<div className="flex items-center gap-3 shrink-0">
												<div className="text-right">
													<div className="flex items-center justify-end gap-1.5 mb-1">
														<UserCheck className="w-3 h-3 text-emerald-600" />
														<span className="text-[9px] font-black text-[#8BA18B] uppercase tracking-tighter">
															CON PRIVILEGIO
														</span>
													</div>
													<div className="text-2xl font-black text-emerald-600 tracking-tighter px-3 py-1 bg-emerald-50 rounded-sm border border-emerald-100/50">
														{formatCurrency(precio.precio_con_privilegio)}
													</div>
												</div>
												<div className="w-[1px] h-10 bg-gray-100 mx-1" />
												<div className="text-right">
													<div className="flex items-center justify-end gap-1.5 mb-1">
														<Users className="w-3 h-3 text-gray-400" />
														<span className="text-[9px] font-black text-[#8BA18B] uppercase tracking-tighter">
															SIN PRIVILEGIO
														</span>
													</div>
													<div className="text-2xl font-black text-[#111827] tracking-tighter px-3 py-1 bg-gray-100/50 rounded-sm border border-gray-200/30">
														{formatCurrency(precio.precio_sin_privilegio)}
													</div>
												</div>
											</div>
										</div>

										{/* Progressive Reveal shadow */}
										{!precio.activo && (
											<div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none" />
										)}
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-inner">
								<Info className="h-10 w-10 text-gray-300 mx-auto mb-3" />
								<p className="text-gray-400 font-bold text-sm tracking-tight">
									No se encontraron reglas de precio activas para este bungalow.
								</p>
							</div>
						)}
					</div>

					<div className="bg-emerald-50/50 rounded-2xl p-5 flex gap-4 border border-emerald-100/30">
						<LayoutGrid className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
						<div>
							<h5 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-1">
								Nota del Tarifario
							</h5>
							<p className="text-[11px] text-emerald-700/80 leading-relaxed font-medium">
								Los precios mostrados corresponden a la base calculada según la
								categoría y capacidad del bungalow. Cualquier modificación
								realizada en "Precios Especiales" se reflejará aquí de forma
								inmediata.
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
