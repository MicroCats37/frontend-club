"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Filter,
	Info,
	LayoutGrid,
	Plus,
	Search,
	Ticket,
	TreeDeciduous,
	Users,
	X,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterVisitasModal } from "@/components/visitas/FilterVisitasModal";
import { useGetMisVisitas } from "@/hooks/visitas/useUserVisitas";
import type { Visita } from "@/schemas/visita";

const EstadoBadge = ({
	estado,
	pagado,
	expirado,
}: {
	estado: string;
	pagado?: boolean;
	expirado?: boolean;
}) => {
	const config: Record<
		string,
		{ label: string; className: string; icon: any }
	> = {
		PENDIENTE: {
			label: expirado ? "Expirado" : "Pendiente Pago",
			className: expirado
				? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-100/50"
				: "bg-amber-50 text-amber-700 border-amber-100",
			icon: expirado ? XCircle : Clock,
		},
		PAGADA: {
			label: "Pagado",
			className: "bg-emerald-50 text-emerald-700 border-emerald-100",
			icon: CheckCircle2,
		},
		// ...rest of states remain same
		CONFIRMADA: {
			label: "Confirmada",
			className: "bg-blue-50 text-blue-700 border-blue-100",
			icon: CheckCircle2,
		},
		EN_CURSO: {
			label: "En Club",
			className: "bg-emerald-50 text-emerald-700 border-emerald-100",
			icon: CheckCircle2,
		},
		ACTIVA: {
			label: "En Club",
			className: "bg-emerald-50 text-emerald-700 border-emerald-100",
			icon: CheckCircle2,
		},
		FINALIZADA: {
			label: "Finalizada",
			className: "bg-slate-50 text-slate-600 border-slate-100",
			icon: Info,
		},
		CANCELADA: {
			label: "Cancelada",
			className: "bg-rose-50 text-rose-700 border-rose-100",
			icon: XCircle,
		},
	};

	const item = config[estado] || config.PENDIENTE;
	const Icon = item.icon;

	return (
		<Badge
			variant="outline"
			className={`px-3 py-1 flex items-center gap-2 font-black uppercase text-[10px] tracking-wider rounded-xl ${item.className}`}
		>
			<Icon className={`h-3.5 w-3.5 ${expirado ? "animate-pulse" : ""}`} />
			{item.label}
		</Badge>
	);
};

