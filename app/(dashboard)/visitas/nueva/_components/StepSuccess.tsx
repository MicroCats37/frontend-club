"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	AlertCircle,
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
		createdVisitId,
		ordenCobroId,
		totalEstimado,
		fechaLimitePago,
		reset,
	} = useVisitaRegistrationStore();
	const [showIzipayModal, setShowIzipayModal] = useState(false);

	const handleGoToList = () => {
		reset();
		router.push("/visitas");
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
		<div className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
			<div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
				{/* Top Hero Section */}
				<div className="bg-[#2C3A2C] p-12 text-center relative overflow-hidden">
					<div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
						<CheckCircle2 className="h-40 w-40 text-white" />
					</div>

					<div className="relative z-10 flex flex-col items-center">
						<div className="h-24 w-24 bg-emerald-500 rounded-[32px] flex items-center justify-center shadow-lg shadow-emerald-900/40 mb-8 scale-in duration-700 animate-in fade-in zoom-in">
							<CheckCircle2 className="h-12 w-12 text-white" />
						</div>

						<h2 className="text-4xl font-black text-white tracking-tight mb-4">
							¡Registro Terminado!
						</h2>
						<p className="text-emerald-100/60 font-medium text-lg max-w-[320px] leading-relaxed">
							Tu reservación se ha procesado con éxito en nuestro sistema.
						</p>
					</div>
				</div>

				{/* Details and Actions */}
				<div className="p-6 sm:p-10 bg-white">
					<div className="bg-gray-50 rounded-[32px] p-6 sm:p-8 mb-8 sm:mb-10 border border-gray-100 flex flex-col items-center text-center">
						<span className="text-[10px] sm:text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] mb-3">
							Monto Total de la Orden
						</span>
						<div className="flex items-baseline gap-2 mb-2">
							<span className="text-xl sm:text-2xl font-black text-[#2C3A2C] opacity-40">
								S/
							</span>
							<h3 className="text-4xl sm:text-6xl font-black text-[#2C3A2C] tracking-tighter">
								{Number(totalEstimado || 0).toFixed(2)}
							</h3>
						</div>
						<Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] sm:text-[10px] uppercase px-3 py-1 rounded-lg">
							Pago Pendiente
						</Badge>
					</div>

					{/* Deadline Box */}
					{fechaLimitePago && (
						<div className="mb-6 bg-rose-50 border border-rose-100 rounded-[28px] p-6 flex items-center gap-5 shadow-sm animate-in zoom-in duration-500">
							<div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-rose-100/50">
								<Clock className="h-7 w-7 text-rose-500 animate-pulse" />
							</div>
							<div className="flex-1">
								<p className="text-[10px] uppercase font-black text-rose-400 tracking-[0.15em] mb-1">
									Fecha Límite de Pago
								</p>
								<p className="text-rose-900 text-xl font-black tracking-tight leading-none capitalize">
									{format(new Date(fechaLimitePago), "PPPP p", { locale: es })}
								</p>
							</div>
						</div>
					)}

					{/* Warning Box */}
					<div className="mb-8 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-2xl sm:rounded-[24px] flex items-start gap-4">
						<div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
							<AlertCircle className="h-5 w-5 text-white" />
						</div>
						<div className="space-y-1">
							<p className="font-black text-amber-900 text-[10px] uppercase tracking-wider">
								Aviso Importante
							</p>
							<p className="text-[#2C3A2C] text-[11px] sm:text-xs font-bold leading-relaxed">
								Una vez realizado el pago,{" "}
								<span className="text-amber-600 underline decoration-2 underline-offset-2 uppercase">
									no podrás editar
								</span>{" "}
								los integrantes de esta visita a menos que halla reservado una
								Visita con bungalow.
							</p>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<Button
							onClick={handlePayNow}
							className="flex-1 h-16 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-[#2C3A2C] hover:bg-black text-white font-black text-lg sm:text-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 group order-1 sm:order-2"
						>
							<CreditCard className="mr-3 sm:mr-4 h-6 w-6 sm:h-7 sm:w-7 text-amber-500 group-hover:rotate-12 transition-transform" />
							Pagar Ahora
						</Button>

						<Button
							variant="outline"
							onClick={handleGoToList}
							className="flex-1 h-16 sm:h-20 rounded-[20px] sm:rounded-[24px] border-2 border-gray-100 hover:bg-gray-50 text-[#2C3A2C] font-black text-base sm:text-lg transition-all active:scale-95 order-2 sm:order-1"
						>
							<LayoutList className="mr-2 sm:mr-3 h-5 w-5 opacity-40" />
							Mis Visitas
						</Button>
					</div>

					<div className="mt-8 sm:mt-10 bg-blue-50/50 p-4 sm:p-5 rounded-2xl sm:rounded-[24px] border border-blue-100/50">
						<p className="text-center text-[9px] sm:text-[10px] font-bold text-blue-700/60 uppercase tracking-widest leading-relaxed">
							Podrás pagar más tarde desde la sección de visitas en tu panel.
						</p>
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
