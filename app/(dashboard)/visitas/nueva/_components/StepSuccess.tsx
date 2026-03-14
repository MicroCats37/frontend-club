"use client";

import { CheckCircle2, CreditCard, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";
import { IzipayModal } from "@/components/pagos/IzipayModal";
import { toast } from "sonner";

export function StepSuccess() {
	const router = useRouter();
	const { createdVisitId, ordenCobroId, totalEstimado, reset } = useVisitaRegistrationStore();
	const [showIzipayModal, setShowIzipayModal] = useState(false);

	const handleGoToList = () => {
		reset();
		router.push("/visitas");
	};

	const handlePayNow = () => {
		if (ordenCobroId) {
			setShowIzipayModal(true);
		} else {
			toast.info("No se generó una orden de pago automática. Redirigiendo al detalle.");
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
				<div className="p-10 bg-white">
					<div className="bg-gray-50 rounded-[32px] p-8 mb-10 border border-gray-100 flex flex-col items-center text-center">
						<span className="text-[11px] uppercase font-black text-gray-400 tracking-[0.2em] mb-3">
							Monto Total de la Orden
						</span>
						<div className="flex items-baseline gap-2 mb-2">
							<span className="text-2xl font-black text-[#2C3A2C] opacity-40">S/</span>
							<h3 className="text-6xl font-black text-[#2C3A2C] tracking-tighter">
								{Number(totalEstimado || 0).toFixed(2)}
							</h3>
						</div>
						<Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] uppercase px-3 py-1 rounded-lg">
							Pago Pendiente
						</Badge>
					</div>

					<div className="grid grid-cols-1 gap-5">
						<Button
							onClick={handlePayNow}
							className="h-20 rounded-[24px] bg-[#2C3A2C] hover:bg-black text-white font-black text-xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 group"
						>
							<CreditCard className="mr-4 h-7 w-7 text-amber-500 group-hover:rotate-12 transition-transform" />
							Pagar Ahora con Izipay
						</Button>
						
						<Button
							variant="outline"
							onClick={handleGoToList}
							className="h-16 rounded-[24px] border-gray-200 hover:bg-gray-50 text-[#2C3A2C] font-black text-lg transition-all active:scale-95"
						>
							<LayoutList className="mr-3 h-5 w-5 opacity-40" />
							Ver todas mis Visitas
						</Button>
					</div>

					<div className="mt-12 bg-amber-50/50 p-6 rounded-[24px] border border-amber-100/50">
						<p className="text-center text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
							Recuerda completar el pago antes de la fecha límite para garantizar tu ingreso.
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
