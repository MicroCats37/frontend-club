"use client";

import { Ticket, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumen } from "@/hooks/auth/useResumen";
import { useAuthStore } from "@/store/useAuthStore";
import { BenefitsBanner } from "./_components/BenefitsBanner";
import {
	CompactStats,
	ProximaVisitaCard,
	WelcomeCard,
} from "./_components/DashboardItems";
import { VisitTypeCarousel } from "./_components/VisitTypeCarousel";

export default function InicioPage() {
	const { user } = useAuthStore();
	const { data: resumen, isLoading, isError } = useResumen();

	if (isLoading) {
		return (
			<div className="space-y-8 animate-in fade-in duration-500">
				<Skeleton className="h-[160px] w-full rounded-2xl" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<Skeleton className="lg:col-span-2 h-[400px]" />
					<Skeleton className="h-[400px]" />
				</div>
			</div>
		);
	}

	if (isError || !resumen) {
		return (
			<div className="flex flex-col items-center justify-center p-20 text-center">
				<div className="bg-destructive/10 p-4 rounded-full mb-4">
					<Users className="h-8 w-8 text-destructive" />
				</div>
				<h3 className="text-xl font-bold mb-2">Error al cargar tu resumen</h3>
				<p className="text-muted-foreground">
					Por favor, intenta recargar la página más tarde.
				</p>
			</div>
		);
	}

	const userCategory = user?.categoria || resumen.categoria;

	return (
		<div className="animate-in slide-in-from-bottom-4 duration-700 pb-12">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
				{/* SIDEBAR (1/4) - Información del Usuario & Estadísticas */}
				<aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
					{/* 1. Perfil Compacto */}
					<WelcomeCard
						name={resumen.full_name.split(" ")[0]}
						category={userCategory}
						privileges={resumen.privilegios}
					/>

					{/* 2. Estadísticas de Disponibilidad */}
					<div className="space-y-4">
						<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
							Disponibilidad
						</h3>
						<CompactStats
							items={[
								{
									title: "Cupos Invitados",
									value: `${resumen.cupos_invitados_restantes} pases`,
									icon: Ticket,
									colorClass: "bg-emerald-500",
								},
								{
									title: "Beneficiarios",
									value:
										resumen.beneficiarios_label ||
										`${resumen.total_beneficiarios_activos} de ${resumen.beneficiarios_limite}`,
									icon: Users,
									colorClass: "bg-blue-600",
								},
							]}
						/>
					</div>

					{/* 3. Acceso Rápido/Estado Próxima Visita */}
					<div className="space-y-4">
						<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
							Próxima Visita
						</h3>
						<ProximaVisitaCard visita={resumen.proxima_visita} />
					</div>
				</aside>

				{/* MAIN CONTENT (3/4) - Gestión de Visitas & Beneficios */}
				<main className="lg:col-span-3 space-y-12">
					{/* Sección: Gestionar Visita */}

					{/* Sección: Beneficios & Comunidad */}
					<div className="">
						<BenefitsBanner category={userCategory} />
					</div>

					<div>
						<VisitTypeCarousel />
					</div>
					{/* CTA Nueva Reserva (Banner Estilo Bento) */}
					<div className="bg-[#2C3A2C] rounded-[40px] p-4 sm:p-12 text-white shadow-2xl shadow-[#2C3A2C]/20 relative overflow-hidden group">
						<div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-8 transition-transform group-hover:scale-110 duration-[10s]">
							<Zap size={300} />
						</div>
						<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
							<div className="max-w-md">
								<h3 className="text-3xl font-black tracking-tight mb-4">
									¿Listo para un nuevo escape?
								</h3>
								<p className="text-emerald-100/60 font-medium text-sm sm:text-lg leading-relaxed">
									Asegura tu ingreso o reserva un bungalow en segundos con
									nuestro nuevo flujo optimizado.
								</p>
							</div>
							<a href="/visitas/nueva" className="shrink-0">
								<Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-16 px-10 rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl active:scale-95">
									NUEVA RESERVA
								</Button>
							</a>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
