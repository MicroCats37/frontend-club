"use client";

import { ArrowRight, Home, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useResumen } from "@/hooks/auth/useResumen";
import { useTipoTarifasHabilitadas } from "@/hooks/useTarifas";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";

const getReferentialPrice = (
	category: string | null,
	type: "PASE" | "BUNGALOW",
	option: any,
) => {
	// Precios referenciales basados en categoría (Solo ilustración premium)
	if (type === "PASE") {
		if (category === "HABILITADO") return 0;
		if (category === "AFILIADO") return 10;
		return 30; // Invitado / No habilitado
	}

	// Para Bungalows, buscamos en las reglas si existen
	if (option.reglas && option.reglas.length > 0) {
		const firstRegla = option.reglas[0];
		if (
			firstRegla.precios_capacidad &&
			firstRegla.precios_capacidad.length > 0
		) {
			const pricing = firstRegla.precios_capacidad[0].precios;
			if (category === "HABILITADO")
				return pricing.noche_con_priv || pricing.noche_sin_priv || 150;
			return pricing.noche_sin_priv || 200;
		}
	}
	return 250; // Precio base fallback
};

export function VisitTypeCarousel() {
	const { data: resumen } = useResumen();
	const { data: tiposPases, isLoading: loadingPases } = useGetTiposPases();
	const { data: tarifasBungalow, isLoading: loadingTarifas } =
		useTipoTarifasHabilitadas();

	const category = resumen?.categoria || null;

	if (loadingPases || loadingTarifas) {
		return <VisitTypeSkeleton />;
	}

	return (
		<div className="w-full space-y-20 pb-12">
			{/* Sección 1: Pases Full Day */}
			<section className="space-y-8">
				<div className="flex flex-col sm:flex-row items-end justify-between gap-4 px-2">
					<div className="space-y-1">
						<h3 className="text-3xl sm:text-4xl font-black text-[#2C3A2C] tracking-tight">
							Pases Full Day
						</h3>
						<p className="text-muted-foreground font-medium text-sm sm:text-base max-w-lg">
							Disfruta del sol y todas nuestras sedes campestres con ingresos
							directos.
						</p>
					</div>
					<div className="hidden sm:flex gap-2 mb-2">
						<div className="h-2 w-12 bg-emerald-100 rounded-full" />
						<div className="h-2 w-4 bg-emerald-500 rounded-full" />
					</div>
				</div>

				<Carousel
					opts={{ align: "start", loop: true }}
					className="w-full relative group/pases"
				>
					<CarouselContent className="-ml-6">
						{tiposPases?.map((option: any) => (
							<CarouselItem
								key={option.id}
								className="pl-6 basis-full md:basis-1/2 lg:basis-1/3"
							>
								<VisitModeCard
									option={option}
									type="PASE"
									category={category}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<div className="absolute -top-20 right-6 flex gap-3">
						<CarouselPrevious className="static transform-none h-12 w-12 border-gray-100 bg-white hover:bg-[#2C3A2C] hover:text-white transition-all shadow-sm" />
						<CarouselNext className="static transform-none h-12 w-12 border-gray-100 bg-white hover:bg-[#2C3A2C] hover:text-white transition-all shadow-sm" />
					</div>
				</Carousel>
			</section>

			{/* Sección 2: Bungalows */}
			<section className="space-y-8">
				<div className="flex flex-col sm:flex-row items-end justify-between gap-4 px-2">
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
							<Home className="h-3 w-3 fill-current" />
							Escapada Nocturna
						</div>
						<h3 className="text-3xl sm:text-4xl font-black text-[#2C3A2C] tracking-tight">
							Alojamiento Bungalows
						</h3>
						<p className="text-muted-foreground font-medium text-sm sm:text-base max-w-lg">
							Tómate un respiro y hospédate en la comodidad de nuestros
							bungalows exclusivos.
						</p>
					</div>
					<div className="hidden sm:flex gap-2 mb-2">
						<div className="h-2 w-4 bg-amber-500 rounded-full" />
						<div className="h-2 w-12 bg-amber-100 rounded-full" />
					</div>
				</div>

				<Carousel
					opts={{ align: "start", loop: false }}
					className="w-full relative group/bungalows"
				>
					<CarouselContent className="-ml-6">
						{tarifasBungalow
							?.filter(
								(option: any) =>
									option.id !== "00000000-0000-0000-0000-000000000002",
							)
							.map((option: any) => (
								<CarouselItem
									key={option.id}
									className="pl-6 basis-full md:basis-1/2 lg:basis-1/3"
								>
									<VisitModeCard
										option={option}
										type="BUNGALOW"
										category={category}
									/>
								</CarouselItem>
							))}
					</CarouselContent>
					<div className="absolute -top-20 right-6 flex gap-3">
						<CarouselPrevious className="static transform-none h-12 w-12 border-gray-100 bg-white hover:bg-[#2C3A2C] hover:text-white transition-all shadow-sm" />
						<CarouselNext className="static transform-none h-12 w-12 border-gray-100 bg-white hover:bg-[#2C3A2C] hover:text-white transition-all shadow-sm" />
					</div>
				</Carousel>
			</section>
		</div>
	);
}

function VisitModeCard({
	option,
	type,
	category,
}: {
	option: any;
	type: "PASE" | "BUNGALOW";
	category: string | null;
}) {
	const isBungalow = type === "BUNGALOW";
	const price = getReferentialPrice(category, type, option);
	const Icon = isBungalow ? Home : Ticket;

	return (
		<div className="h-full p-2">
			<div className="group relative bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 p-8 flex flex-col h-full overflow-hidden">
				{/* Background Decoration */}
				<div
					className={`absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-1000 ${
						isBungalow ? "bg-amber-600" : "bg-emerald-600"
					}`}
				/>

				<div className="flex justify-between items-start mb-10 relative z-10">
					<div
						className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${
							isBungalow
								? "bg-amber-50 text-amber-600 shadow-inner"
								: "bg-emerald-50 text-emerald-600 shadow-inner"
						}`}
					>
						<Icon className="h-8 w-8" />
					</div>
					<Badge
						className={`border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full shadow-sm ${
							isBungalow
								? "bg-amber-100 text-amber-700"
								: "bg-emerald-100 text-emerald-700"
						}`}
					>
						{isBungalow ? "Por Noche" : "Por Día"}
					</Badge>
				</div>

				<div className="space-y-4 flex-1 relative z-10">
					<h4 className="text-2xl font-black text-[#2C3A2C] leading-[1.1] tracking-tighter">
						{option.nombre}
					</h4>
					<p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2">
						{option.descripcion ||
							(isBungalow
								? "Hospedaje premium con vista privilegiada a las áreas verdes."
								: "Disfruta de piscinas, parrillas y recreación total.")}
					</p>
				</div>

				<div className="mt-10 mb-8 p-6 rounded-3xl bg-gray-50/50 border border-gray-100/50 relative z-10 group-hover:bg-white transition-colors duration-500">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
								Precio Referencial
							</p>
							<p className="text-2xl font-black text-[#2C3A2C] tracking-tighter">
								{price === 0 ? (
									<span className="text-emerald-600">¡GRATIS!</span>
								) : (
									<>
										<span className="text-xs mr-1 font-bold">Desde S/</span>
										{price}
									</>
								)}
							</p>
						</div>
						<div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-gray-300 shadow-sm">
							<MapPin className="h-5 w-5" />
						</div>
					</div>
				</div>

				<a
					href={
						isBungalow
							? `/visitas/nueva?type=BUNGALOW&tarifaId=${option.id}`
							: `/visitas/nueva?type=PASE_DIARIO&paseId=${option.id}`
					}
					className="relative z-10"
				>
					<Button
						className={`w-full h-16 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl ${
							isBungalow
								? "bg-[#2C3A2C] hover:bg-black text-white shadow-[#2C3A2C]/10"
								: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10"
						}`}
					>
						Reservar Ahora{" "}
						<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
					</Button>
				</a>
			</div>
		</div>
	);
}

function VisitTypeSkeleton() {
	return (
		<div className="w-full space-y-20 py-12 animate-pulse">
			{[1, 2].map((i) => (
				<section key={i} className="space-y-8">
					<div className="h-16 w-64 bg-gray-100 rounded-3xl" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[1, 2, 3].map((j) => (
							<div
								key={j}
								className="h-[450px] bg-gray-50 rounded-[40px] border border-gray-100"
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