const VisitaRow = ({ visita }: { visita: Visita }) => {
	const isBungalow = visita.is_bungalow;
	const fechaText = visita.fecha_inicio
		? format(new Date(visita.fecha_inicio), "dd MMM yyyy", { locale: es })
		: "Fecha no definida";

	const totalPagar = Number(visita.monto_total || 0);
	const saldoPendiente = Number(visita.saldo_total || 0);

	// Lógica de expiración
	const isExpired = useMemo(() => {
		if (visita.estado !== "PENDIENTE" || !visita.fecha_limite_pago)
			return false;
		return new Date() > new Date(visita.fecha_limite_pago);
	}, [visita.estado, visita.fecha_limite_pago]);

	const isModifiedToday = useMemo(() => {
		if (!visita.updated_at) return false;
		const updated = new Date(visita.updated_at);
		const today = new Date();
		return (
			updated.getDate() === today.getDate() &&
			updated.getMonth() === today.getMonth() &&
			updated.getFullYear() === today.getFullYear() &&
			updated.getTime() !== new Date(visita.created_at).getTime()
		);
	}, [visita.updated_at, visita.created_at]);

	const canEdit = useMemo(() => {
		if (isExpired) return false;
		if (visita.estado === "CANCELADA" || visita.estado === "FINALIZADA")
			return false;
		const basicCheck = !visita.pagado && visita.estado !== "CONFIRMADA";
		if (isBungalow) return true;
		return basicCheck;
	}, [visita.estado, visita.pagado, isExpired, isBungalow]);

	return (
		<div
			className={`bg-white rounded-[32px] md:rounded-[40px] border p-2 shadow-sm hover:shadow-2xl transition-all group relative animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden ${
				isExpired
					? "border-rose-100 bg-rose-50/20"
					: isModifiedToday
						? "border-amber-200 bg-amber-50/10 shadow-amber-900/5 ring-1 ring-amber-500/5"
						: "border-gray-100 hover:border-primary/20"
			}`}
		>
			{isModifiedToday && (
				<div className="absolute top-0 right-0 z-10">
					<div className="bg-amber-500 text-white text-[8px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-[0.2em] shadow-sm">
						Modificado Hoy
					</div>
				</div>
			)}
			<div className="flex flex-col lg:flex-row lg:items-center gap-2">
				{/* 1. Left Section: Icon & Main Info */}
				<div
					className={`${isExpired ? "bg-rose-50/50" : "bg-gray-50/50"} rounded-[28px] md:rounded-[34px] p-4 md:p-6 flex items-center gap-4 md:gap-6 lg:min-w-[320px]`}
				>
					<div
						className={`h-12 w-12 md:h-16 md:w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 shadow-sm ${
							isExpired
								? "bg-rose-500 text-white"
								: isBungalow
									? "bg-primary text-white"
									: "bg-[#2C3A2C] text-white"
						}`}
					>
						{isBungalow ? (
							<TreeDeciduous className="h-6 w-6 md:h-8 md:w-8" />
						) : (
							<Ticket className="h-6 w-6 md:h-8 md:w-8" />
						)}
					</div>
					<div className="flex-1 text-left min-w-0">
						<div className="flex items-center gap-2 mb-0.5">
							<h3
								className={`font-black text-lg md:text-xl tracking-tighter truncate ${
									isExpired ? "text-rose-900" : "text-[#2C3A2C]"
								}`}
							>
								{isBungalow ? "Bungalow" : "Pase Diario"}
							</h3>
						</div>
						<div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400">
							<Calendar
								className={`h-3.5 w-3.5 ${isExpired ? "text-rose-300" : "text-amber-500"}`}
							/>
							<span>{fechaText}</span>
							<span className="mx-1">•</span>
							<span
								className={`font-black uppercase px-2 py-0.5 rounded-lg border ${
									isExpired
										? "text-rose-400 bg-rose-50 border-rose-100"
										: "text-primary bg-primary/5 border-primary/10"
								}`}
							>
								{visita.id_publico || visita.id.split("-")[0]}
							</span>
						</div>
					</div>
					<div className="lg:hidden flex-shrink-0">
						<EstadoBadge
							estado={visita.estado}
							pagado={visita.pagado}
							expirado={isExpired}
						/>
					</div>
				</div>

				{/* 2. Middle Section: Metadata */}
				<div className="flex-1 px-4 md:px-8 py-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 border-t border-gray-100/50 lg:border-t-0 mt-2 lg:mt-0">
					<div className="space-y-0.5">
						<p className="text-[9px] uppercase font-black text-gray-300 tracking-[0.15em]">
							Acompañantes
						</p>
						<div className="flex items-center gap-1.5 text-[#4A5D4A]">
							<Users
								className={`h-3.5 w-3.5 ${isExpired ? "text-rose-200" : "text-primary/40"}`}
							/>
							<span className="font-black text-xs md:text-sm">
								{visita.total_personas || 0} Capacidad
							</span>
						</div>
					</div>

					<div className="space-y-0.5">
						<p className="text-[9px] uppercase font-black text-gray-300 tracking-[0.15em]">
							Monto Total
						</p>
						<div
							className={`flex items-center gap-1 font-black ${isExpired ? "text-rose-900" : "text-[#2C3A2C]"}`}
						>
							<span className="text-[10px] text-gray-300 uppercase font-normal">
								S/
							</span>
							<span className="text-base md:text-lg tracking-tighter">
								{totalPagar.toFixed(2)}
							</span>
						</div>
					</div>

					<div className="col-span-2 lg:col-span-1 border-t lg:border-t-0 pt-3 lg:pt-0 space-y-1">
						<p className="text-[9px] uppercase font-black text-gray-300 tracking-[0.15em]">
							Estado de Cuenta
						</p>
						<div className="flex items-center gap-3">
							{visita.pagado ? (
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100/50 w-fit">
										<CheckCircle2 className="h-3 w-3" />
										<span className="text-[9px] font-black uppercase tracking-wider">
											Pagado
										</span>
									</div>
								</div>
							) : (
								<div className="flex flex-col gap-1">
									<div
										className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit ${
											isExpired
												? "bg-rose-100 text-rose-700 border-rose-200 shadow-sm"
												: "bg-amber-50 text-amber-600 border-amber-100/50"
										}`}
									>
										{isExpired ? (
											<XCircle className="h-3 w-3" />
										) : (
											<Clock className="h-3 w-3" />
										)}
										<span className="text-[9px] font-black uppercase tracking-wider">
											{isExpired
												? "Expirado"
												: `S/ ${saldoPendiente.toFixed(2)} Pen.`}
										</span>
									</div>
									{visita.fecha_limite_pago && (
										<p
											className={`text-[8px] font-bold flex items-center gap-1 px-1 leading-none uppercase tracking-tighter ${
												isExpired ? "text-rose-400" : "text-amber-500/80"
											}`}
										></p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* 3. Right Section: Action */}
				<div className="p-4 lg:p-6 lg:border-l lg:border-gray-50 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 mt-auto lg:mt-0">
					<div className="hidden lg:block">
						<EstadoBadge
							estado={visita.estado}
							pagado={visita.pagado}
							expirado={isExpired}
						/>
					</div>
					<Link href={`/visitas/${visita.id}`} className="w-full flex flex-col gap-2">
						<Button
							className={`w-full rounded-2xl h-11 md:h-12 bg-white transition-all gap-2 border font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md ${
								isExpired
									? "border-rose-100 text-rose-900 hover:bg-rose-50"
									: "border-gray-100 text-[#2C3A2C] hover:bg-gray-50"
							}`}
						>
							Ver detalles <ChevronRight className="h-4 w-4" />
						</Button>
						{canEdit && (
							<Button
								variant="ghost"
								className="w-full h-10 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-black text-[9px] uppercase tracking-widest transition-all"
							>
								Modificar ahora
							</Button>
						)}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default function MisVisitasPage() {
	const [page, setPage] = useState(1);
	const [estado, setEstado] = useState<string>("all");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const pageSize = 5;

	const { data: response, isLoading } = useGetMisVisitas(page, pageSize, {
		estado: estado === "all" ? undefined : estado,
	});

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	const visitas = response?.results || [];
	const totalItems = response?.count || 0;
	const totalPages = Math.ceil(totalItems / pageSize);

	const _handleApplyFilters = (filters: { estado: string; fecha: string }) => {
		setEstado(filters.estado);
		setPage(1);
	};

	const clearFilters = () => {
		setEstado("all");
		setPage(1);
	};

	return (
		<div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-24 px-4 sm:px-6">
			{/* Hero Header */}
			<div className="relative overflow-hidden bg-[#2C3A2C] rounded-[40px] md:rounded-[50px] p-6 md:p-12 text-white shadow-2xl">
				<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
					<div className="animate-in fade-in slide-in-from-top-4 duration-700 text-center md:text-left">
						<h1 className="text-3xl md:text-6xl font-black tracking-tighter mb-2 md:mb-4 leading-none">
							Mis <span className="text-primary italic">Visitas</span>
						</h1>
						<p className="text-white/60 font-medium text-sm md:text-xl max-w-xl mx-auto md:mx-0">
							Resumen consolidado de tus próximos ingresos y pagos pendientes.
						</p>
					</div>

					<Link href="/visitas/nueva" className="shrink-0 w-full md:w-auto">
						<Button className="w-full md:w-auto h-12 md:h-16 px-8 md:px-10 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs md:text-sm uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
							<Plus className="h-5 w-5 md:h-6 md:w-6" />
							Nueva Reserva
						</Button>
					</Link>
				</div>
			</div>

			{/* Desktop Filters Bar / Mobile Filter Button */}
			<div className="bg-white rounded-[28px] md:rounded-[32px] p-4 md:p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
				<div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1">
					<div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
						<Filter className="h-3.5 w-3.5 text-gray-400" />
						<span className="text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">
							Filtros Activos:
						</span>
					</div>

					{estado !== "all" && (
						<Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3 h-7 rounded-full uppercase tracking-wider flex items-center gap-2">
							Estado: {estado}
							<button onClick={() => setEstado("all")}>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}

					{estado === "all" && (
						<span className="text-[10px] font-bold text-gray-300 uppercase italic">
							Ninguno
						</span>
					)}
				</div>

				<div className="flex items-center gap-2">
					{estado !== "all" && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
							className="h-9 md:h-11 rounded-xl text-gray-400 font-bold hover:text-rose-500 hover:bg-rose-50 px-3 flex items-center gap-2"
						>
							<X className="h-4 w-4" />
							<span className="hidden md:inline uppercase text-[10px] tracking-widest">
								Limpiar
							</span>
						</Button>
					)}
					<Button
						onClick={() => setIsFilterOpen(true)}
						className="h-9 md:h-11 px-4 md:px-6 rounded-xl md:rounded-2xl bg-[#2C3A2C] hover:bg-black text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#2C3A2C]/10"
					>
						<Search className="h-3.5 w-3.5" />
						<span>Filtrar</span>
					</Button>
				</div>
			</div>

			<FilterVisitasModal
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				currentFilters={{ estado }}
				onApply={(f) => {
					setEstado(f.estado);
					setPage(1);
				}}
			/>

			{/* List Container */}
			<div className="space-y-4 md:space-y-8 min-h-[400px]">
				{isLoading ? (
					Array(3)
						.fill(0)
						.map((_, i) => (
							<Skeleton
								key={i}
								className="h-32 md:h-36 w-full rounded-[32px] md:rounded-[40px] opacity-40"
							/>
						))
				) : visitas.length === 0 ? (
					<div className="py-20 md:py-40 text-center bg-white rounded-[32px] md:rounded-[60px] border border-gray-100 shadow-sm animate-in zoom-in-95 duration-700 p-6">
						<div className="bg-gray-50 p-6 md:p-10 rounded-[32px] md:rounded-[40px] w-fit mx-auto mb-6 shadow-inner">
							<LayoutGrid className="h-10 w-10 md:h-20 md:w-20 text-gray-200" />
						</div>
						<h3 className="text-xl md:text-3xl font-black text-[#2C3A2C] tracking-tight">
							No se encontraron resultados
						</h3>
						<p className="text-gray-400 max-w-sm mx-auto mt-3 text-sm md:text-lg">
							Ajusta tus filtros o registra una nueva visita.
						</p>
						<Button
							variant="link"
							onClick={clearFilters}
							className="mt-4 text-primary font-black uppercase tracking-widest text-[10px] md:text-xs"
						>
							Ver todas mis visitas
						</Button>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:gap-6">
							{visitas.map((visita: Visita) => (
								<VisitaRow key={visita.id} visita={visita} />
							))}
						</div>

						{/* Paginación */}
						{totalPages > 1 && (
							<div className="flex flex-col sm:flex-row items-center justify-between bg-white px-5 md:px-8 py-4 md:py-5 rounded-[24px] md:rounded-[30px] border border-gray-100 shadow-sm gap-4">
								<p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
									Página {page} de {totalPages} • {totalItems} registros
								</p>
								<div className="flex items-center gap-3 w-full sm:w-auto justify-center">
									<Button
										variant="ghost"
										disabled={page === 1}
										onClick={() => setPage((p: number) => p - 1)}
										className="flex-1 sm:flex-none rounded-xl font-black text-[10px] uppercase h-10 px-4 tracking-widest border border-gray-50 active:scale-95 transition-all"
									>
										Anterior
									</Button>
									<Button
										variant="ghost"
										disabled={page === totalPages}
										onClick={() => setPage((p: number) => p + 1)}
										className="flex-1 sm:flex-none rounded-xl font-black text-[10px] uppercase h-10 px-4 tracking-widest border border-gray-50 active:scale-95 transition-all"
									>
										Siguiente
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
