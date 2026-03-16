"use client";

import {
	ArrowRight,
	CheckCircle2,
	Crown,
	Info,
	ShieldCheck,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BenefitsModal } from "./BenefitsModal";

interface Benefit {
	title: string;
	description: string;
	highlight?: boolean;
}

interface CategoryBenefits {
	name: string;
	icon: any;
	color: string;
	benefits: Benefit[];
}

const CATEGORY_MAP: Record<string, CategoryBenefits> = {
	HABILITADO: {
		name: "Ingeniero Habilitado",
		icon: Crown,
		color: "from-amber-400 to-amber-600",
		benefits: [
			{
				title: "Acceso Total",
				description: "Ingreso libre a todas las instalaciones del club.",
				highlight: true,
			},
			{
				title: "Reserva Prioritaria",
				description:
					"Acceso anticipado a reservas de bungalows en temporada alta.",
			},
		],
	},
	AFILIADO: {
		name: "Ingeniero Afiliado",
		icon: ShieldCheck,
		color: "from-blue-500 to-blue-700",
		benefits: [
			{
				title: "Socio Activo",
				description: "Acceso a libre al club",
			},
			{
				title: "Cupones de Descuento",
				description: "6 cupones de invitado con 100% de descuento al mes.",
			},

			{
				title: "Beneficiarios Totales",
				description: "Hasta 6 familiares nucleares con ingreso libre al club.",
			},
		],
	},
	NO_HABILITADO: {
		name: "Colegiado (No Habilitado)",
		icon: Info,
		color: "from-gray-500 to-gray-700",
		benefits: [
			{
				title: "Tarifa Base",
				description: "Acceso al club pagando la tarifa de mantenimiento día.",
			},
			{
				title: "Invitados",
				description: "Pago de tarifa general para todos tus invitados.",
			},
		],
	},
};

export function BenefitsBanner({ category }: { category: string | null }) {
	const [showModal, setShowModal] = useState(false);
	const currentCategory = category || "NO_HABILITADO";
	const config = CATEGORY_MAP[currentCategory] || CATEGORY_MAP.NO_HABILITADO;
	const Icon = config.icon;

	return (
		<>
			<div className="w-full bg-white rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
				<div className="flex flex-col lg:flex-row">
					{/* Lado izquierdo: Info de categoría */}
					<div
						className={`lg:w-1/3 bg-gradient-to-br ${config.color} p-10 flex flex-col items-center justify-center text-center text-white relative`}
					>
						<div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
							<svg
								className="h-full w-full"
								viewBox="0 0 100 100"
								preserveAspectRatio="none"
							>
								<path d="M0 100 C 20 0 50 0 100 100" fill="white" />
							</svg>
						</div>

						<div className="bg-white/20 p-6 rounded-[28px] backdrop-blur-md mb-6 shadow-2xl relative z-10 scale-110">
							<Icon className="h-12 w-12 text-white" />
						</div>

						<div className="relative z-10">
							<Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 mb-3 font-black tracking-widest uppercase text-[10px]">
								Tu Categoría Actual
							</Badge>
							<h3 className="text-3xl font-black tracking-tighter mb-2">
								{config.name}
							</h3>
							<p className="text-white/70 font-medium text-sm leading-relaxed max-w-[200px] mx-auto">
								Conoce los beneficios exclusivos que tienes por estar al día con
								tu colegiatura.
							</p>
						</div>
					</div>

					{/* Lado derecho: Lista de beneficios */}
					<div className="lg:w-2/3 p-8 sm:p-12 relative bg-gray-50/30">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
							{config.benefits.map((benefit, idx) => (
								<div
									key={idx}
									className={`flex gap-5 transition-all duration-300 ${benefit.highlight ? "scale-[1.02]" : ""}`}
								>
									<div
										className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
											benefit.highlight
												? "bg-amber-500 text-white shadow-amber-200"
												: "bg-white text-emerald-600 shadow-gray-100"
										}`}
									>
										{benefit.highlight ? (
											<Zap className="h-6 w-6" />
										) : (
											<CheckCircle2 className="h-6 w-6 uppercase" />
										)}
									</div>
									<div>
										<h4 className="font-black text-[#2C3A2C] text-lg mb-1 leading-tight tracking-tight">
											{benefit.title}
										</h4>
										<p className="text-muted-foreground text-sm font-medium leading-normal">
											{benefit.description}
										</p>
									</div>
								</div>
							))}
						</div>

						<div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
									<Crown className="h-4 w-4 fill-current" />
								</div>
							</div>

							<button
								onClick={() => setShowModal(true)}
								className="px-6 py-3 bg-gray-100 hover:bg-amber-100 text-[#2C3A2C] hover:text-amber-700 rounded-2xl font-black text-xs transition-all flex items-center gap-2 group shadow-sm"
							>
								VER TODOS LOS BENEFICIOS
								<ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<BenefitsModal
				open={showModal}
				onOpenChange={setShowModal}
				currentCategory={currentCategory}
			/>
		</>
	);
}
