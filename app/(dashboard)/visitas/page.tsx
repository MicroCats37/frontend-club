"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	CreditCard,
	Info,
	Ticket,
	TreeDeciduous,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMisVisitas } from "@/hooks/visitas/useUserVisitas";
import type { Visita } from "@/schemas/visita";

const EstadoBadge = ({
	estado,
	pagado,
}: {
	estado: string;
	pagado?: boolean;
}) => {
	const config: Record<
		string,
		{ label: string; className: string; icon: any }
	> = {
		PENDIENTE: {
			label: pagado ? "Por Iniciar" : "Pendiente Pago",
			className: pagado
				? "bg-blue-50 text-blue-700 border-blue-100"
				: "bg-amber-50 text-amber-700 border-amber-100",
			icon: pagado ? Calendar : Clock,
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
			className={`px-3 py-1 flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider rounded-xl ${item.className}`}
		>
			<Icon className="h-3.5 w-3.5" />
			{item.label}
		</Badge>
	);
};

const VisitaRow = ({ visita }: { visita: Visita }) => {
	const isBungalow = !!visita.reserva_asociada_id;
	const fechaText = visita.fecha_inicio
		? format(new Date(visita.fecha_inicio), "dd MMM yyyy", { locale: es })
		: "Fecha no definida";

	const totalPagar = Number(visita.monto_total || 0);

	return (
		<div className="bg-white rounded-[28px] border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all group relative animate-in fade-in slide-in-from-bottom-2 duration-300">
			<div className="flex flex-col lg:flex-row lg:items-center gap-6">
				{/* 1. Icon & Type */}
				<div className="flex items-center gap-4 min-w-[240px]">
					<div
						className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
							isBungalow
								? "bg-primary/10 text-primary"
								: "bg-blue-50 text-blue-600"
						}`}
					>
						{isBungalow ? (
							<TreeDeciduous className="h-7 w-7" />
						) : (
							<Ticket className="h-7 w-7" />
						)}
					</div>
					<div>
						<h3 className="font-black text-lg text-[#2C3A2C] leading-none mb-2">
							{isBungalow ? "Estadía en Bungalow" : "Full Day - Pases"}
						</h3>
						<div className="flex items-center gap-2 text-sm font-bold text-gray-400">
							<Calendar className="h-4 w-4 text-amber-500" />
							<span>{fechaText}</span>
						</div>
					</div>
				</div>

				{/* 2. Metadata (Guests & Price) */}
				<div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:px-6 lg:border-l lg:border-gray-50">
					<div>
						<p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">
							Invitados
						</p>
						<div className="flex items-center gap-2 text-sm font-black text-[#4A5D4A]">
							<Users className="h-4 w-4 text-gray-300" />
							<span>{visita.total_personas || 0} Personas</span>
						</div>
					</div>

					<div>
						<p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">
							Monto Total
						</p>
						<div className="flex items-center gap-2 text-sm font-black text-[#2C3A2C]">
							<span className="text-gray-300 font-normal">S/</span>
							<span>{totalPagar.toFixed(2)}</span>
						</div>
					</div>

					<div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0">
						<p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">
							Estado Pago
						</p>
						<div className="flex items-center gap-3">
							<div
								className={`h-8 w-8 rounded-xl flex items-center justify-center ${
									visita.pagado
										? "bg-green-100 text-green-600"
										: "bg-gray-100 text-gray-400"
								}`}
							>
								<CreditCard className="h-4 w-4" />
							</div>
							<span
								className={`text-sm font-black ${visita.pagado ? "text-green-600" : "text-gray-400"}`}
							>
								{visita.pagado ? "PAGADO" : "PENDIENTE"}
							</span>
						</div>
					</div>
				</div>

				{/* 3. Status & Action */}
				<div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 xl:min-w-[180px]">
					<EstadoBadge estado={visita.estado} pagado={visita.pagado} />

					<Link href={`/visitas/${visita.id}`} className="w-full sm:w-auto">
						<Button
							variant="ghost"
							className="w-full rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-amber-50 hover:text-amber-600 transition-all gap-2"
						>
							Ver Detalles
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default function MisVisitasPage() {
	const { data: visitas, isLoading } = useGetMisVisitas();

	return (
		<div className="max-w-6xl mx-auto space-y-10 pb-20">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="animate-in fade-in slide-in-from-left-4 duration-500">
					<h1 className="text-5xl font-black text-[#2C3A2C] tracking-tighter mb-2">
						Mis Visitas
					</h1>
					<p className="text-gray-400 font-medium text-lg">
						Gestiona tus próximas estadías y revisa tu historial de ingresos.
					</p>
				</div>

				<Link href="/visitas/nueva">
					<Button className="h-14 px-8 rounded-[20px] bg-[#2C3A2C] hover:bg-black text-white font-black shadow-2xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3">
						<Ticket className="h-6 w-6" />
						PROGRAMAR VISITA
					</Button>
				</Link>
			</div>

			<div className="space-y-6">
				{isLoading ? (
					Array(4)
						.fill(0)
						.map((_, i) => (
							<Skeleton key={i} className="h-32 w-full rounded-[32px]" />
						))
				) : !visitas || visitas.length === 0 ? (
					<div className="py-32 text-center bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100 animate-in zoom-in-95 duration-700">
						<div className="bg-white p-8 rounded-[32px] w-fit mx-auto mb-6 shadow-sm">
							<Calendar className="h-16 w-16 text-amber-200" />
						</div>
						<h3 className="text-2xl font-black text-[#2C3A2C]">
							No tienes visitas registradas
						</h3>
						<p className="text-gray-400 max-w-sm mx-auto mt-3 font-medium">
							Aún no has planeado ninguna visita. ¡Comienza una reserva de pases
							o bungalow ahora mismo!
						</p>
						<Button
							variant="link"
							className="mt-4 font-black text-amber-600"
							asChild
						>
							<Link href="/visitas/nueva">Click aquí para empezar</Link>
						</Button>
					</div>
				) : (
					visitas.map((visita) => <VisitaRow key={visita.id} visita={visita} />)
				)}
			</div>
		</div>
	);
}
