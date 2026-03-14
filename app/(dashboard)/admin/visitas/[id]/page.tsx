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
	UserCheck,
	Wallet,
	Loader2,
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
import { ReceiptModal } from "@/components/visitas/ReceiptModal";
import { useQueryClient } from "@tanstack/react-query";
import { EditIngresantesModal } from "@/components/visitas/EditIngresantesModal";
import { useVisitaActions } from "@/hooks/visitas/useVisitaActions";
import { ManualPaymentModal } from "@/components/visitas/ManualPaymentModal";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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
		PAGADA: {
			label: "Pagada",
			className: "bg-emerald-50 text-emerald-700 border-emerald-200",
			icon: CheckCircle2,
		},
		CONFIRMADA: {
			label: "Confirmada",
			className: "bg-emerald-50 text-emerald-700 border-emerald-200",
			icon: CheckCircle2,
		},
		EN_CURSO: {
			label: "En Club",
			className: "bg-blue-50 text-blue-700 border-blue-200",
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

export default function AdminVisitaDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: visita, isLoading, isError } = useGetVisitaDetail(id);
	const { cancelarVisita, liquidarVisita } = useVisitaActions(id);

	const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [confirmAction, setConfirmAction] = useState<{
		type: "CANCEL" | "LIQUID";
		isOpen: boolean;
	}>({ type: "CANCEL", isOpen: false });

	const isBungalow = !!visita?.reserva_asociada;
	const ingresantes = visita?.lista_ingresantes?.ingresantes || [];
	const reservaBungalow = visita?.reserva_asociada;

	const ocupacionPercent = useMemo(() => {
		if (!reservaBungalow?.capacidad_total) return 0;
		return Math.min((ingresantes.length / reservaBungalow.capacidad_total) * 100, 100);
	}, [ingresantes.length, reservaBungalow?.capacidad_total]);

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
				<p className="text-gray-500 mt-2">No pudimos encontrar la información o no tienes permisos administrativos.</p>
				<Button variant="outline" className="mt-8 rounded-2xl px-8" onClick={() => router.back()}>Volver atrás</Button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto pb-24 space-y-8 animate-in fade-in duration-700 px-4 md:px-6">
			{/* Header / Nav */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden relative">
				<div className="flex items-start md:items-center gap-4 md:gap-6">
					<Button
						variant="outline"
						size="icon"
						className="rounded-xl md:rounded-2xl h-10 w-10 md:h-12 md:w-12 border-gray-100 hover:bg-gray-50 text-gray-500 flex-shrink-0"
						onClick={() => router.push("/admin/visitas")}
					>
						<ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-3 mb-1">
							<h1 className="text-2xl md:text-4xl font-black text-[#2C3A2C] tracking-tighter">
								{isBungalow ? "Detalle Estadía" : "Detalle Visita"}
							</h1>
							<StatusBadge estado={visita.estado} />
						</div>
						<p className="text-gray-400 font-bold flex items-center gap-2 text-[11px] md:text-sm">
							<QrCode className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" />
							ID Pública:{" "}
							<span className="text-[#4A5D4A] uppercase bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 font-black">
								{visita.id_publico || visita.id.split("-")[0]}
							</span>
						</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-center gap-3">
					{(visita.estado === "PENDIENTE" || visita.estado === "CONFIRMADA") && (
						<>
							<Button
								className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-black text-[10px] md:text-xs uppercase tracking-widest"
								onClick={() => setConfirmAction({ type: "LIQUID", isOpen: true })}
								disabled={liquidarVisita.isPending}
							>
								{liquidarVisita.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
								Liquidar / Checkout
							</Button>
							<Button
								variant="destructive"
								className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-6 font-black text-[10px] md:text-xs uppercase tracking-widest"
								onClick={() => setConfirmAction({ type: "CANCEL", isOpen: true })}
								disabled={cancelarVisita.isPending}
							>
								{cancelarVisita.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
								Anular Visita
							</Button>
						</>
					)}
					{!visita.pagado && visita.estado !== "CANCELADA" && (
						<Button
							className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20"
							onClick={() => setIsPaymentModalOpen(true)}
						>
							<Wallet className="mr-2 h-4 w-4" /> Registrar Pago
						</Button>
					)}
					<Button
						variant="outline"
						className="w-full sm:w-auto rounded-xl md:rounded-2xl h-11 md:h-12 px-6 font-black text-[10px] md:text-xs uppercase tracking-widest border-gray-100"
						onClick={() => setIsReceiptModalOpen(true)}
					>
						<Receipt className="mr-2 h-4 w-4" /> Ver Boleta
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
				<div className="lg:col-span-2 space-y-6 md:space-y-8">
					{/* INFO TITULAR */}
					<Card className="border-none shadow-sm bg-white rounded-[32px] md:rounded-[40px] overflow-hidden">
						<div className="p-6 md:p-8">
							<div className="flex items-center gap-4 mb-6">
								<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
									<UserCheck className="h-5 w-5 md:h-6 md:w-6" />
								</div>
								<div>
									<h3 className="text-xl md:text-2xl font-black text-[#2C3A2C] tracking-tight">Datos del Titular</h3>
									<p className="text-gray-400 font-bold text-[11px] md:text-sm">Información del socio responsable</p>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100/50">
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Nombre Completo</p>
									<p className="font-black text-[#2C3A2C] text-lg leading-tight">{visita.titular?.nombre_completo}</p>
								</div>
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Documento (DNI)</p>
									<p className="font-black text-[#2C3A2C] text-lg">{visita.titular?.dni}</p>
								</div>
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">ID Seguimiento</p>
									<p className="font-black text-primary font-mono text-lg">{visita.id_publico || "---"}</p>
								</div>
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Fecha Registro</p>
									<p className="font-bold text-[#4A5D4A] text-sm">
										{format(new Date(visita.created_at), "dd/MM/yyyy HH:mm")}
									</p>
								</div>
								<div>
									<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Origen</p>
									<p className="font-bold text-[#4A5D4A] text-sm uppercase">
										{isBungalow ? "Reserva Bungalow" : "Pase Diario Directo"}
									</p>
								</div>
							</div>
						</div>
					</Card>

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
											<h3 className="text-xl md:text-2xl font-black text-[#2C3A2C] tracking-tight">Alojamiento Reservado</h3>
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

								<div className="space-y-4">
									{reservaBungalow?.bungalows_alquilados.map((item: any) => (
										<div key={item.id} className="bg-gray-50/50 rounded-[28px] border border-gray-100/50 p-5 group hover:bg-white transition-all">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4">
													<div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
														<span className="font-black text-primary text-sm">#{item.bungalow.numero}</span>
													</div>
													<div>
														<h4 className="font-black text-[#2C3A2C] text-base">{item.bungalow.nombre}</h4>
														<p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
															<Moon className="h-3 w-3" /> {item.desglose_noches?.length || 0} Noches
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-black text-[#2C3A2C]">S/ {Number(item.precio_subtotal).toFixed(2)}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</Card>
					)}

					{/* LISTA DE INGRESANTES (ADMIN) */}
					<Card className="border-none shadow-sm bg-white rounded-[32px] md:rounded-[40px] overflow-hidden">
						<div className="p-6 md:p-8">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
										<Users className="h-5 w-5 md:h-6 md:w-6" />
									</div>
									<div>
										<h3 className="text-xl md:text-2xl font-black text-[#2C3A2C] tracking-tight">Lista de Ingresantes</h3>
										<p className="text-gray-400 font-bold text-[11px] md:text-sm">Control de acceso y acompañantes</p>
									</div>
								</div>
								{(visita.estado === "PENDIENTE" || visita.estado === "CONFIRMADA") && (
									<Button
										variant="outline"
										className="w-full sm:w-auto rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-black text-[10px] uppercase gap-2 h-11 px-6"
										onClick={() => setIsEditModalOpen(true)}
									>
										<Edit2 className="h-3.5 w-3.5" /> Gestionar Lista
									</Button>
								)}
							</div>

							<div className="grid grid-cols-1 gap-3">
								{ingresantes.map((ing: any) => (
									<div key={ing.id} className="p-4 rounded-[24px] border border-gray-100 bg-white hover:border-primary/20 transition-all flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-[#2C3A2C]">
												{ing.persona.nombres[0]}
											</div>
											<div>
												<div className="flex items-center gap-2">
												<p className="font-black text-[#2C3A2C] text-sm group-hover:text-primary transition-colors">
													{ing.persona.nombre_completo}
												</p>
												{!ing.es_listado && (
													<Badge variant="outline" className="text-[9px] bg-red-50 text-red-600 border-red-100 font-bold uppercase py-0 px-1.5 h-4">
														Removido
													</Badge>
												)}
												{ing.reembolso && (
													<Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-100 font-bold uppercase py-0 px-1.5 h-4">
														P. Reembolso
													</Badge>
												)}
											</div>
											<p className="text-[10px] font-bold text-gray-400 uppercase">DNI: {ing.persona.dni} • {ing.tipo_entrada?.nombre || "General"}</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<span className="font-black text-xs text-primary">
												{ing.con_cupon ? "LIBRE" : `S/ ${Number(ing.precio_entrada).toFixed(2)}`}
											</span>
											{ing.fecha_checkin ? (
												<Badge className="bg-green-50 text-green-700 border-none text-[8px] font-black uppercase">Ingresó</Badge>
											) : (
												<Badge variant="outline" className="text-[8px] font-black uppercase text-gray-300">Pendiente</Badge>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				</div>

				{/* LATERAL (ADMIN) */}
				<div className="space-y-6 md:space-y-8">
					<Card className="border-none shadow-sm bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8">
						<label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-6">Detalles del Período</label>
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
									<Calendar className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-black text-gray-400 uppercase mb-1">Fecha de Visita</p>
									<p className="font-black text-[#2C3A2C] text-sm">
										{visita.fecha_inicio ? format(new Date(visita.fecha_inicio), "PPP", { locale: es }) : "---"}
									</p>
									{isBungalow && (
										<p className="text-[10px] font-black text-blue-600 uppercase mt-1 italic">
											Hasta: {visita.fecha_fin ? format(new Date(visita.fecha_fin), "dd/MM/yyyy") : "---"}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
									<Clock className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-black text-gray-400 uppercase mb-1">Registro del Sistema</p>
									<p className="font-black text-[#2C3A2C] text-sm">
										{format(new Date(visita.created_at), "PPp", { locale: es })}
									</p>
								</div>
							</div>
						</div>
					</Card>

					<Card className="border-none shadow-2xl bg-[#2C3A2C] text-white rounded-[32px] md:rounded-[40px] overflow-hidden">
						<div className="p-6 md:p-8 space-y-8">
							<div className="space-y-6">
								<h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
									<Wallet className="h-3 w-3" /> Resumen Económico
								</h4>
								
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-white/50 text-sm font-bold">Total Entradas</span>
										<span className="font-black">S/ {Number(visita.lista_ingresantes?.monto_total || 0).toFixed(2)}</span>
									</div>
									{isBungalow && (
										<div className="flex justify-between items-center">
											<span className="text-white/50 text-sm font-bold">Total Alojamiento</span>
											<span className="font-black">S/ {Number(reservaBungalow?.precio_total || 0).toFixed(2)}</span>
										</div>
									)}
									<Separator className="bg-white/10" />
									<div className="flex items-center justify-between">
										<div>
											<p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Monto Total</p>
											<p className="text-4xl font-black text-white tracking-tighter">S/ {Number(visita.monto_total).toFixed(2)}</p>
										</div>
										<Badge className={`${visita.pagado ? 'bg-green-500' : 'bg-red-500'} text-white border-none font-black text-[10px] px-3 py-1 rounded-xl`}>
											{visita.pagado ? 'PAGADO' : 'DEUDA'}
										</Badge>
									</div>
									
									{visita.saldo_total !== undefined && Number(visita.saldo_total) > 0 && (
										<div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
											<p className="text-white/40 text-[9px] font-black uppercase mb-1 leading-none">Saldo Pendiente</p>
											<p className="text-2xl font-black text-amber-400">S/ {Number(visita.saldo_total).toFixed(2)}</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>

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

			{/* Confirmación Anulación */}
			<Dialog open={confirmAction.isOpen} onOpenChange={(open) => setConfirmAction(prev => ({ ...prev, isOpen: open }))}>
				<DialogContent className="rounded-[32px] border-none shadow-2xl">
					<DialogHeader>
						<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
							{confirmAction.type === "CANCEL" ? "¿Anular Visita?" : "¿Finalizar Estadía / Checkout?"}
						</DialogTitle>
						<DialogDescription className="text-gray-500 font-medium">
							{confirmAction.type === "CANCEL" 
								? "Esta acción anulará todas las órdenes de cobro y liberará los cupos. No se puede deshacer."
								: "Se marcará la estadía como finalizada (Checkout). Asegúrese de que no haya saldos pendientes."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-3 mt-4">
						<Button variant="ghost" onClick={() => setConfirmAction(p => ({ ...p, isOpen: false }))} className="rounded-xl font-bold">
							No, cancelar
						</Button>
						<Button 
							variant={confirmAction.type === "CANCEL" ? "destructive" : "default"} 
							className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest"
							onClick={() => {
								if (confirmAction.type === "CANCEL") {
									cancelarVisita.mutate(id);
								} else {
									liquidarVisita.mutate(id);
								}
								setConfirmAction(p => ({ ...p, isOpen: false }));
							}}
						>
							Sí, confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Modal Pago Manual */}
			<ManualPaymentModal
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				ordenId={visita.lista_ingresantes?.orden_cobro_id || visita.reserva_asociada?.orden_cobro_id || ""}
				montoSugerido={Number(visita.saldo_total)}
				titulo={`Registrar Pago - ${visita.id_publico}`}
			/>
		</div>
	);
}
