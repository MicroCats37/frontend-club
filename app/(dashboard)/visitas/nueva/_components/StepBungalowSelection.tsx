"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowRight,
	CalendarDays,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Filter,
	Loader2,
	Map as MapIcon,
	Star,
	Users,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useBungalowsDisponibilidad } from "@/hooks/useBungalows";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";
import { resolveImageUrl } from "@/lib/utils";

// ============================================================================
// 1. CONFIGURACIÓN DEL MAPA ESTÁTICO
// ============================================================================
const MAPA_ZONAS = [
	{
		zona: "A",
		pisos: [
			{ nivel: 1, cabanas: ["A-101", "A-102", "A-103", "A-104"] },
			{ nivel: 2, cabanas: ["A-201", "A-202", "A-203", "A-204"] },
		],
	},
	{
		zona: "B",
		pisos: [
			{ nivel: 1, cabanas: ["B-101", "B-102", "B-103", "B-104"] },
			{ nivel: 2, cabanas: ["B-201", "B-202", "B-203", "B-204"] },
		],
	},
	{
		zona: "C",
		pisos: [
			{ nivel: 1, cabanas: ["C-101", "C-102", "C-103", "C-104"] },
			{ nivel: 2, cabanas: ["C-201", "C-202", "C-203", "C-204"] },
		],
	},
];

