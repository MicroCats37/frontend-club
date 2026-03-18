"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	Calculator,
	ChevronDown,
	ChevronUp,
	Info,
	Loader2,
	Receipt,
	Tag,
	Ticket,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCotizarVisita } from "@/hooks/visitas/useVisitaFlow";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function IntegratedQuotingArea() {
	const { fechas, guestSelections, setTotalEstimado } =
		useVisitaRegistrationStore();

	const [isExpanded, setIsExpanded] = useState(false);
	const [hasQuoted, setHasQuoted] = useState(false);

	const { mutate: cotizar, isPending, data: cotizacion } = useCotizarVisita();

	const handleCotizar = () => {
		if (!fechas.start || !fechas.end) {
			toast.error("Por favor, selecciona las fechas de tu visita.");
			return;
		}

		if (guestSelections.length === 0) {
			toast.error("Selecciona al menos un invitado.");
			return;
		}

		const request = {
			fecha_inicio: format(fechas.start, "yyyy-MM-dd"),
			fecha_fin: format(fechas.end, "yyyy-MM-dd"),
			ingresantes: guestSelections.map((g) => ({
				persona_id: g.persona_id,
				tipo_entrada_id: g.tipo_entrada_id,
				con_cupon: g.con_cupon || false,
			})),
		};

		cotizar(request, {
			onSuccess: (data) => {
				setTotalEstimado(data.total);
				setHasQuoted(true);
				setIsExpanded(true);
				toast.success("Cotización actualizada");
			},
		});
	};

	return (
		<div className="relative">
			{/* Floating Background Glow */}
			<div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-[48px] blur-3xl -z-10 opacity-50" />

			<div className="bg-white/80 backdrop-blur-xl border border-gray-100/50 rounded-[40px] shadow-2xl shadow-gray-200/50 overflow-hidden transition-all duration-500">
				{/* Top Bar - Summary */}
				<div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-5">
						<div className="h-16 w-16 bg-[#2C3A2C] rounded-[24px] flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
							<Calculator className="h-8 w-8 text-white" />
						</div>
						<div>
							<h3 className="text-2xl font-black text-[#2C3A2C] tracking-tight">
								Resumen de tu Visita
							</h3>
							<p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Receipt className="h-4 w-4" />
								{guestSelections.length}{" "}
								{guestSelections.length === 1 ? "Invitado" : "Invitados"} •
								{fechas.start
									? format(fechas.start, "d 'de' MMMM", { locale: es })
									: "Sin fecha"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4 w-full md:w-auto">
						{hasQuoted && (
							<div className="flex flex-col items-end px-6">
								<span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
									Total Estimado
								</span>
								<span className="text-3xl font-black text-primary tracking-tighter">
									S/ {Math.ceil(Number(cotizacion?.total || 0))}
								</span>
							</div>
						)}

						<Button
							onClick={handleCotizar}
							disabled={isPending}
							className={`h-16 px-10 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${
								hasQuoted
									? "bg-white border-2 border-[#2C3A2C] text-[#2C3A2C] hover:bg-gray-50"
									: "bg-[#2C3A2C] text-white hover:bg-black"
							}`}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Calculando...
								</>
							) : hasQuoted ? (
								"Recalcular"
							) : (
								<>
									<TrendingUp className="mr-2 h-5 w-5" />
									Cotizar Visita
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Detailed Breakdown - Animated Slide Down */}
				{hasQuoted && (
					<div
						className={`border-t border-gray-50 transition-all duration-700 ease-in-out ${
							isExpanded
								? "max-h-[1000px] opacity-100"
								: "max-h-0 opacity-0 pointer-events-none"
						}`}
					>
						<div className="p-8 bg-[#F8FAF8]/50">
							<div className="flex items-center justify-between mb-8">
								<h4 className="text-sm font-black uppercase tracking-widest text-[#2C3A2C] flex items-center gap-2">
									<Ticket className="h-4 w-4" /> Desglose de Entradas
								</h4>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsExpanded(!isExpanded)}
									className="rounded-full"
								>
									{isExpanded ? (
										<ChevronUp className="h-5 w-5" />
									) : (
										<ChevronDown className="h-5 w-5" />
									)}
								</Button>
							</div>

							<div className="grid gap-4">
								{cotizacion?.desglose.map((p, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md transition-shadow"
									>
										<div className="flex items-center gap-4">
											<div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 text-xs">
												{idx + 1}
											</div>
											<div>
												<p className="font-extrabold text-[#2C3A2C]">
													{p.nombre_completo}
												</p>
												<div className="flex items-center gap-3">
													<span className="text-xs font-semibold text-muted-foreground">
														Pase General
													</span>
													{p.usa_cupon && (
														<span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
															<Tag className="h-2.5 w-2.5" /> Cupón Aplicado
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-black text-[#2C3A2C]">
												S/ {Math.ceil(Number(p.total_persona || 0))}
											</p>
											<p className="text-[10px] font-bold text-muted-foreground">
												Precio Unitario
											</p>
										</div>
									</div>
								))}
							</div>

							{/* Promo/Coupon Section */}
							<div className="mt-10 p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
										<Tag className="h-6 w-6 text-white" />
									</div>
									<div className="text-center md:text-left">
										<h5 className="font-black text-[#2C3A2C]">
											¿Tienes un cupón promocional?
										</h5>
										<p className="text-xs font-medium text-muted-foreground">
											Podrás aplicarlo en el resumen final de pago.
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 text-sm font-bold text-primary px-4 py-2 bg-white rounded-xl shadow-sm">
									<Info className="h-4 w-4" />
									Habilitado para tu grupo
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
