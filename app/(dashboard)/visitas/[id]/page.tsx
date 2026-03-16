"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format, isAfter, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	Clock,
	Edit2,
	History,
	Home,
	Info,
	Moon,
	Plus,
	Receipt,
	Ticket,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";
import { IzipayModal } from "@/components/pagos/IzipayModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EditIngresantesModal } from "@/components/visitas/EditIngresantesModal";
import { ReceiptModal } from "@/components/visitas/ReceiptModal";
import { useGetVisitaDetail } from "@/hooks/visitas/useGetVisitaDetail";

const StatusBadge = ({ estado }: { estado: string }) => {
	const config: Record<
		string,
		{ label: string; className: string; icon: any }
	> = {
		PENDIENTE: {
			label: "Pendiente",
			className: "bg-amber-50 text-amber-700 border-amber-200",
			icon: Clock,
		},
		CONFIRMADA: {
			label: "Confirmada",
			className: "bg-emerald-50 text-emerald-700 border-emerald-200",
			icon: CheckCircle2,
		},
		FINALIZADA: {
			label: "Finalizada",
			className: "bg-blue-50 text-blue-700 border-blue-200",
			icon: History,
		},
		CANCELADA: {
			label: "Anulada",
			className: "bg-rose-50 text-rose-700 border-rose-200",
			icon: XCircle,
		},
		VENCIDA: {
			label: "Vencido",
			className: "bg-gray-100 text-gray-500 border-gray-300",
			icon: Clock,
		},
	};

	const item = config[estado] || config.PENDIENTE;
	const Icon = item.icon;

	return (
		<Badge
			variant="outline"
			className={`px-3 md:px-4 py-1 flex md:py-1.5 items-center gap-2 font-black uppercase text-[9px] md:text-[11px] tracking-wider rounded-xl md:rounded-2xl shadow-sm ${item.className}`}
		>
			<Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
			{item.label}
		</Badge>
	);
};

