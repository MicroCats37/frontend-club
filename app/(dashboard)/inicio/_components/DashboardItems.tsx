import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Calendar, TreeDeciduous, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function WelcomeCard({
	name,
	category,
	privileges,
}: {
	name: string;
	category: string | null;
	privileges: boolean;
}) {
	return (
		<Card className="bg-[#2C3A2C] text-white border-none shadow-2xl shadow-[#2C3A2C]/20 relative overflow-hidden rounded-[32px]">
			{/* Patrón decorativo de fondo */}
			<div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
				<TreeDeciduous size={120} />
			</div>

			<CardContent className="pt-8 pb-8 px-6 relative z-10">
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="h-1 w-6 bg-emerald-500 rounded-full" />
						<span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
							Dashboard
						</span>
					</div>
					<div>
						<h2 className="text-3xl font-black tracking-tighter leading-none mb-1">
							¡Hola, {name}!
						</h2>
						<p className="text-emerald-100/60 font-medium text-xs leading-relaxed">
							Tu espacio exclusivo CIP Lima.
						</p>
					</div>
					<div className="flex flex-col gap-2 pt-2">
						<Badge
							variant="secondary"
							className="bg-white/10 w-fit hover:bg-white/20 text-white border border-white/10 capitalize px-3 py-1 rounded-lg font-black text-[10px] tracking-tight"
						>
							{category || "Colegiado"}
						</Badge>
						{privileges && (
							<Badge
								variant="secondary"
								className="bg-emerald-500 w-fit hover:bg-emerald-600 text-white border-none font-black px-3 py-1 rounded-lg shadow-lg shadow-emerald-500/20 text-[10px] tracking-tight"
							>
								MEMBRESÍA ACTIVA
							</Badge>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function StatCard({
	title,
	value,
	icon: Icon,
	colorClass,
}: {
	title: string;
	value: string | number;
	icon: any;
	colorClass: string;
}) {
	return (
		<Card className="overflow-hidden border border-gray-100 shadow-xl shadow-gray-100/50 rounded-[32px] group hover:scale-[1.02] transition-all duration-500">
			<CardContent className="p-0">
				<div className="flex items-center">
					<div
						className={`p-8 ${colorClass} text-white transition-transform group-hover:scale-110 duration-700`}
					>
						<Icon className="h-10 w-10" />
					</div>
					<div className="p-8">
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">
							{title}
						</p>
						<p className="text-2xl font-black text-[#2C3A2C] tracking-tight">
							{value}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function CompactStats({
	items,
}: {
	items: {
		title: string;
		value: string | number;
		icon: any;
		colorClass: string;
	}[];
}) {
	return (
		<div className="grid grid-cols-1 gap-4">
			{items.map((item, idx) => (
				<button
					key={idx}
					className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E0E7E0] hover:border-emerald-500/30 hover:shadow-lg transition-all text-left duration-300 active:scale-95"
				>
					<div
						className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110 ${item.colorClass}`}
					>
						<item.icon className="h-5 w-5" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mb-0.5 truncate">
							{item.title}
						</p>
						<p className="text-sm font-black text-[#2C3A2C] leading-none tracking-tight truncate">
							{item.value}
						</p>
					</div>
				</button>
			))}
		</div>
	);
}

export function ProximaVisitaCard({ visita }: { visita: any }) {
	if (!visita) {
		return (
			<Card className="border-dashed border-2 border-[#E0E7E0] bg-[#F9FAF9] rounded-[32px]">
				<CardContent className="flex flex-col items-center justify-center p-8 text-center">
					<Calendar className="h-10 w-10 text-gray-300 mb-4" />
					<h3 className="font-black text-sm mb-1 text-[#2C3A2C]">
						Sin visitas próximas
					</h3>
					<p className="text-[10px] text-muted-foreground font-medium mb-4">
						¿Qué tal un escape al club este fin de semana?
					</p>
					<Link href="/visitas/nueva">
						<Button
							variant="outline"
							className="rounded-xl h-10 px-6 text-xs font-black border-[#2C3A2C] text-[#2C3A2C] hover:bg-[#2C3A2C] hover:text-white transition-all"
						>
							GESTIONAR <ArrowRight className="ml-2 h-3.5 w-3.5" />
						</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	const fecha = new Date(visita.fecha_llegada);

	return (
		<Card className="shadow-sm border border-[#E0E7E0] overflow-hidden rounded-[32px] group hover:border-emerald-500/30 transition-all">
			<div className="bg-[#2C3A2C] p-3 flex justify-between items-center">
				<Badge
					variant="outline"
					className="border-white/10 text-white bg-white/5 uppercase text-[9px] font-black tracking-widest"
				>
					FECHA RESERVADA
				</Badge>
				<Badge
					className={`text-[9px] font-black px-2 py-0.5 ${
						visita.estado === "CONFIRMADA"
							? "bg-emerald-500/20 text-emerald-400"
							: "bg-amber-500/20 text-amber-400"
					}`}
				>
					{visita.estado}
				</Badge>
			</div>
			<CardContent className="p-5">
				<div className="flex items-center gap-4">
					<div className="text-center p-3 bg-[#F9FAF9] rounded-2xl min-w-[70px] border border-[#E0E7E0]">
						<p className="text-[#2C3A2C] font-black text-2xl leading-none mb-1">
							{format(fecha, "dd")}
						</p>
						<p className="text-gray-400 uppercase text-[9px] font-black">
							{format(fecha, "MMM", { locale: es })}
						</p>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-black text-[#2C3A2C] mb-1 truncate">
							{visita.tipo === "CON_BUNGALOW"
								? "Stay Bungalow"
								: "Pase Full Day"}
						</h3>
						<div className="flex items-center gap-2 text-gray-400 mb-3">
							<Users className="h-3 w-3" />
							<span className="text-[10px] font-bold">
								{visita.total_visitantes} Pers.
							</span>
						</div>
						<Link href={`/visitas/${visita.id}`}>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 rounded-xl text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0"
							>
								Ver detalles <ArrowRight className="ml-1 h-3 w-3" />
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BirthdayBanner() {
	return (
		<div className="col-span-1 md:col-span-2 lg:col-span-3">
			<div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
				<div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 transition-transform group-hover:scale-110">
					<Gift size={150} />
				</div>
				<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
							<Gift className="h-8 w-8 text-white" />
						</div>
						<div>
							<h3 className="text-xl font-bold">
								¡Es tu mes de cumpleaños! 🎂
							</h3>
							<p className="text-white/90">
								Tienes ingreso GRATIS para ti durante todo este mes.
							</p>
						</div>
					</div>
					<Link href="/visitas/nueva">
						<Button className="bg-white text-orange-600 hover:bg-white/90 rounded-full px-8 font-bold border-none shadow-sm">
							Aprovechar Regalo
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
