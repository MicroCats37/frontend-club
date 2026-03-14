"use client";

import { Ticket, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumen } from "@/hooks/auth/useResumen";
import {
	BirthdayBanner,
	ProximaVisitaCard,
	StatCard,
	WelcomeCard,
} from "./_components/DashboardItems";

export default function InicioPage() {
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

	return (
		<div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
			{/* 1. Banner de Bienvenida */}
			<WelcomeCard
				name={resumen.full_name.split(" ")[0]}
				category={resumen.categoria}
				privileges={resumen.privilegios}
			/>

			{/* 2. Banner de Cumpleaños (Condicional) */}
			{resumen.es_cumpleanero && <BirthdayBanner />}

			{/* 3. Estadísticas Rápidas */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
				<StatCard
					title="Cupos Disponibles"
					value={`${resumen.cupos_invitados_restantes} pases`}
					icon={Ticket}
					colorClass="bg-[#2EB85C]" // Verde éxito
				/>
				<StatCard
					title="Beneficiarios"
					value={`${resumen.total_beneficiarios_activos} personas`}
					icon={Users}
					colorClass="bg-[#3399FF]" // Azul info
				/>
			</div>

			{/* 4. Sección de Reservas y Acciones */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="space-y-4">
					<h3 className="text-lg font-bold text-[#2C3A2C] px-1">
						Tu Próxima Visita
					</h3>
					<ProximaVisitaCard visita={resumen.proxima_visita} />
				</div>

				<div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E7E0] flex flex-col justify-center">
					<div className="text-center space-y-4">
						<div className="bg-primary/5 p-4 rounded-full w-fit mx-auto">
							<Ticket className="h-10 w-10 text-primary" />
						</div>
						<h3 className="text-xl font-bold">¿Planeas una visita?</h3>
						<p className="text-muted-foreground">
							Reserva un Full Day para disfrutar del sol o un bungalow para un
							descanso total.
						</p>
						<div className="pt-4">
							<a href="/visitas/nueva" className="inline-block w-full">
								<button className="w-full bg-[#2C3A2C] text-white py-3 rounded-xl font-bold hover:bg-[#1a2b1a] transition-all shadow-md">
									COMENZAR VISITA
								</button>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
