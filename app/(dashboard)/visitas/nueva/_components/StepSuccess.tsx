"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	AlertCircle,
	CalendarDays,
	CheckCircle2,
	Clock,
	CreditCard,
	LayoutList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { IzipayModal } from "@/components/pagos/IzipayModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepSuccess() {
	const router = useRouter();
	const {
		tipoVisita,
		fechas,
		noches,
		createdVisitId,
		ordenCobroId,
		totalEstimado,
		fechaLimitePago,
		reset,
	} = useVisitaRegistrationStore();
	const [showIzipayModal, setShowIzipayModal] = useState(false);

	const handleGoToList = () => {
		const id = createdVisitId;
		reset();
		if (id) {
			router.push(`/visitas/${id}`);
		} else {
			router.push("/visitas");
		}
	};

	const handlePayNow = () => {
		if (ordenCobroId) {
			setShowIzipayModal(true);
		} else {
			toast.info(
				"No se generó una orden de pago automática. Redirigiendo al detalle.",
			);
			if (createdVisitId) {
				const id = createdVisitId;
				reset();
				router.push(`/visitas/${id}`);
			}
		}
	};

	const handlePaymentSuccess = () => {
		setShowIzipayModal(false);
		toast.success("Pago procesado con éxito.");
		if (createdVisitId) {
			const id = createdVisitId;
			reset();
			router.push(`/visitas/${id}`);
		} else {
			reset();
			router.push("/visitas");
		}
	};

	return (
		<div className="max-w-6xl mx-auto py-6 sm:py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
			<div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row md:items-stretch min-h-[400px] md:min-h-0">
				{/* Status Banner (Left side on Horizontal) */}
				<div className="bg-[#2C3A2C] p-8 md:w-80 lg:w-96 flex flex-col items-center justify-center text-center relative shrink-0">
					<div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none overflow-hidden h-full w-full flex items-center justify-center">
						<CheckCircle2 className="h-48 w-48 text-white -rotate-12 translate-x-4 translate-y-4" />
					</div>

					<div className="relative z-10 flex flex-col items-center">
						<div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 mb-6 scale-in duration-700 animate-in fade-in zoom-in">
							<CheckCircle2 className="h-8 w-8 text-white" />
						</div>

						<h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
							¡Registro
							<br className="hidden md:block" /> Terminado!
						</h2>
						<p className="text-emerald-100/40 font-bold text-xs max-w-[200px] leading-relaxed">
							{tipoVisita === "BUNGALOW"
								? "Estadía pre-registrada con éxito."
								: "Pase diario generado con éxito."}
						</p>
					</div>
				</div>

				{/* Content & Actions (Right side on Horizontal) */}
				<div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white relative">
					<div className="space-y-5">
						{/* Amount Section - Horizontal Bar */}
						<div className="bg-gray-50 rounded-[28px] p-6 sm:p-8 border border-gray-100 flex flex-row items-center justify-between">
							<div className="flex flex-col">
								<span className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-1">
									Monto Total
								</span>
								<div className="flex items-baseline gap-2">
									<span className="text-lg font-black text-[#2C3A2C] opacity-30">
										S/
									</span>
									<h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C3A2C] tracking-tighter">
										{Math.ceil(Number(totalEstimado || 0))}
									</h3>
								</div>
							</div>
							<Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-xl shrink-0">
								Pago Pendiente
							</Badge>
						</div>

						{/* Breakdown of Nights if Bungalow or Single date if Daily Pass */}
						<div className="bg-gray-50/50 rounded-[24px] p-6 border border-dashed border-gray-200">
							<div className="flex items-center gap-3 mb-4">
								<CalendarDays className="h-5 w-5 text-amber-500" />
								<span className="text-[11px] uppercase font-black text-[#2C3A2C]/60 tracking-wider">
									Detalles de Fecha(s) de Visita
								</span>
							</div>

							<div className="flex flex-wrap gap-2">
								{tipoVisita === "PASE_DIARIO" ? (
									<Badge
										variant="outline"
										className="bg-white border-gray-200 text-[#2C3A2C] text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
									>
										{fechas.start
											? format(new Date(fechas.start), "eeee dd 'de' MMMM", {
													locale: es,
												})
											: "—"}
									</Badge>
								) : (
									[...noches]
										.sort((a, b) => a.getTime() - b.getTime())
										.map((d, i) => (
											<Badge
												key={i}
												variant="outline"
												className="bg-white border-gray-200 text-[#2C3A2C] text-xs font-bold px-3 py-2 rounded-xl shadow-sm"
											>
												{format(d, "dd MMM", { locale: es })}
											</Badge>
										))
								)}
							</div>
						</div>

						{/* Info Grid - Two Columns on Horizontal */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{fechaLimitePago && (
								<div className="bg-rose-50/30 border border-rose-100/30 rounded-2xl p-4 flex items-center gap-4">
									<Clock className="h-5 w-5 text-rose-500 shrink-0" />
									<div className="flex flex-col">
										<p className="text-[9px] uppercase font-black text-rose-400 tracking-[0.1em] mb-0.5">
											Fecha Límite Pago
										</p>
										<p className="text-rose-900 text-xs font-bold">
											{format(new Date(fechaLimitePago), "PP p", {
												locale: es,
											})}
										</p>
									</div>
								</div>
							)}

							<div className="bg-blue-50/30 border border-blue-100/30 rounded-2xl p-4 flex items-center gap-4">
								<AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
								<div className="flex flex-col">
									<p className="text-[9px] uppercase font-black text-blue-400 tracking-[0.1em] mb-0.5">
										Nota Importante
									</p>
									<p className="text-blue-900 text-xs font-bold leading-tight">
										Pago disponible en tu panel personal del club.
									</p>
								</div>
							</div>
						</div>

						{/* Small Warning */}
						<div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
							<p className="text-[#2C3A2C] text-xs font-bold leading-relaxed">
								<span className="text-amber-600 font-black uppercase text-[10px] tracking-wider block mb-1">
									Importante
								</span>
								El registro se confirma con el pago. Una vez pagado, no podrás{" "}
								{createdVisitId && (
									<button
										type="button"
										onClick={handleGoToList}
										className="text-amber-600 hover:text-amber-700 underline decoration-2 underline-offset-4 transition-colors"
									>
										editar integrantes
									</button>
								)}
								{!createdVisitId && "editar integrantes"} (excepto en
								bungalows).
							</p>
						</div>
					</div>

					{/* Action Buttons Horizontal Row */}
					<div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
						<Button
							onClick={handlePayNow}
							className="w-full sm:flex-[2] h-14 lg:h-16 rounded-2xl bg-[#2C3A2C] hover:bg-black text-white font-black text-[13px] uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
						>
							<CreditCard className="mr-3 h-5 w-5 text-amber-500" />
							Realizar Pago de Visita
						</Button>

						<div className="w-full sm:flex-1 flex flex-row gap-3">
							<Button
								variant="outline"
								onClick={handleGoToList}
								className="flex-1 h-14 lg:h-16 rounded-2xl border-2 border-gray-100 hover:border-amber-200 text-[#2C3A2C] font-black text-[11px] uppercase tracking-widest bg-gray-50/50"
							>
								<LayoutList className="mr-2 h-4 w-4 opacity-30" />
								Visitas
							</Button>
						</div>
					</div>
				</div>
			</div>

			<IzipayModal
				isOpen={showIzipayModal}
				onClose={() => setShowIzipayModal(false)}
				ordenId={ordenCobroId || ""}
				onSuccess={handlePaymentSuccess}
			/>
		</div>
	);
}