export default function VisitaDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: visita, isLoading, isError } = useGetVisitaDetail(id);

	const [activeOrdenId, setActiveOrdenId] = useState<string | null>(null);
	const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const handlePaymentSuccess = () => {
		setActiveOrdenId(null);
		queryClient.invalidateQueries({ queryKey: ["visita", id] });
	};

	const isBungalow = useMemo(
		() => !!(visita?.reserva_asociada || (visita as any)?.reserva),
		[visita],
	);
	const ingresantes = visita?.lista_ingresantes?.ingresantes || [];
	const reservaBungalow = visita?.reserva_asociada || (visita as any)?.reserva;

	const canEditGuests = useMemo(() => {
		if (!visita) return false;

		const fechaInicioRaw = visita.fecha_inicio || reservaBungalow?.fecha_inicio;

		// Regla para Bungalows: 24h antes del inicio
		if (isBungalow && fechaInicioRaw) {
			const fechaInicio = new Date(fechaInicioRaw);
			const limite = new Date(fechaInicio);
			limite.setDate(limite.getDate() - 1);
			limite.setHours(19, 0, 0, 0); // 19:00 del día anterior

			return new Date() < limite;
		}

		// Regla para Pases Diarios: Antes del pago/confirmación y antes del inicio
		const basicCheck = !(
			visita.pagado ||
			visita.lista_ingresantes?.esta_pagada ||
			visita.estado === "CONFIRMADA"
		);

		if (!basicCheck) return false;

		return (
			fechaInicioRaw &&
			isAfter(new Date(fechaInicioRaw), startOfDay(new Date()))
		);
	}, [visita, isBungalow, reservaBungalow]);

	const isPaymentExpired = useMemo(() => {
		if (visita?.pagado) return false;
		if (!visita?.fecha_limite_pago) return false;
		return new Date(visita.fecha_limite_pago) < new Date();
	}, [visita?.fecha_limite_pago, visita?.pagado]);

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 md:px-6">
				<Skeleton className="h-20 w-full rounded-3xl" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-64 w-full rounded-[40px]" />
						<Skeleton className="h-96 w-full rounded-[40px]" />
					</div>
					<Skeleton className="h-[600px] w-full rounded-[40px]" />
				</div>
			</div>
		);
	}

	if (isError || !visita) {
		return (
			<div className="max-w-md mx-auto py-20 text-center px-4">
				<div className="bg-rose-50 p-6 rounded-[32px] mb-6 inline-block">
					<XCircle className="h-12 w-12 text-rose-500" />
				</div>
				<h2 className="text-2xl font-black text-[#2C3A2C]">
					Error al cargar la visita
				</h2>
				<p className="text-gray-500 mt-2">
					No pudimos encontrar la información o no tienes permisos.
				</p>
				<Button
					variant="outline"
					className="mt-8 rounded-2xl px-8"
					onClick={() => router.back()}
				>
					Volver atrás
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto pb-24 space-y-6 md:space-y-8 animate-in fade-in duration-700 px-4 md:px-6">
			{/* Header / Nav (Glassmorphism Header) */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-xl bg-white/80 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/40 shadow-xl shadow-gray-200/20 relative group overflow-hidden">
				<div className="flex items-center gap-4 md:gap-6">
					<Button
						variant="outline"
						size="icon"
						className="rounded-2xl h-12 w-12 border-gray-100 hover:bg-gray-50 text-gray-500 transition-all"
						onClick={() => router.back()}
					>
						<ChevronLeft className="h-6 w-6" />
					</Button>
					<div>
						<div className="flex flex-wrap items-center gap-3">
							<h1 className="text-2xl md:text-3xl font-black text-[#2C3A2C] tracking-tighter">
								{isBungalow ? "Detalle de Estadía" : "Detalle de Pase"}
							</h1>
							<StatusBadge
								estado={visita.pagado ? "CONFIRMADA" : visita.estado}
							/>
						</div>
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
							ID: {visita.id_publico || visita.id.split("-")[0]}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button
						variant="outline"
						className="rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-[0.2em] border-gray-100 hover:bg-[#2C3A2C] hover:text-white transition-all"
						onClick={() => setIsReceiptModalOpen(true)}
					>
						<Receipt className="mr-2 h-4 w-4" /> Detalle Pago
					</Button>
					<Link href={`/visitas/nueva`}>
						<Button className="rounded-2xl h-12 px-6 bg-[#2C3A2C] hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/10">
							Nuevo Registro <Plus className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			{/* BENTO GRID 12 COLUMNS */}
			<div className="grid grid-cols-12 gap-6 md:gap-8">
				{/* BLOCK A: Main Info & Dates (Span 12 -> 8) */}
				<div className="col-span-12 lg:col-span-8 space-y-6 md:space-y-8">
					{/* DATE CARD (Bento Item 1) */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
						<div className="bg-white border-none p-8 rounded-[32px] md:rounded-[40px] shadow-xl shadow-gray-200/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
							<div className="h-14 w-14 bg-[#2C3A2C]/10 text-[#2C3A2C] rounded-2xl flex items-center justify-center shrink-0">
								<Calendar className="h-7 w-7" />
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
									{isBungalow ? "Entrada" : "Fecha Visita"}
								</p>
								<p className="text-xl font-black text-[#2C3A2C] tracking-tight">
									{visita.fecha_inicio
										? format(new Date(visita.fecha_inicio), "PPP", {
												locale: es,
											})
										: "—"}
								</p>
							</div>
						</div>

						<div className="bg-white border-none p-8 rounded-[32px] md:rounded-[40px] shadow-xl shadow-gray-200/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
							<div className="h-14 w-14 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
								<Moon className="h-7 w-7" />
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
									{isBungalow ? "Salida" : "Limite Pase"}
								</p>
								<p className="text-xl font-black text-[#2C3A2C] tracking-tight">
									{visita.fecha_fin
										? format(new Date(visita.fecha_fin), "PPP", {
												locale: es,
											})
										: "—"}
								</p>
							</div>
						</div>
					</div>

					{/* ALOJAMIENTO (Bento Item 2) */}
					{isBungalow && (
						<div className="bg-white border-none p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl shadow-gray-200/40">
							<div className="flex items-center justify-between gap-4 mb-10">
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
										<Home className="h-6 w-6" />
									</div>
									<div>
										<h3 className="text-xl font-black text-[#2C3A2C] uppercase tracking-tight">
											Mis Bungalows
										</h3>
										<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
											Detalle de asignación
										</p>
									</div>
								</div>
								<Badge className="bg-[#2C3A2C] text-white rounded-xl font-black text-[10px] px-4 py-1">
									{reservaBungalow?.bungalows_alquilados.length} UNIDAD(ES)
								</Badge>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{reservaBungalow?.bungalows_alquilados.map((item: any) => (
									<div
										key={item.id}
										className="border border-gray-100 rounded-[28px] p-6 hover:bg-gray-50/50 transition-all group"
									>
										<div className="flex items-center justify-between mb-6">
											<div className="flex items-center gap-4">
												<div className="h-12 w-12 rounded-2xl border-2 border-[#2C3A2C] flex items-center justify-center font-black text-[#2C3A2C] text-sm">
													{item.bungalow.numero}
												</div>
												<div>
													<h4 className="font-black text-[#2C3A2C] text-base uppercase">
														{item.bungalow.nombre}
													</h4>
													<p className="text-[10px] font-bold text-gray-400 uppercase">
														{item.desglose_noches?.length} Noches reservadas
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-black text-[#2C3A2C]">
													S/ {Number(item.precio_subtotal).toFixed(2)}
												</p>
											</div>
										</div>

										{/* DESGLOSE DETALLADO DE NOCHES */}
										<div className="space-y-2">
											<p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-3 border-b pb-2">
												Desglose de Tarifas
											</p>
											{item.desglose_noches?.map((n: any, i: number) => (
												<div
													key={i}
													className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-50"
												>
													<div className="flex flex-col">
														<span className="text-[10px] font-black text-[#2C3A2C]">
															{format(new Date(n.fecha), "EEEE dd", {
																locale: es,
															}).toUpperCase()}
														</span>
														<span className="text-[8px] font-bold text-emerald-600 uppercase">
															{n.tarifa_nombre || "Tarifa Base"}
														</span>
													</div>
													<div className="text-right">
														<span className="text-[10px] font-black text-[#2C3A2C]">
															S/ {Number(n.precio).toFixed(2)}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* GUESTS (Bento Item 3) */}
					<div className="bg-white border-none p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl shadow-gray-200/40">
						<div className="flex items-center justify-between gap-4 mb-8">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center">
									<Users className="h-6 w-6" />
								</div>
								<div>
									<h3 className="text-xl font-black text-[#2C3A2C] uppercase tracking-tight">
										Lista de Invitados
									</h3>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
										Ingresantes registrados
									</p>
								</div>
							</div>
							{canEditGuests &&
								visita.estado !== "FINALIZADA" &&
								visita.estado !== "CANCELADA" && (
									<Button
										variant="outline"
										className="rounded-xl font-black text-[10px] uppercase text-amber-600 border-amber-100 hover:bg-amber-50 px-5 h-10 gap-2"
										onClick={() => setIsEditModalOpen(true)}
									>
										<Edit2 className="h-3 w-3" /> Editar Lista
									</Button>
								)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{ingresantes.map((ing: any) => (
								<div
									key={ing.id}
									className="flex items-center justify-between p-5 rounded-[24px] border border-gray-100 group hover:border-[#2C3A2C]/20 transition-all bg-white shadow-sm shadow-gray-100/20"
								>
									<div className="flex items-center gap-4 min-w-0">
										<div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-[#2C3A2C] group-hover:bg-[#2C3A2C] group-hover:text-white transition-all text-sm">
											{ing.persona.nombres[0]}
										</div>
										<div className="min-w-0">
											<p className="font-black text-[#2C3A2C] text-sm uppercase tracking-tight truncate">
												{ing.persona.nombre_completo}
											</p>
											<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
												DNI {ing.persona.dni}
											</p>
										</div>
									</div>
									<div className="flex flex-col items-end shrink-0">
										<Badge
											variant="outline"
											className="text-[9px] font-black border-none bg-gray-50 text-[#2C3A2C] px-2 py-0.5 rounded-lg"
										>
											{ing.con_cupon
												? "CUPO"
												: `S/ ${Number(ing.precio_entrada).toFixed(2)}`}
										</Badge>
										{ing.fecha_checkin && (
											<span className="text-[8px] font-black text-emerald-600 uppercase mt-1.5 flex items-center gap-1">
												<div className="h-1 w-1 bg-emerald-600 rounded-full animate-pulse" />{" "}
												Ingresó
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* SIDEBAR: Totals & Payments (Span 12 -> 4) */}
				<div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
					{/* ECONOMY CARD (Bento Item 4) */}
					<div className="bg-[#2C3A2C] text-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl relative overflow-hidden group">
						<div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
							<TrendingUp className="h-48 w-48" />
						</div>

						<h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-12 flex items-center gap-2">
							<div className="h-1 w-4 bg-emerald-500 rounded-full" /> Estado
							Financiero
						</h4>

						<div className="space-y-6 mb-12 relative z-10">
							<div className="flex justify-between items-center text-white/60 text-[13px] font-bold uppercase tracking-widest">
								<span>Pase Base</span>
								<span>S/ {Number(visita.monto_total).toFixed(2)}</span>
							</div>
							<div className="flex justify-between items-center text-emerald-400 text-[13px] font-bold uppercase tracking-widest">
								<span>Bonificaciones</span>
								<span className="italic">- S/ 0.00</span>
							</div>
							<Separator className="bg-white/10" />
							<div className="pt-4">
								<p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">
									Monto Final
								</p>
								<p className="text-5xl md:text-6xl font-black tracking-tighter text-white">
									S/ {Number(visita.monto_total).toFixed(2)}
								</p>
							</div>
						</div>

						<Badge
							className={`w-full justify-center rounded-2xl font-black text-[11px] py-2.5 tracking-[0.2em] border-none shadow-2xl ${visita.pagado ? "bg-emerald-500" : "bg-amber-500"} text-white`}
						>
							{visita.pagado ? "RESERVA ACTIVA" : "PAGO PENDIENTE"}
						</Badge>
					</div>

					{/* PAYMENT ACTION (Bento Item 5) */}
					{!visita.pagado && (
						<div className="bg-white border-none p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl shadow-gray-200/40 relative overflow-hidden group">
							<div className="absolute top-0 right-0 h-full w-32 bg-amber-50/50 -skew-x-12 translate-x-16 pointer-events-none" />
							<div className="flex items-center justify-between mb-8">
								<div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
										Saldo a Liquidar
									</p>
									<p className="text-4xl font-black text-[#2C3A2C] tracking-tighter">
										S/{" "}
										{Number(
											(visita as any).saldo_total || visita.monto_total,
										).toFixed(2)}
									</p>
								</div>
								<div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
									<Ticket className="h-8 w-8" />
								</div>
							</div>

							{!isPaymentExpired ? (
								<Button
									className="w-full h-14 rounded-2xl bg-[#2C3A2C] text-white hover:bg-black font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
									onClick={() => {
										const idOrden =
											reservaBungalow?.orden_cobro?.id ||
											reservaBungalow?.orden_cobro_id ||
											visita.lista_ingresantes?.orden_cobro?.id ||
											visita.lista_ingresantes?.orden_cobro_id;
										if (idOrden) setActiveOrdenId(idOrden);
										else toast.info("No hay órdenes de cobro pendientes.");
									}}
								>
									Continuar al Pago <ArrowRight className="ml-3 h-4 w-4" />
								</Button>
							) : (
								<div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex items-center gap-4">
									<XCircle className="h-6 w-6 text-rose-500 shrink-0" />
									<p className="text-[10px] font-bold text-rose-700 leading-tight uppercase tracking-widest">
										Plazo de pago expirado. Favor contactar al administrador.
									</p>
								</div>
							)}
							<p className="text-[9px] font-bold text-gray-300 uppercase mt-8 text-center tracking-[0.2em]">
								Secure Access • SSL Encryption
							</p>
						</div>
					)}

					{/* INFO BOX (Bento Item 6) */}
					<div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm">
						<div className="flex items-center gap-3 mb-4">
							<div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center">
								<Info className="h-4 w-4 text-[#2C3A2C]" />
							</div>
							<p className="text-[10px] font-black uppercase tracking-widest text-[#2C3A2C]">
								Recordatorio
							</p>
						</div>
						<p className="text-[11px] font-medium text-gray-400 leading-relaxed italic">
							Es obligatorio que todos los invitados porten su documento de
							identidad físico para el control de accesos. El check-in de
							bungalows inicia a las 19:00 PM.
						</p>
					</div>
				</div>
			</div>

			<IzipayModal
				isOpen={!!activeOrdenId}
				onClose={() => setActiveOrdenId(null)}
				ordenId={activeOrdenId || ""}
				onSuccess={handlePaymentSuccess}
			/>

			<ReceiptModal
				isOpen={isReceiptModalOpen}
				onClose={() => setIsReceiptModalOpen(false)}
				visita={visita}
			/>

			<EditIngresantesModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				visita={visita}
			/>
		</div>
	);
}
