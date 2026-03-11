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
		<Card className="bg-[#2C3A2C] text-white border-none shadow-xl relative overflow-hidden">
			{/* Patrón decorativo de fondo */}
			<div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-8">
				<TreeDeciduous size={240} />
			</div>

			<CardContent className="pt-8 pb-8 relative z-10">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-3xl font-black mb-2 tracking-tight">
							¡Hola, {name}! 👋
						</h2>
						<p className="text-emerald-100/80 mb-6 max-w-md font-medium">
							Bienvenido a tu portal del Centro de Esparcimiento CIP Lima.
							Gestiona tus próximas visitas y beneficios aquí.
						</p>
						<div className="flex gap-2">
							<Badge
								variant="secondary"
								className="bg-white/10 hover:bg-white/20 text-white border border-white/20 capitalize px-3 py-1"
							>
								{category || "Colegiado"}
							</Badge>
							{privileges && (
								<Badge
									variant="secondary"
									className="bg-[#2EB85C] hover:bg-[#2EB85C]/90 text-white border-none font-bold px-3 py-1 shadow-sm"
								>
									CON BENEFICIOS ACTIVOS
								</Badge>
							)}
						</div>
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
		<Card className="overflow-hidden border-none shadow-md">
			<CardContent className="p-0">
				<div className="flex items-center">
					<div className={`p-6 ${colorClass} text-white`}>
						<Icon className="h-8 w-8" />
					</div>
					<div className="p-6">
						<p className="text-sm font-medium text-muted-foreground uppercase opacity-70 tracking-tight">
							{title}
						</p>
						<p className="text-2xl font-bold text-[#2C3A2C]">{value}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function ProximaVisitaCard({ visita }: { visita: any }) {
	if (!visita) {
		return (
			<Card className="border-dashed border-2 border-primary/20 bg-primary/5 h-full">
				<CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
					<Calendar className="h-12 w-12 text-primary/30 mb-4" />
					<h3 className="font-bold text-lg mb-2 text-[#2C3A2C]">
						No tienes visitas próximas
					</h3>
					<p className="text-sm text-muted-foreground mb-6">
						¿Qué tal un escape al centro campestre este fin de semana?
					</p>
					<Link href="/visitas/nueva">
						<Button className="rounded-full px-6">
							Visitar Ahora <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	const fecha = new Date(visita.fecha_llegada);

	return (
		<Card className="h-full shadow-md border-none overflow-hidden group">
			<div className="bg-[#2C3A2C] p-4 flex justify-between items-center">
				<Badge
					variant="outline"
					className="border-white/20 text-white bg-white/10 uppercase text-[10px]"
				>
					PRÓXIMA ESTANCIA
				</Badge>
				<Badge
					className={
						visita.estado === "CONFIRMADA" ? "bg-green-500" : "bg-amber-500"
					}
				>
					{visita.estado}
				</Badge>
			</div>
			<CardContent className="p-6">
				<div className="flex gap-6 items-center">
					<div className="text-center p-4 bg-primary/5 rounded-2xl min-w-[100px] border border-primary/10">
						<p className="text-primary font-bold text-3xl">
							{format(fecha, "dd")}
						</p>
						<p className="text-primary/70 uppercase text-xs font-bold">
							{format(fecha, "MMMM", { locale: es })}
						</p>
					</div>
					<div>
						<h3 className="text-xl font-bold text-[#2C3A2C] mb-1">
							{visita.tipo === "CON_BUNGALOW"
								? "Estancia en Bungalow"
								: "Solo Acceso (Pases)"}
						</h3>
						<p className="text-muted-foreground text-sm flex items-center gap-1 mb-3">
							<Users className="h-3.5 w-3.5" /> {visita.total_visitantes}{" "}
							visitantes incluidos
						</p>
						<Link href={`/visitas/${visita.id}`}>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full text-xs"
							>
								Ver Detalles
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
