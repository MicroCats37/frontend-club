"use client";

import Autoplay from "embla-carousel-autoplay";
import {
	ArrowRight,
	Home,
	Info as InfoIcon,
	Loader2,
	Sparkles,
	Ticket,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useTipoTarifasHabilitadas } from "@/hooks/useTarifas";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";
import type { TipoTarifa } from "@/schemas/alojamiento/tarifa";
import { TipoTarifaPricingModal } from "./TipoTarifaPricingModal";

export function StepTipoVisita() {
	const {
		setTipoVisita,
		setPaso,
		setDefaultTipoPaseId,
		defaultTipoPaseId,
		setTipoTarifaId,
		setSelectedTariff,
		tipoTarifaId,
	} = useVisitaRegistrationStore();

	const [previewTarifa, setPreviewTarifa] = useState<TipoTarifa | null>(null);
	const [showPricingModal, setShowPricingModal] = useState(false);

	const { data: tiposPases, isLoading: loadingPases } = useGetTiposPases();
	const { data: tarifasBungalow, isLoading: loadingTarifas } =
		useTipoTarifasHabilitadas();

	const handlePassSelect = (passId: string) => {
		setTipoVisita("PASE_DIARIO");
		setDefaultTipoPaseId(passId);
		setTipoTarifaId(null);
		setSelectedTariff(null);
		setPaso(2);
	};

	const handleBungalowTariffSelect = (tariff: TipoTarifa) => {
		setTipoVisita("BUNGALOW");
		setTipoTarifaId(tariff.id);
		setSelectedTariff(tariff);
		setDefaultTipoPaseId(null);
		setPaso(2);
	};

	const handleShowPricing = (e: React.MouseEvent, tariff: TipoTarifa) => {
		e.stopPropagation();
		setPreviewTarifa(tariff);
		setShowPricingModal(true);
	};

	if (loadingPases || loadingTarifas) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
				<p className="font-bold text-primary/60 uppercase tracking-widest text-xs">
					Preparando opciones...
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center py-4 sm:py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-7xl mx-auto">
			<div className="text-center mb-10 sm:mb-16 px-4">
				<h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C3A2C] mb-4 tracking-tighter">
					Elige tu modalidad
				</h2>
				<p className="text-muted-foreground max-w-lg mx-auto font-medium text-base sm:text-lg leading-relaxed">
					Selecciona cómo quieres disfrutar del club hoy. Cada opción tiene sus
					propias tarifas y beneficios.
				</p>
			</div>

			{/* SECCIÓN 1: PASES DIARIOS */}
			<div className="w-full mb-20 px-4">
				<div className="flex items-center gap-3 mb-8">
					<div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
						<Ticket className="h-6 w-6" />
					</div>
					<h3 className="text-2xl font-black text-[#2C3A2C] tracking-tight">
						Pases Full Day
					</h3>
					<div className="h-px flex-1 bg-gray-100 ml-4 hidden md:block" />
				</div>

				<Carousel
					opts={{ align: "start", loop: true }}
					plugins={[
						Autoplay({
							delay: 2000,
							stopOnMouseEnter: true,
							stopOnInteraction: false,
						}),
					]}
					className="w-full relative px-6 sm:px-12"
				>
					<CarouselContent>
						{tiposPases?.map((pase) => (
							<CarouselItem
								key={pase.id}
								className="basis-full md:basis-1/2 lg:basis-1/3 p-4"
							>
								<div
									onClick={() => handlePassSelect(pase.id)}
									className={`group relative cursor-pointer p-0.5 sm:p-1 rounded-[32px] sm:rounded-[40px] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] h-full ${
										defaultTipoPaseId === pase.id
											? "bg-gradient-to-br from-primary to-primary/60 shadow-xl shadow-primary/20"
											: "bg-gray-100/50 hover:bg-gray-200/50"
									}`}
								>
									<div className="bg-white rounded-[31px] sm:rounded-[38px] p-6 sm:p-8 h-full flex flex-col items-center text-center overflow-hidden relative border border-gray-100/50 shadow-sm">
										<div
											className={`h-20 w-20 rounded-[28px] flex items-center justify-center mb-6 transition-all duration-500 ${
												defaultTipoPaseId === pase.id
													? "bg-primary text-white rotate-6 shadow-lg shadow-primary/20"
													: "bg-primary/5 text-primary group-hover:rotate-6"
											}`}
										>
											<Ticket className="h-10 w-10" />
										</div>
										<h4 className="text-xl font-black text-[#2C3A2C] mb-2 leading-tight">
											{pase.nombre}
										</h4>
										<p className="text-sm text-muted-foreground mb-6 line-clamp-2">
											{pase.descripcion || "Acceso completo por el día."}
										</p>
										<div className="mt-auto w-full">
											<Button
												className={`w-full h-12 rounded-2xl font-black transition-all ${
													defaultTipoPaseId === pase.id
														? "bg-primary shadow-lg shadow-primary/20"
														: "bg-[#2C3A2C] hover:bg-black"
												}`}
											>
												Elegir <ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="hidden md:flex -left-6" />
					<CarouselNext className="hidden md:flex -right-6" />
					<CarouselDots className="mt-8" />
				</Carousel>
			</div>

			{/* SECCIÓN 2: ALOJAMIENTO / BUNGALOWS */}
			<div className="w-full px-4">
				<div className="flex items-center gap-3 mb-8">
					<div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
						<Home className="h-6 w-6" />
					</div>
					<h3 className="text-2xl font-black text-[#2C3A2C] tracking-tight">
						Alojamiento en Bungalows
					</h3>
					<div className="h-px flex-1 bg-gray-100 ml-4 hidden md:block" />
				</div>

				<Carousel
					opts={{ align: "start", loop: true }}
					plugins={[
						Autoplay({
							delay: 1000,
							stopOnMouseEnter: true,
							stopOnInteraction: false,
						}),
					]}
					className="w-full relative px-12"
				>
					<CarouselContent>
						{tarifasBungalow
							?.filter(
								(tarifa) =>
									tarifa.id !== "00000000-0000-0000-0000-000000000002",
							)
							.map((tarifa) => (
								<CarouselItem
									key={tarifa.id}
									className="basis-full md:basis-1/2 lg:basis-1/3 p-4"
								>
									<div
										onClick={() => handleBungalowTariffSelect(tarifa)}
										className={`group relative cursor-pointer p-0.5 sm:p-1 rounded-[32px] sm:rounded-[40px] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] h-full ${
											tipoTarifaId === tarifa.id
												? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-200"
												: "bg-gray-100/50 hover:bg-gray-200/50"
										}`}
									>
										<div className="bg-white rounded-[31px] sm:rounded-[38px] p-6 sm:p-8 h-full flex flex-col items-center text-center overflow-hidden relative border border-gray-100/50 shadow-sm">
											<Button
												variant="ghost"
												size="icon"
												onClick={(e) => handleShowPricing(e, tarifa)}
												className="absolute top-6 left-6 h-10 w-10 rounded-xl bg-gray-50 hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-all duration-300 pointer-events-auto"
											>
												<InfoIcon className="h-5 w-5" />
											</Button>

											{tarifa.reglas?.some((r) => r.es_paquete_obligatorio) && (
												<Badge className="absolute top-6 right-6 bg-amber-100 text-amber-700 border-none px-3 py-1 font-black text-[10px] uppercase tracking-wider">
													Paquete
												</Badge>
											)}
											<div
												className={`h-20 w-20 rounded-[28px] flex items-center justify-center mb-6 transition-all duration-500 ${
													tipoTarifaId === tarifa.id
														? "bg-amber-500 text-white -rotate-6 shadow-lg shadow-amber-200"
														: "bg-amber-50 text-amber-600 group-hover:-rotate-6"
												}`}
											>
												<Home className="h-10 w-10" />
											</div>
											<h4 className="text-xl font-black text-[#2C3A2C] mb-1 leading-tight">
												{tarifa.nombre}
											</h4>

											<p className="text-xs text-muted-foreground mb-6 line-clamp-2 px-4">
												{tarifa.descripcion || "Reserva por estadía completa."}
											</p>

											<div className="w-full flex flex-wrap justify-center gap-2 mb-8 mt-auto">
												<div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100">
													<Sparkles className="h-3 w-3 text-amber-500" />
													Vigente
												</div>
											</div>

											<div className="w-full">
												<Button
													className={`w-full h-12 rounded-2xl font-black transition-all ${
														tipoTarifaId === tarifa.id
															? "bg-amber-500 shadow-lg shadow-amber-200 text-white"
															: "bg-amber-900 hover:bg-black text-white"
													}`}
												>
													Elegir <ArrowRight className="ml-2 h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								</CarouselItem>
							))}
					</CarouselContent>
					<CarouselPrevious className="hidden md:flex -left-6" />
					<CarouselNext className="hidden md:flex -right-6" />
					<CarouselDots className="mt-8" />
				</Carousel>
			</div>

			<TipoTarifaPricingModal
				tipoTarifa={previewTarifa}
				open={showPricingModal}
				onOpenChange={setShowPricingModal}
			/>
		</div>
	);
}
