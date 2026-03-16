"use client";

import { Crown, Info, ShieldCheck, Star, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BenefitsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentCategory: string | null;
}

const CATEGORIES_DATA = [
	{
		id: "AFILIADO",
		name: "Ingeniero Afiliado",
		tag: "Máximo Beneficio",
		color: "amber",
		icon: ShieldCheck,
		image:
			"https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop",
		description: "Para ingenieros inscritos que disfrutan de la vida social.",
		mainBenefits: [
			{
				title: "Ingreso Libre",
				value: "S/ 0.00",
				desc: "No pagas entrada en ninguna de nuestras sedes.",
			},
			{
				title: "Familia Nuclear",
				value: "6 Beneficiarios",
				desc: "Registra hasta 6 familiares directos con beneficios.",
			},
			{
				title: "Invitados con Descuento",
				value: "Descuento Especial de Afiliado",
				desc: "Tus invitados pagan una tarifa reducida exclusiva.",
			},
			{
				title: "Cupones Libres",
				value: "Incluidos",
				desc: "Tickets gratuitos para el ingreso de tus invitados.",
			},
		],
	},
	{
		id: "HABILITADO",
		name: "Ingeniero Habilitado",
		tag: "Socio Activo",
		color: "blue",
		icon: Crown,
		image:
			"https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070&auto=format&fit=crop",
		description: "Para ingenieros al día con sus aportes al CIP.",
		mainBenefits: [
			{
				title: "Ingreso Libre",
				value: "S/ 0.00",
				desc: "No pagas entrada en ninguna de nuestras sedes.",
			},
			{
				title: "Invitados con Descuento",
				value: "Descuento Especial",
				desc: "Tus invitados pagan una tarifa reducida exclusiva.",
			},
		],
	},
	{
		id: "NO_HABILITADO",
		name: "Colegiado General",
		tag: "Mantenimiento",
		color: "gray",
		icon: Info,
		image:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
		description: "Inscrito en el CIP pero con deudas de habilitación.",
		mainBenefits: [
			{
				title: "Acceso",
				value: "Tarifa Base",
				desc: "Pago de mantenimiento por día de visita.",
			},
			{
				title: "Bungalows",
				value: "Tarifa General",
				desc: "Sin descuentos especiales en alojamiento.",
			},
			{
				title: "Beneficiarios",
				value: "Limitado",
				desc: "Restricciones en el registro de grupo familiar.",
			},
		],
	},
];

export function BenefitsModal({
	open,
	onOpenChange,
	currentCategory,
}: BenefitsModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-6xl w-[95vw] p-0 overflow-hidden border-none rounded-[40px] shadow-2xl bg-white max-h-[95vh] flex flex-col focus-visible:outline-none">
				<div className="bg-[#2C3A2C] p-8 sm:p-12 text-center text-white relative shrink-0">
					<div className="absolute top-0 right-0 p-12 opacity-[0.03] animate-pulse">
						<Star size={180} />
					</div>
					<DialogHeader>
						<DialogTitle className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
							Cuadro de Mando de Beneficios
						</DialogTitle>
					</DialogHeader>
					<p className="text-emerald-100/60 font-medium max-w-lg mx-auto text-sm sm:text-base">
						Comparativa detallada de privilegios según tu estado de colegiatura
						en el CIP Lima.
					</p>
				</div>

				<ScrollArea className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 bg-gray-50/30">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
						{CATEGORIES_DATA.map((cat) => {
							const isCurrent = currentCategory === cat.id;
							const Icon = cat.icon;
							const colorClass =
								cat.color === "amber"
									? "bg-amber-500 shadow-amber-200"
									: cat.color === "blue"
										? "bg-blue-600 shadow-blue-200"
										: "bg-gray-600 shadow-gray-200";

							return (
								<div
									key={cat.id}
									className={`relative group bg-white rounded-[32px] border-2 transition-all duration-500 overflow-hidden flex flex-col ${
										isCurrent
											? "border-[#2C3A2C] shadow-2xl scale-[1.02] z-10"
											: "border-transparent shadow-sm hover:border-gray-200"
									}`}
								>
									{/* Main Image Header */}
									<div className="h-40 overflow-hidden relative shrink-0">
										<img
											src={cat.image}
											alt={cat.name}
											className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

										{isCurrent && (
											<div className="absolute top-4 right-4 z-20">
												<Badge className="bg-white text-[#2C3A2C] border-none py-1.5 px-4 font-black text-[9px] uppercase tracking-widest ">
													Tu Nivel
												</Badge>
											</div>
										)}

										<div
											className={`absolute bottom-4 left-4 h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-xl ${colorClass}`}
										>
											<Icon className="h-6 w-6" />
										</div>
									</div>

									<div className="p-6 pb-2">
										<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
											{cat.tag}
										</p>
										<h4 className="text-xl font-black text-[#2C3A2C] leading-tight tracking-tight mb-2">
											{cat.name}
										</h4>
										<p className="text-muted-foreground text-xs font-medium leading-relaxed">
											{cat.description}
										</p>
									</div>

									<div className="flex-1 px-8 pb-8 space-y-4">
										<div className="pt-6 border-t border-gray-50 space-y-6">
											{cat.mainBenefits.map((benefit, bIdx) => (
												<div key={bIdx} className="space-y-1.5">
													<div className="flex items-center justify-between">
														<span className="text-[10px] font-black text-[#2C3A2C] uppercase tracking-wider italic">
															{benefit.title}
														</span>
														<Badge
															variant="outline"
															className="border-gray-100 text-[#2C3A2C] font-black text-[9px] px-2 py-0"
														>
															{benefit.value}
														</Badge>
													</div>
													<p className="text-[11px] text-muted-foreground font-medium leading-normal">
														{benefit.desc}
													</p>
												</div>
											))}
										</div>

										<div
											className={`mt-8 p-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter text-center ${
												isCurrent
													? "bg-emerald-50 text-emerald-700"
													: "bg-gray-50 text-gray-400"
											}`}
										>
											{isCurrent
												? "Beneficios ya aplicados"
												: "Mejora tu estado para activar"}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mb-8 p-1 bg-white border border-gray-100 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 shadow-sm ">
						<div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
							<Users className="h-8 w-8" />
						</div>
						<div className="flex-1 text-center sm:text-left">
							<h5 className="font-black text-[#2C3A2C] text-lg mb-1">
								¿Sabías que puedes agregar a tu familia?
							</h5>
							<p className="text-sm text-muted-foreground font-medium">
								Los socios **Afiliados** pueden registrar hasta 6 beneficiarios
								directos (padres, hijos, cónyuge) para que ellos también
								disfruten de los descuentos.
							</p>
						</div>
						<button className="px-8 py-3 bg-[#2C3A2C] text-white rounded-xl font-black text-xs hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap">
							GESTIONAR GRUPO
						</button>
					</div>
				</ScrollArea>

				<div className="p-8 sm:p-10 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
					<div className="flex items-center gap-3">
						<Zap className="h-5 w-5 text-amber-500 fill-current" />
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[300px]">
							Tarifas sincronizadas con la tesorería del CIP. Válido para el
							periodo fiscal 2026.
						</p>
					</div>
					<button
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto px-10 py-4 bg-[#2C3A2C] text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-[#2C3A2C]/10 active:scale-95"
					>
						CERRAR DASHBOARD
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
