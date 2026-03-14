"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowRight,
	CheckCircle2,
	Home,
	Loader2,
	Star,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useBungalowsDisponibilidad } from "@/hooks/useBungalows";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepBungalowSelection() {
	const { fechas, bungalowsSeleccionados, setBungalows, setPaso, tipoVisita, tipoTarifaId } =
		useVisitaRegistrationStore();

	const { data: bungalows, isLoading } = useBungalowsDisponibilidad({
		f_inicio: fechas.start ? format(fechas.start, "yyyy-MM-dd") : "",
		f_fin: fechas.end ? format(fechas.end, "yyyy-MM-dd") : "",
		tipo_tarifa_id: tipoTarifaId || undefined,
	});

	const handleToggle = (bungalow: any) => {
		const isSelected = bungalowsSeleccionados.some((b) => b.id === bungalow.id);
		if (isSelected) {
			setBungalows(bungalowsSeleccionados.filter((b) => b.id !== bungalow.id));
		} else {
			setBungalows([...bungalowsSeleccionados, bungalow]);
		}
	};

	const isNextDisabled = bungalowsSeleccionados.length === 0;

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
				<div className="relative group">
					<div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
					<div className="relative h-20 w-20 bg-white rounded-full flex items-center justify-center border shadow-sm">
						<Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
					</div>
				</div>
				<p className="mt-6 font-black text-[#2C3A2C] text-lg">
					Buscando bungalows disponibles...
				</p>
				<p className="text-muted-foreground text-sm">
					Validando calendario y tarifas para tus fechas.
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6 px-4">
				<div>
					<h2 className="text-3xl font-black text-[#2C3A2C] mb-2 tracking-tight">
						Selecciona tu Alojamiento
					</h2>
					<p className="text-muted-foreground flex flex-wrap items-center gap-2 font-medium">
						Disponibilidad del{" "}
						<span className="text-[#2C3A2C] font-bold">
							{fechas.start && format(fechas.start, "PPP", { locale: es })}
						</span>{" "}
						al{" "}
						<span className="text-[#2C3A2C] font-bold">
							{fechas.end && format(fechas.end, "PPP", { locale: es })}
						</span>
					</p>
				</div>

				<div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm self-stretch md:self-auto">
					<div className="px-5 py-2.5 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
						<div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
							<Home className="h-4 w-4 text-white" />
						</div>
						<div>
							<p className="text-[10px] uppercase font-black text-amber-600 leading-none mb-1">
								Cabañas
							</p>
							<p className="text-sm font-black text-amber-900 leading-none">
								{bungalowsSeleccionados.length} seleccionados
							</p>
						</div>
					</div>

					<Button
						disabled={isNextDisabled}
						onClick={() => setPaso(4)}
						className="h-12 px-8 rounded-xl font-black bg-[#2C3A2C] hover:bg-[#1a2b1a] shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95"
					>
						Continuar <ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</div>
			</div>

			{!bungalows || bungalows.length === 0 ? (
				<Card className="p-20 text-center rounded-[40px] border-2 border-dashed border-gray-100 bg-gray-50/30">
					<div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
						<Home className="h-12 w-12 text-gray-200" />
					</div>
					<h3 className="text-2xl font-black text-[#2C3A2C]">
						No hay bungalows disponibles
					</h3>
					<p className="text-muted-foreground mt-2 max-w-sm mx-auto">
						Lo sentimos, no encontramos bungalows que coincidan con tu búsqueda
						para estas fechas. Prueba cambiando el rango de estadía.
					</p>
					<Button
						variant="outline"
						onClick={() => setPaso(2)}
						className="mt-8 rounded-xl font-bold border-gray-200"
					>
						Cambiar fechas
					</Button>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
					{bungalows.map((bungalow: any) => {
						const isSelected = bungalowsSeleccionados.some(
							(b) => b.id === bungalow.id,
						);
						return (
							<Card
								key={bungalow.id}
								onClick={() => handleToggle(bungalow)}
								className={`group relative cursor-pointer overflow-hidden rounded-[40px] transition-all duration-500 border-2 ${isSelected
									? "border-amber-500 shadow-2xl scale-[1.02] bg-amber-50/10"
									: "border-white shadow-lg shadow-gray-200/50 hover:border-amber-200 bg-white"
									}`}
							>
								{/* Image Section */}
								<div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
									<img
										src={`http://localhost:8000${bungalow.image_main}`}
										alt={bungalow.nombre}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
									/>

									<div className="absolute top-6 left-6 flex flex-col gap-2">
										<Badge className="bg-white/90 text-[#2C3A2C] border-none hover:bg-white px-4 py-1.5 font-black backdrop-blur-md shadow-sm text-sm rounded-xl">
											B-{bungalow.numero}
										</Badge>
									</div>

									<div className="absolute bottom-4 right-4 animate-in fade-in zoom-in duration-300">
										<div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl flex flex-col items-center">
											<p className="text-[8px] uppercase font-black text-gray-500 leading-none mb-1">
												X {bungalow.noches} noches
											</p>
											<p className="text-lg font-black text-[#2C3A2C] leading-none">
												S/ {Number(bungalow.precio_total)?.toFixed(0)}
											</p>
										</div>
									</div>

									{isSelected && (
										<div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 animate-in fade-in">
											<div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-amber-500 animate-in zoom-in duration-300">
												<CheckCircle2 className="h-8 w-8 text-amber-500" />
											</div>
										</div>
									)}
								</div>

								<CardContent className="p-8 pb-10">
									<div className="flex justify-between items-start mb-6">
										<div>
											<Badge
												variant="outline"
												className="text-[10px] font-black uppercase tracking-widest text-amber-600 border-amber-200 mb-2 rounded-lg"
											>
												{bungalow.zona || "Área Principal"}
											</Badge>
											<CardTitle className="text-2xl font-black text-[#2C3A2C] tracking-tight">
												{bungalow.nombre}
											</CardTitle>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 mb-8">
										<div className="bg-gray-50/50 p-4 rounded-2xl flex items-center gap-3">
											<div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400">
												<Users className="h-4 w-4" />
											</div>
											<div>
												<p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-1">
													Capacidad
												</p>
												<p className="text-xs font-bold text-[#2C3A2C] leading-none">
													{bungalow.capacidad} Pers.
												</p>
											</div>
										</div>
										<div className="bg-gray-50/50 p-4 rounded-2xl flex items-center gap-3">
											<div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400">
												<Star className="h-4 w-4" />
											</div>
											<div>
												<p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-1">
													Nivel
												</p>
												<p className="text-xs font-bold text-[#2C3A2C] leading-none">
													{bungalow.piso || 1}° Piso
												</p>
											</div>
										</div>
									</div>

									<Button
										variant={isSelected ? "default" : "outline"}
										className={`w-full h-14 rounded-2xl font-black text-base shadow-sm transition-all duration-300 ${isSelected
											? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200"
											: "border-2 border-gray-100 bg-white text-gray-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/30"
											}`}
									>
										{isSelected ? "Cabaña Seleccionada" : "Seleccionar Cabaña"}
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