// ============================================================================
// 2. COMPONENTE MODAL (Detalle de la Cabaña)
// ============================================================================
const BungalowModal = ({
	bungalow,
	isOpen,
	onClose,
	isSelected,
	onToggle,
}: any) => {
	const [showDesglose, setShowDesglose] = useState(false);

	if (!bungalow) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[32px] border-none">
				<div className="relative aspect-[16/10] bg-gray-100">
					<img
						src={
							resolveImageUrl(bungalow.image_main) ||
							"https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=1000&auto=format&fit=crop"
						}
						alt={bungalow.nombre}
						className="w-full h-full object-cover"
					/>
					<div className="absolute top-4 left-4">
						<Badge className="bg-white/95 text-[#2C3A2C] border-none px-3 py-1.5 font-black backdrop-blur-md shadow-sm rounded-xl">
							{bungalow.numero}
						</Badge>
					</div>
				</div>

				<div className="p-6">
					<DialogHeader>
						<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
							{bungalow.nombre}
						</DialogTitle>
					</DialogHeader>

					<div className="grid grid-cols-2 gap-3 my-4">
						<div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
							<Users className="h-4 w-4 text-gray-400" />
							<div>
								<p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-1">
									Capacidad
								</p>
								<p className="text-sm font-bold text-[#2C3A2C] leading-none">
									{bungalow.capacidad} Pers.
								</p>
							</div>
						</div>
						<div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
							<Star className="h-4 w-4 text-gray-400" />
							<div>
								<p className="text-[9px] uppercase font-black text-gray-400 leading-none mb-1">
									Nivel
								</p>
								<p className="text-sm font-bold text-[#2C3A2C] leading-none">
									{bungalow.piso}° Piso
								</p>
							</div>
						</div>
					</div>

					<div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden mb-6">
						<button
							onClick={() => setShowDesglose(!showDesglose)}
							className="w-full flex justify-between items-center p-4 text-sm font-bold text-[#2C3A2C] hover:bg-gray-100 transition-colors"
						>
							<span className="flex items-center gap-2">
								<CalendarDays className="h-4 w-4 text-amber-500" />
								Total: S/ {Math.ceil(Number(bungalow.precio_total))}
							</span>
							{showDesglose ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</button>

						{showDesglose && bungalow.desglose && (
							<div className="px-4 pb-4 space-y-2">
								{bungalow.desglose.map((dia: any, idx: number) => {
									const fechaObj = parseISO(dia.fecha);
									return (
										<div
											key={idx}
											className="flex justify-between items-center border-b border-gray-100/50 pb-2 last:border-0 last:pb-0"
										>
											<div>
												<p className="text-xs font-bold text-gray-600">
													{dia.dia}{" "}
													<span className="text-gray-400 font-medium ml-1">
														{format(fechaObj, "dd/MM")}
													</span>
												</p>
											</div>
											<div>
												<p
													className={`text-xs font-black ${dia.feriado ? "text-red-600" : "text-gray-600"}`}
												>
													{dia.feriado ? "Feriado" : "Normal"}
												</p>
											</div>
											<p className="text-xs font-black text-amber-600">
												S/ {Math.ceil(Number(dia.precio))}
											</p>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<Button
						onClick={() => {
							onToggle(bungalow);
							onClose();
						}}
						className={`w-full h-12 rounded-xl font-black text-sm transition-all ${
							isSelected
								? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm"
								: "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200"
						}`}
					>
						{isSelected ? "Quitar Selección" : "Seleccionar Cabaña"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL (La Pantalla con Sidebar)
// ============================================================================
export function StepBungalowSelection() {
	const {
		fechas,
		noches,
		bungalowsSeleccionados,
		setBungalows,
		setPaso,
		tipoVisita,
		tipoTarifaId,
	} = useVisitaRegistrationStore();

	const [selectedZone, setSelectedZone] = useState<string>("A");
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedBungalowData, setSelectedBungalowData] = useState<any>(null);

	const { data: bungalowsAPI, isLoading } = useBungalowsDisponibilidad({
		f_inicio: fechas.start ? format(fechas.start, "yyyy-MM-dd") : "",
		f_fin: fechas.end ? format(fechas.end, "yyyy-MM-dd") : "",
		tipo_tarifa_id: tipoTarifaId || undefined,
	});

	// Mapa para buscar rápido en O(1)
	const bungalowsMap = useMemo(() => {
		const map = new Map();
		if (bungalowsAPI) {
			bungalowsAPI.forEach((b: any) => map.set(b.numero, b));
		}
		return map;
	}, [bungalowsAPI]);

	// Filtrar las zonas para el render
	const zonasRender = useMemo(() => {
		if (selectedZone === "TODAS") return MAPA_ZONAS;
		return MAPA_ZONAS.filter((z) => z.zona === selectedZone);
	}, [selectedZone]);

	const handleToggle = (bungalow: any) => {
		const isSelected = bungalowsSeleccionados.some((b) => b.id === bungalow.id);
		if (isSelected) {
			setBungalows(bungalowsSeleccionados.filter((b) => b.id !== bungalow.id));
		} else {
			setBungalows([...bungalowsSeleccionados, bungalow]);
		}
	};

	const openModal = (bungalowData: any) => {
		setSelectedBungalowData(bungalowData);
		setModalOpen(true);
	};

	const isNextDisabled = bungalowsSeleccionados.length === 0;

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-24 animate-in fade-in">
				<Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
				<p className="font-black text-[#2C3A2C]">Cargando disponibilidad...</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
			{/* Header Principal */}
			<div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
				<div>
					<h2 className="text-2xl sm:text-3xl font-black text-[#2C3A2C] mb-2 tracking-tight">
						Selecciona tu Alojamiento
					</h2>
					<p className="text-muted-foreground font-medium text-sm sm:text-base">
						Estadía de{" "}
						<span className="text-amber-600 font-bold">
							{noches.length} noches
						</span>{" "}
						para el{" "}
						<span className="text-[#2C3A2C] font-bold">
							{fechas.start &&
								format(fechas.start, "d 'de' MMMM", { locale: es })}
						</span>
					</p>
				</div>

				<div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm sticky top-4 z-40">
					<div className="px-5 py-2.5 bg-amber-50 rounded-xl border border-amber-100">
						<p className="text-[10px] uppercase font-black text-amber-600 mb-1">
							Cabañas
						</p>
						<p className="text-sm font-black text-amber-900">
							{bungalowsSeleccionados.length} seleccionados
						</p>
					</div>
					<Button
						disabled={isNextDisabled}
						onClick={() => setPaso(4)}
						className="h-12 px-8 rounded-xl font-black bg-[#2C3A2C] hover:bg-[#1a2b1a] shadow-lg transition-all"
					>
						Continuar <ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-8 px-4 relative">
				{/* SIDEBAR */}
				<div className="w-full lg:w-1/4 flex flex-col gap-6">
					<div className="sticky top-24 space-y-6">
						<Card className="overflow-hidden rounded-[24px] border border-gray-100 shadow-sm">
							<div className="relative aspect-[4/3] bg-gray-100">
								<img
									src="https://images.unsplash.com/photo-1628624747186-a941c476b7ef?q=80&w=1000&auto=format&fit=crop"
									alt="Mapa del Club"
									className="w-full h-full object-cover opacity-90"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
									<div className="text-white">
										<div className="flex items-center gap-2 mb-1">
											<MapIcon className="h-4 w-4 text-amber-400" />
											<h3 className="font-black text-base leading-none">
												Plano General
											</h3>
										</div>
										<p className="text-[10px] text-gray-200 font-medium">
											Ubica tu bloque preferido
										</p>
									</div>
								</div>
							</div>
						</Card>

						<Card className="p-5 rounded-[24px] border border-gray-100 shadow-sm bg-white">
							<div className="flex items-center gap-2 mb-4">
								<Filter className="h-4 w-4 text-amber-500" />
								<h3 className="font-black text-sm text-[#2C3A2C] uppercase tracking-wider">
									Filtrar por Bloque
								</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{["TODAS", "A", "B", "C"].map((zona) => (
									<button
										key={zona}
										onClick={() => setSelectedZone(zona)}
										className={`px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all duration-300 ${
											selectedZone === zona
												? "bg-amber-500 text-white shadow-sm shadow-amber-200"
												: "bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-600 border border-gray-100"
										}`}
									>
										{zona === "TODAS" ? "Ver Todo" : `Bloque ${zona}`}
									</button>
								))}
							</div>
						</Card>
					</div>
				</div>

				{/* CONTENIDO PRINCIPAL: Mapa de Asientos */}
				<div className="w-full lg:w-3/4 flex flex-col gap-8">
					{zonasRender.map((zonaData) => (
						<Card
							key={zonaData.zona}
							className="p-6 rounded-[24px] border border-gray-100 shadow-sm bg-white overflow-hidden relative"
						>
							<div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
								<div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-black">
									{zonaData.zona}
								</div>
								<h3 className="text-xl font-black text-[#2C3A2C]">
									Bloque {zonaData.zona}
								</h3>
							</div>

							<div className="space-y-6">
								{zonaData.pisos.map((piso) => (
									<div key={piso.nivel}>
										<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
											<span className="w-4 h-[1px] bg-gray-200"></span>
											Nivel {piso.nivel}
											<span className="flex-1 h-[1px] bg-gray-100"></span>
										</p>

										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
											{piso.cabanas.map((numCabana) => {
												const bungalowData = bungalowsMap.get(numCabana);
												const isAvailable = !!bungalowData;
												const isSelected =
													isAvailable &&
													bungalowsSeleccionados.some(
														(b) => b.id === bungalowData.id,
													);

												// ESTILO 1: Seleccionado (Ambar)
												if (isSelected) {
													return (
														<button
															key={numCabana}
															onClick={() => openModal(bungalowData)}
															className="relative flex flex-col items-center justify-center p-2 h-16 w-full rounded-xl bg-amber-500 text-white shadow-md shadow-amber-200/50 border border-amber-600 hover:scale-[1.03] transition-all group"
														>
															<CheckCircle2 className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-white text-amber-500 rounded-full shadow-sm" />
															<span className="font-bold text-sm tracking-tight">
																{numCabana}
															</span>

															{/* Información de Capacidad y Precio en una sola línea */}
															<div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-semibold bg-black/10 px-1.5 py-0.5 rounded">
																<span className="flex items-center gap-0.5">
																	<Users className="h-2.5 w-2.5" />
																	{bungalowData.capacidad}
																</span>
																<span>•</span>
																<span>
																	S/{" "}
																	{Math.ceil(Number(bungalowData.precio_total))}
																</span>
															</div>
														</button>
													);
												}

												// ESTILO 2: Disponible (Blanco)
												if (isAvailable) {
													return (
														<button
															key={numCabana}
															onClick={() => openModal(bungalowData)}
															className="relative flex flex-col items-center justify-center p-2 h-16 w-full rounded-xl bg-white text-[#2C3A2C] border border-gray-200 shadow-sm hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 hover:scale-[1.03] transition-all"
														>
															<span className="font-bold text-sm tracking-tight">
																{numCabana}
															</span>

															{/* Información de Capacidad y Precio en una sola línea */}
															<div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-semibold text-gray-500">
																<span className="flex items-center gap-0.5">
																	<Users className="h-2.5 w-2.5" />
																	{bungalowData.capacidad}
																</span>
																<span>•</span>
																<span>
																	S/{" "}
																	{Math.ceil(Number(bungalowData.precio_total))}
																</span>
															</div>
														</button>
													);
												}

												// ESTILO 3: Ocupado (Gris)
												return (
													<div
														key={numCabana}
														title="Ocupado"
														className="relative flex flex-col items-center justify-center p-2 h-16 w-full rounded-xl bg-gray-50 text-gray-300 border border-transparent cursor-not-allowed"
													>
														<X className="absolute top-1 right-1 h-3 w-3 text-gray-200" />
														<span className="font-bold text-sm tracking-tight">
															{numCabana}
														</span>
														<span className="text-[9px] font-semibold mt-0.5 text-gray-300 uppercase tracking-widest">
															No Disp.
														</span>
													</div>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</Card>
					))}
				</div>
			</div>

			<BungalowModal
				bungalow={selectedBungalowData}
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSelected={
					selectedBungalowData
						? bungalowsSeleccionados.some(
								(b) => b.id === selectedBungalowData.id,
							)
						: false
				}
				onToggle={handleToggle}
			/>
		</div>
	);
}
