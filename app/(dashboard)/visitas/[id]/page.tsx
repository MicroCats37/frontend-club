"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	Clock,
	History,
	Home,
	Info,
	Plus,
	Receipt,
	Ticket,
	Users,
	XCircle,
	Edit2,
	Moon,
	TrendingUp,
	ShieldCheck,
	QrCode,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVisitaDetail } from "@/hooks/visitas/useGetVisitaDetail";
import { IzipayModal } from "@/components/pagos/IzipayModal";
import { ReceiptModal } from "@/components/visitas/ReceiptModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EditIngresantesModal } from "@/components/visitas/EditIngresantesModal";

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

	const isBungalow = !!visita?.reserva_asociada;
	const ingresantes = visita?.lista_ingresantes?.ingresantes || [];
	const reservaBungalow = visita?.reserva_asociada;

	const ocupacionPercent = useMemo(() => {
		if (!reservaBungalow?.capacidad_total) return 0;
		return Math.min((ingresantes.length / reservaBungalow.capacidad_total) * 100, 100);
	}, [ingresantes.length, reservaBungalow?.capacidad_total]);

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
				<h2 className="text-2xl font-black text-[#2C3A2C]">Error al cargar la visita</h2>
				<p className="text-gray-500 mt-2">No pudimos encontrar la información o no tienes permisos.</p>
				<Button variant="outline" className="mt-8 rounded-2xl px-8" onClick={() => router.back()}>Volver atrás</Button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto pb-24 space-y-8 animate-in fade-in duration-700 px-4 md:px-6">
			{/* Header / Nav */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden relative">
				<div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none" />

				<div className="flex items-start md:items-center gap-4 md:gap-6">
					<Button
						variant="outline"
						size="icon"
						className="rounded-xl md:rounded-2xl h-10 w-10 md:h-12 md:w-12 border-gray-100 hover:bg-gray-50 text-gray-500 flex-shrink-0"
						onClick={() => router.back()}
					>
						<ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-3 mb-1">
							<h1 className="text-2xl md:text-4xl font-black text-[#2C3A2C] tracking-tighter">
								{isBungalow ? "Estadía" : "Visita de Día"}
							</h1>
							<StatusBadge estado={visita.pagado ? "CONFIRMADA" : visita.estado} />
						</div>
						<p className="text-gray-400 font-bold flex items-center gap-2 text-[11px] md:text-sm">
							<QrCode className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
							Registro:{" "}
							<span className="text-[#4A5D4A] uppercase bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 font-black">
								{visita.id_publico || visita.id.split("-")[0]}
							</span>
						</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-center gap-3">
					<Button
						variant="outline"
						className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-6 font-black text-[10px] md:text-xs uppercase tracking-widest border-gray-100"
						onClick={() => setIsReceiptModalOpen(true)}
					>
						<Receipt className="mr-2 h-4 w-4" /> Ver Boleta
					</Button>
					<Link href={`/visitas/nueva`} className="w-full sm:w-auto">
						<Button className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-6 bg-[#2C3A2C] hover:bg-black text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-gray-200">
							Nueva Visita <Plus className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
				<div className="lg:col-span-2 space-y-6 md:space-y-8">
					{/* SECCION ALOJAMIENTO */}
					{isBungalow && (
						<Card className="border-none shadow-sm bg-white rounded-[32px] md:rounded-[40px] overflow-hidden">
							<div className="p-6 md:p-8">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
									<div className="flex items-center gap-4">
										<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
											<Home className="h-5 w-5 md:h-6 md:w-6" />
										</div>
										<div>
											<h3 className="text-xl md:text-2xl font-black text-[#2C3A2C] tracking-tight">Mi Alojamiento</h3>
											<p className="text-gray-400 font-bold text-[11px] md:text-sm">Bungalows y estancias</p>
										</div>
									</div>
									<div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100/50 flex flex-col items-end">
										<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Capacidad Utilizada</p>
										<div className="flex items-center gap-3">
											<span className="font-black text-[#2C3A2C] text-sm">{ingresantes.length} / {reservaBungalow?.capacidad_total || 0}</span>
											<div className="w-20 md:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
												<div className="h-full bg-primary transition-all" style={{ width: `${ocupacionPercent}%` }} />
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-4 md:space-y-6">
									{reservaBungalow?.bungalows_alquilados.map((item: any) => (
										<div key={item.id} className="bg-gray-50/50 rounded-[28px] md:rounded-[32px] border border-gray-100/50 p-5 md:p-6 group hover:bg-white hover:border-primary/20 transition-all">
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
												<div className="flex items-center gap-4">
													<div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
														<span className="font-black text-primary text-sm md:text-base">#{item.bungalow.numero}</span>
													</div>
													<div>
														<h4 className="font-black text-[#2C3A2C] text-base md:text-lg">{item.bungalow.nombre}</h4>
														<p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
															<Moon className="h-3 w-3" /> {item.desglose_noches?.length || 0} Noches
														</p>
													</div>
												</div>
												<div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
													<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Subtotal</p>
													<p className="text-xl font-black text-[#2C3A2C]">S/ {Number(item.precio_subtotal).toFixed(2)}</p>
												</div>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 pl-2 border-l-2 border-primary/20 ml-2">
												{item.desglose_noches?.map((noche: any, idx: number) => (
													<div key={idx} className="bg-white/50 p-2.5 rounded-xl flex items-center justify-between border border-gray-100/50">
														<div className="flex items-center gap-2">
															<div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center text-[9px] font-bold text-gray-400">
																{idx + 1}
															</div>
															<div className="flex flex-col">
																<span className="text-[10px] font-black text-[#2C3A2C]">
																	{format(new Date(noche.fecha || new Date()), "EEE dd/MM", { locale: es }).toUpperCase()}
																</span>
																<span className="text-[8px] font-bold text-gray-400 uppercase leading-none">{noche.tarifa_nombre}</span>
															</div>
														</div>
														<span className="font-black text-[10px] text-primary">S/ {Number(noche.precio).toFixed(2)}</span>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</Card>
					)}

					{/* LISTA DE INGRESANTES */}
					<Card className="border-none shadow-sm bg-white rounded-[32px] md:rounded-[40px] overflow-hidden">
						<div className="p-6 md:p-8">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
										<Users className="h-5 w-5 md:h-6 md:w-6" />
									</div>
									<div>
										<h3 className="text-xl md:text-2xl font-black text-[#2C3A2C] tracking-tight">Invitados</h3>
										<p className="text-gray-400 font-bold text-[11px] md:text-sm">Gestión de acompañantes</p>
									</div>
								</div>
								{((!visita.pagado && !visita.lista_ingresantes?.esta_pagada) || isBungalow) && 
								 (visita.estado === 'PENDIENTE' || visita.estado === 'CONFIRMADA') && (
									<Button
										variant="outline"
										className="w-full sm:w-auto rounded-xl md:rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50 font-black text-[10px] md:text-xs uppercase gap-2 h-11 px-6 shadow-sm shadow-amber-900/5"
										onClick={() => setIsEditModalOpen(true)}
									>
										<Edit2 className="h-3.5 w-3.5" /> Editar Lista
									</Button>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
								{ingresantes.length === 0 ? (
									<div className="col-span-full text-center py-12 bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
										<p className="text-gray-400 font-medium text-sm">No hay ingresantes registrados.</p>
									</div>
								) : (
									ingresantes.map((ing: any) => (
										<div key={ing.id} className="p-4 rounded-[24px] md:rounded-[28px] border border-gray-100 bg-white hover:border-primary/20 hover:shadow-md transition-all group flex items-center justify-between gap-3">
											<div className="flex items-center gap-3 md:gap-4 min-w-0">
												<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center font-black text-[#2C3A2C] group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
													{ing.persona.nombres[0]}
												</div>
												<div className="min-w-0">
													<h4 className="font-black text-[#2C3A2C] leading-tight mb-1 text-[12px] md:text-sm truncate">{ing.persona.nombre_completo}</h4>
													<div className="flex items-center gap-2 flex-wrap">
														<span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">DNI {ing.persona.dni}</span>
														<Badge className="bg-gray-50 text-gray-400 border-none text-[8px] font-black h-4 px-1.5 uppercase tracking-tighter whitespace-nowrap">
															{ing.tipo_entrada?.nombre || "General"}
														</Badge>
														<span className="text-[10px] md:text-[11px] font-black text-primary/80 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
															{ing.con_cupon ? "CUPÓN (S/ 0)" : `S/ ${Number(ing.precio_entrada || 0).toFixed(2)}`}
														</span>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2 flex-shrink-0">
												{ing.con_cupon && (
													<Badge className="bg-amber-100 text-amber-700 border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-md">
														CUPÓN
													</Badge>
												)}
												{ing.fecha_checkin ? (
													<Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
														<div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
														Ingresó
													</Badge>
												) : (
													<div className="h-7 w-7 rounded-full border border-gray-100 flex items-center justify-center text-gray-100">
														<ShieldCheck className="h-3.5 w-3.5" />
													</div>
												)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</Card>
				</div>

				{/* BARRA LATERAL */}
				<div className="space-y-6 md:space-y-8">
					<Card className="border-none shadow-sm bg-white rounded-[32px] md:rounded-[40px] overflow-hidden p-6 md:p-8">
						<label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-6">Línea de Tiempo</label>
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="h-10 w-10 rounded-xl md:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
									<Clock className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-black text-gray-400 uppercase mb-1">Inicio de Pase</p>
									<p className="font-black text-[#2C3A2C] leading-tight text-sm md:text-base">
										{visita.fecha_inicio ? format(new Date(visita.fecha_inicio), "PPP", { locale: es }) : "No definida"}
									</p>
									{isBungalow && <p className="text-[10px] md:text-[11px] font-bold text-amber-600 uppercase mt-0.5">Check-in: 19:00 PM</p>}
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="h-10 w-10 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
									<Clock className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-black text-gray-400 uppercase mb-1">Vencimiento</p>
									<p className="font-black text-[#2C3A2C] leading-tight text-sm md:text-base">
										{visita.fecha_fin ? format(new Date(visita.fecha_fin), "PPP", { locale: es }) : "No definida"}
									</p>
									{isBungalow && <p className="text-[10px] md:text-[11px] font-bold text-blue-600 uppercase mt-0.5">Check-out: 21:00 PM</p>}
								</div>
							</div>
						</div>
					</Card>

					<Card className="border-none shadow-2xl bg-[#2C3A2C] text-white rounded-[32px] md:rounded-[40px] overflow-hidden">
						<div className="p-6 md:p-8 space-y-6 md:space-y-8">
							<div className="space-y-4">
								<h4 className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
									<TrendingUp className="h-3 w-3" /> Resumen Económico
								</h4>
								
								<div className="space-y-4">
									{isBungalow && (
										<div className="flex justify-between items-center group">
											<span className="text-white/50 text-[13px] md:text-sm font-bold group-hover:text-white transition-colors italic">Alojamiento ({reservaBungalow?.bungalows_alquilados.length} Unid)</span>
											<span className="font-black text-sm md:text-base">S/ {Number(reservaBungalow?.precio_total || 0).toFixed(2)}</span>
										</div>
									)}
									<div className="flex justify-between items-center group">
										<span className="text-white/50 text-[13px] md:text-sm font-bold group-hover:text-white transition-colors italic">Entradas Invitados</span>
										<span className="font-black text-sm md:text-base">S/ {Number(visita.lista_ingresantes?.monto_total || 0).toFixed(2)}</span>
									</div>
									<Separator className="bg-white/10" />
									<div className="flex flex-col gap-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1 leading-none">Total</p>
												<p className="text-3xl md:text-4xl font-black text-white tracking-tighter">S/ {Number(visita.monto_total).toFixed(2)}</p>
											</div>
											<Badge className={`${visita.pagado ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-none font-black text-[9px] md:text-[10px] px-3 py-1 rounded-xl`}>
												{visita.pagado ? 'LIQUIDADO' : 'PENDIENTE'}
											</Badge>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-4">
								{!visita.pagado && (
									<div className="bg-white/5 p-5 md:p-6 rounded-[28px] md:rounded-[32px] border border-white/10">
										<p className="text-white/40 text-[9px] font-black uppercase mb-3 px-1">Saldo por pagar</p>
										<p className="text-3xl font-black mb-4">S/ {Number((visita as any).saldo_total || visita.monto_total).toFixed(2)}</p>
										
										{!isPaymentExpired ? (
											<Button 
												className="w-full h-14 rounded-2xl bg-white text-[#2C3A2C] hover:bg-gray-100 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
												onClick={() => {
													const idOrden = reservaBungalow?.orden_cobro?.id || reservaBungalow?.orden_cobro_id || visita.lista_ingresantes?.orden_cobro?.id || visita.lista_ingresantes?.orden_cobro_id;
													if (idOrden) setActiveOrdenId(idOrden);
													else toast.info("No hay órdenes de cobro pendientes.");
												}}
											>
												Pagar Ahora <ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										) : (
											<div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-2xl flex items-center gap-3">
												<XCircle className="h-5 w-5 text-rose-400 shrink-0" />
												<p className="text-[10px] font-bold text-rose-100 leading-tight italic">
													Plazo de pago vencido. Contacta con administración.
												</p>
											</div>
										)}
									</div>
								)}
								<p className="text-[9px] md:text-[10px] font-bold text-white/20 uppercase tracking-tighter leading-tight text-center px-4">
									Pagos seguros vía Izipay. Reserva confirmada automáticamente tras el cargo.
								</p>
							</div>
						</div>
					</Card>
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
