"use client";

import {
	Calendar,
	Clock,
	DollarSign,
	Info,
	LayoutGrid,
	Loader2,
	Plus,
	Settings2,
	Trash2,
	Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import { InputImage } from "@/components/generic/genericForm/inputs/InputImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBungalowPricingList } from "@/hooks/useBungalows";
import { useCreateTipoTarifa } from "@/hooks/useTarifas";
import {
	type TipoTarifaInput,
	TipoTarifaInputSchema,
} from "@/schemas/alojamiento/tarifa";

interface TipoTarifaCreateModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DIAS = [
	{ id: 1, label: "Lunes", short: "L", disabled: true },
	{ id: 2, label: "Martes", short: "M" },
	{ id: 3, label: "Miércoles", short: "X" },
	{ id: 4, label: "Jueves", short: "J" },
	{ id: 5, label: "Viernes", short: "V" },
	{ id: 6, label: "Sábado", short: "S" },
	{ id: 7, label: "Domingo", short: "D", disabled: true },
];

const MOTORES = [
	{ id: "DIAS_SEMANA", label: "Días de la Semana", icon: Clock },
	{ id: "RANGO", label: "Rango de Fechas", icon: Calendar },
	{ id: "FECHAS_PUNTUALES", label: "Fechas Específicas", icon: LayoutGrid },
];

interface PricingItem {
	capacidad: number;
	precios: {
		noche_con_priv: string;
		noche_sin_priv: string;
		paquete_con_priv?: string;
		paquete_sin_priv?: string;
	};
}

interface RuleState {
	nombre: string;
	motor: "DIAS_SEMANA" | "RANGO" | "FECHAS_PUNTUALES";
	config: {
		fechas: string[];
		desde: string;
		hasta: string;
		dias: number[];
	};
	es_paquete_obligatorio: boolean;
	precios_capacidad: PricingItem[];
}

export function TipoTarifaCreateModal({
	open,
	onOpenChange,
}: TipoTarifaCreateModalProps) {
	const createMutation = useCreateTipoTarifa();
	const { data: bungalows } = useBungalowPricingList();

	const _capacities = useMemo(() => {
		if (!bungalows) return [];
		const caps = new Set(bungalows.map((b) => b.capacidad));
		return Array.from(caps).sort((a, b) => a - b);
	}, [bungalows]);

	// Eliminamos estados manuales que ahora manejará GenericForm
	// const [nombre, setNombre] = useState("");
	// const [activo, setActivo] = useState(true);
	// const [imageMain, setImageMain] = useState<string | null>(null);

	const createEmptyRule = () => {
		const currentCapacities = [3, 4]; // Estrictamente 3 y 4 solamente como se solicitó
		return {
			nombre: `Bloque ${reglas.length + 1}`,
			motor: "DIAS_SEMANA" as const,
			config: {
				fechas: [],
				desde: "",
				hasta: "",
				dias: [],
			},
			es_paquete_obligatorio: false,
			precios_capacidad: currentCapacities.map((c) => ({
				capacidad: c,
				precios: {
					noche_con_priv: "",
					noche_sin_priv: "",
					paquete_con_priv: "",
					paquete_sin_priv: "",
				},
			})),
		};
	};

	const [reglas, setReglas] = useState<RuleState[]>([]);

	// Inicializar primera regla cuando se cargan las capacidades o al abrir
	useEffect(() => {
		if (open && reglas.length === 0) {
			setReglas([createEmptyRule()]);
		}
	}, [open, reglas.length, createEmptyRule]);

	const addRule = () => {
		setReglas([...reglas, createEmptyRule()]);
	};

	const removeRule = (index: number) => {
		setReglas(reglas.filter((_, i) => i !== index));
	};

	const updateRule = (index: number, updates: Partial<RuleState>) => {
		setReglas(reglas.map((r, i) => (i === index ? { ...r, ...updates } : r)));
	};

	const updateGlobalMotor = (motor: RuleState["motor"]) => {
		setReglas(reglas.map((r) => ({ ...r, motor })));
	};

	const toggleDiaInRule = (ruleIndex: number, dayId: number) => {
		const rule = reglas[ruleIndex];
		const newDays = rule.config.dias.includes(dayId)
			? rule.config.dias.filter((d) => d !== dayId)
			: [...rule.config.dias, dayId];
		updateRule(ruleIndex, { config: { ...rule.config, dias: newDays } });
	};

	const updatePriceInRule = (
		ruleIndex: number,
		capacity: number,
		field: string,
		value: string,
	) => {
		const rule = reglas[ruleIndex];
		const newPrices = rule.precios_capacidad.map((p) =>
			p.capacidad === capacity
				? { ...p, precios: { ...p.precios, [field]: value } }
				: p,
		);
		updateRule(ruleIndex, { precios_capacidad: newPrices });
	};

	const handleCreate = async (values: TipoTarifaInput) => {
		await createMutation.mutateAsync(
			{
				...values,
				reglas: reglas.map((r) => ({
					...r,
					precios_capacidad: r.precios_capacidad.map((p) => ({
						capacidad: p.capacidad,
						precios: {
							noche_con_priv: Number(p.precios.noche_con_priv),
							noche_sin_priv: Number(p.precios.noche_sin_priv),
							paquete_con_priv:
								p.precios.paquete_con_priv !== ""
									? Number(p.precios.paquete_con_priv)
									: null,
							paquete_sin_priv:
								p.precios.paquete_sin_priv !== ""
									? Number(p.precios.paquete_sin_priv)
									: null,
						},
					})),
					config: {
						...r.config,
						dias:
							r.motor === "DIAS_SEMANA" ||
							(r.motor === "RANGO" && r.config.dias.length > 0)
								? r.config.dias
								: undefined,
						desde: r.motor === "RANGO" ? r.config.desde : undefined,
						hasta: r.motor === "RANGO" ? r.config.hasta : undefined,
						fechas:
							r.motor === "FECHAS_PUNTUALES" ? r.config.fechas : undefined,
					},
				})),
			},
			{
				onSuccess: () => {
					setReglas([createEmptyRule()]);
					onOpenChange(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full sm:max-w-[95vw] lg:max-w-[1200px] max-h-[96vh] rounded-[2rem] p-0 border-none shadow-2xl flex flex-col overflow-hidden bg-white">
				<GenericForm<TipoTarifaInput>
					schema={TipoTarifaInputSchema}
					onSubmit={handleCreate}
					formClassName="flex-1 flex flex-col overflow-hidden"
				>
					{({ methods, isSubmitting }) => {
						const currentNombre = methods.watch("nombre");
						const isReady =
							currentNombre &&
							reglas.length > 0 &&
							reglas.every((r) => {
								let motorOk = false;
								if (r.motor === "DIAS_SEMANA")
									motorOk = r.config.dias.length > 0;
								else if (r.motor === "RANGO")
									motorOk = !!(r.config.desde && r.config.hasta);
								else if (r.motor === "FECHAS_PUNTUALES")
									motorOk = r.config.fechas.length > 0;

								if (!motorOk) return false;

								// Validar que los precios obligatorios no estén vacíos
								return r.precios_capacidad.every((p) => {
									if (r.es_paquete_obligatorio) {
										// Si es paquete obligatorio, solo exigimos los de paquete
										return (
											p.precios.paquete_con_priv !== "" &&
											p.precios.paquete_sin_priv !== ""
										);
									}
									// Si no es obligatorio, exigimos los de noche
									return (
										p.precios.noche_con_priv !== "" &&
										p.precios.noche_sin_priv !== ""
									);
								});
							});

						return (
							<>
								<DialogHeader className="p-6 sm:p-8 bg-blue-50/10 shrink-0 border-b border-gray-100">
									<DialogTitle className="text-2xl sm:text-4xl font-black text-[#2C3A2C] flex items-center gap-4">
										<div className="h-12 w-12 sm:h-16 sm:w-16 rounded-3xl bg-blue-100/50 flex items-center justify-center text-blue-600 border-2 border-blue-200">
											<Plus className="h-8 w-8" />
										</div>
										Nueva Tarifa Bungalow
									</DialogTitle>
								</DialogHeader>

								<div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-10 space-y-10 custom-scrollbar">
									<div className="space-y-12">
										{/* Configuración General */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 bg-gray-50/30 p-4 sm:p-6 rounded-3xl border border-gray-100">
											<div className="space-y-6">
												<div className="space-y-2">
													<Label className="text-sm font-bold text-[#4A5D4A]">
														Nombre de la Categoría
													</Label>
													<Input
														placeholder="Ej: Temporada Alta 2026"
														{...methods.register("nombre")}
														className="rounded-2xl h-12 border-gray-100 shadow-sm focus:ring-primary/20 bg-white"
													/>
													{methods.formState.errors.nombre && (
														<p className="text-xs text-red-500 font-bold">
															{methods.formState.errors.nombre.message}
														</p>
													)}
												</div>

												<div className="space-y-2">
													<Label className="text-sm font-bold text-[#4A5D4A]">
														Imagen Principal (Obligatoria para carrusel)
													</Label>
													<InputImage
														id="image_main"
														field={{
															name: "image_main",
															label: "Imagen Principal",
															type: "image",
														}}
														register={methods.register as any}
														control={methods.control as any}
														error={methods.formState.errors.image_main}
													/>
												</div>

												<div className="space-y-4">
													<div className="p-4 rounded-2xl bg-green-50 border border-green-200 shadow-sm flex items-center justify-between">
														<div className="flex gap-3 items-center">
															<div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
																<Badge className="p-0 border-none bg-transparent">
																	<div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
																</Badge>
															</div>
															<div className="flex flex-col">
																<Label className="font-bold text-green-900">
																	Estado Activo
																</Label>
																<span className="text-[10px] text-green-600/70 font-medium">
																	Habilitado por defecto
																</span>
															</div>
														</div>
														<Checkbox
															checked={methods.watch("activo")}
															onCheckedChange={(c) =>
																methods.setValue("activo", !!c)
															}
															className="h-6 w-6 rounded-lg"
														/>
													</div>

													<div className="text-[10px] text-primary bg-blue-50/30 p-4 rounded-2xl border border-blue-100 flex items-center gap-2">
														<Info className="h-4 w-4 shrink-0" />
														<p className="font-medium">
															Las fechas de vigencia se sincronizarán
															automáticamente según los rangos definidos en las
															reglas.
														</p>
													</div>
												</div>

												<div className="text-[10px] text-[#8BA18B] bg-white p-3 rounded-xl border border-gray-100 italic">
													* Esta tarifa se aplicará globalmente según las reglas
													definidas abajo.
												</div>
											</div>
										</div>

										<div className="space-y-6 sm:space-y-8">
											<Card className="p-6 rounded-[2rem] border-2 border-primary/10 bg-primary/5 shadow-sm">
												<div className="flex flex-col gap-4">
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
															<Settings2 className="h-5 w-5" />
														</div>
														<div className="flex flex-col">
															<Label className="text-sm font-black uppercase tracking-widest text-[#2C3A2C]">
																Motor de Cálculo Global
															</Label>
															<p className="text-[10px] text-primary/70 font-bold">
																Afecta a todos los bloques de reglas de esta
																nueva tarifa.
															</p>
														</div>
													</div>
													<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
														{MOTORES.map((m) => (
															<button
																key={m.id}
																type="button"
																onClick={() => updateGlobalMotor(m.id as any)}
																className={`flex items-center gap-3 p-3 rounded-2xl transition-all border-2 text-left ${
																	reglas[0]?.motor === m.id
																		? "bg-white border-primary text-primary shadow-md scale-[1.02]"
																		: "bg-white/50 border-gray-100 text-gray-400 hover:border-gray-200"
																}`}
															>
																<m.icon className="h-4 w-4 shrink-0" />
																<span className="font-bold text-xs sm:text-sm">
																	{m.label}
																</span>
															</button>
														))}
													</div>
												</div>
											</Card>

											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
												<div>
													<h3 className="text-xl sm:text-2xl font-black text-[#2C3A2C]">
														Bloques de Reglas
													</h3>
													<p className="text-sm text-[#8BA18B] font-medium">
														Configura los precios específicos para cada grupo de
														días/fechas.
													</p>
												</div>
												<Button
													type="button"
													onClick={addRule}
													variant="outline"
													className="rounded-2xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 h-14 px-6 font-bold w-full sm:w-auto"
												>
													<Plus className="h-5 w-5 mr-2" />
													Agregar Nuevo Bloque
												</Button>
											</div>

											<div className="space-y-8 sm:space-y-12">
												{reglas.map((rule, rIdx) => (
													<Card
														key={rIdx}
														className="rounded-[1.5rem] sm:rounded-[2.5rem] border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden bg-white border-2"
													>
														<div className="bg-primary/5 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100">
															<div className="flex items-center gap-4 w-full sm:w-auto">
																<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white border-2 border-primary/20 flex items-center justify-center font-black text-primary text-lg sm:text-xl shadow-sm shrink-0">
																	{rIdx + 1}
																</div>
																<div className="flex-1 sm:flex-none">
																	<Input
																		value={rule.nombre}
																		onChange={(e) =>
																			updateRule(rIdx, {
																				nombre: e.target.value,
																			})
																		}
																		className="bg-transparent border-none font-black text-lg sm:text-xl text-[#2C3A2C] focus-visible:ring-0 p-0 h-auto w-full min-w-[150px]"
																	/>
																	<div className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest">
																		Configuración del Motor{" "}
																		<Settings2 className="h-3 w-3" />
																	</div>
																</div>
															</div>
															<div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
																<div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
																	<Label className="text-[10px] font-black uppercase tracking-tighter pl-1 sm:pl-2">
																		Paquete Inv.
																	</Label>
																	<Checkbox
																		checked={rule.es_paquete_obligatorio}
																		onCheckedChange={(c) =>
																			updateRule(rIdx, {
																				es_paquete_obligatorio: !!c,
																			})
																		}
																		className="h-5 w-5 rounded-md"
																	/>
																</div>
																{reglas.length > 1 && (
																	<Button
																		variant="ghost"
																		size="icon"
																		type="button"
																		onClick={() => removeRule(rIdx)}
																		className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl h-10 w-10 sm:h-12 sm:w-12 shrink-0"
																	>
																		<Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
																	</Button>
																)}
															</div>
														</div>

														<div className="p-4 sm:p-8">
															<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
																<div className="lg:col-span-4 space-y-6 sm:space-y-8">
																	{/* Configuración */}

																	<div className="h-[2px] bg-gray-50 w-full" />

																	<div className="space-y-4 animate-in fade-in slide-in-from-top-2">
																		{rule.motor === "DIAS_SEMANA" && (
																			<div className="space-y-4">
																				<Label className="text-xs font-black uppercase tracking-wider text-primary">
																					Días Aplicables
																				</Label>
																				<div className="flex flex-wrap gap-3">
																					{DIAS.map((dia) => {
																						const isOcupado = reglas.some(
																							(r, i) =>
																								i !== rIdx &&
																								r.config.dias.includes(dia.id),
																						);
																						const isSelected =
																							rule.config.dias.includes(dia.id);

																						return (
																							<button
																								key={dia.id}
																								type="button"
																								disabled={
																									dia.disabled || isOcupado
																								}
																								onClick={() =>
																									toggleDiaInRule(rIdx, dia.id)
																								}
																								className={`h-11 px-4 rounded-xl flex items-center justify-center font-black text-sm transition-all shadow-sm border-2 ${
																									isSelected
																										? "bg-primary border-primary text-white scale-105"
																										: dia.disabled || isOcupado
																											? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
																											: "bg-white text-[#8BA18B] border-gray-100 hover:border-primary/30"
																								}`}
																								title={
																									dia.disabled
																										? "No disponible"
																										: isOcupado
																											? "Ya seleccionado en otro bloque"
																											: dia.label
																								}
																							>
																								{isOcupado && (
																									<Info className="h-3 w-3 mr-1.5 opacity-50" />
																								)}
																								{dia.label}
																							</button>
																						);
																					})}
																				</div>
																			</div>
																		)}

																		{rule.motor === "RANGO" && (
																			<div className="space-y-4">
																				<Label className="text-xs font-black uppercase tracking-wider text-primary">
																					Período del Rango
																				</Label>
																				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
																					<div className="space-y-2">
																						<Label className="text-[10px] font-bold">
																							Desde
																						</Label>
																						<Input
																							type="date"
																							value={rule.config.desde}
																							onChange={(e) =>
																								updateRule(rIdx, {
																									config: {
																										...rule.config,
																										desde: e.target.value,
																									},
																								})
																							}
																							className="rounded-xl border-gray-100"
																						/>
																					</div>
																					<div className="space-y-2">
																						<Label className="text-[10px] font-bold">
																							Hasta
																						</Label>
																						<Input
																							type="date"
																							value={rule.config.hasta}
																							onChange={(e) =>
																								updateRule(rIdx, {
																									config: {
																										...rule.config,
																										hasta: e.target.value,
																									},
																								})
																							}
																							className="rounded-xl border-gray-100"
																						/>
																					</div>
																				</div>
																				<div className="mt-4 pt-4 border-t border-gray-50">
																					<Label className="text-[10px] font-bold block mb-2 opacity-60 italic">
																						Opcional: Filtrar días en rango
																					</Label>
																					<div className="flex flex-wrap gap-1.5">
																						{DIAS.map((dia) => (
																							<button
																								key={dia.id}
																								type="button"
																								disabled={dia.disabled}
																								onClick={() =>
																									toggleDiaInRule(rIdx, dia.id)
																								}
																								className={`h-8 px-2 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all border ${
																									rule.config.dias.includes(
																										dia.id,
																									)
																										? "bg-primary/20 border-primary text-primary"
																										: dia.disabled
																											? "bg-gray-100 text-gray-200 border-gray-100 cursor-not-allowed"
																											: "bg-gray-50 text-gray-300 border-gray-100"
																								}`}
																								title={
																									dia.disabled
																										? "No disponible"
																										: dia.label
																								}
																							>
																								{dia.short}
																							</button>
																						))}
																					</div>
																				</div>
																			</div>
																		)}

																		{rule.motor === "FECHAS_PUNTUALES" && (
																			<div className="space-y-4">
																				<Label className="text-xs font-black uppercase tracking-wider text-primary">
																					Fechas del Evento
																				</Label>
																				<div className="space-y-3">
																					<div className="flex gap-2">
																						<Input
																							type="date"
																							id={`date-picker-${rIdx}`}
																							className="rounded-xl border-gray-100"
																						/>
																						<Button
																							variant="outline"
																							type="button"
																							onClick={() => {
																								const input =
																									document.getElementById(
																										`date-picker-${rIdx}`,
																									) as HTMLInputElement;
																								if (
																									input.value &&
																									!rule.config.fechas.includes(
																										input.value,
																									)
																								) {
																									updateRule(rIdx, {
																										config: {
																											...rule.config,
																											fechas: [
																												...rule.config.fechas,
																												input.value,
																											].sort(),
																										},
																									});
																									input.value = "";
																								}
																							}}
																							className="rounded-xl shrink-0"
																						>
																							<Plus className="h-4 w-4" />
																						</Button>
																					</div>
																					<div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1">
																						{rule.config.fechas.length ===
																							0 && (
																							<p className="text-[10px] text-gray-300 italic">
																								No hay fechas seleccionadas...
																							</p>
																						)}
																						{rule.config.fechas.map((f) => (
																							<Badge
																								key={f}
																								className="bg-primary/5 text-primary border-primary/20 rounded-lg px-2 py-1 flex items-center gap-1"
																							>
																								{f}
																								<Trash2
																									className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100 hover:text-red-500"
																									onClick={() =>
																										updateRule(rIdx, {
																											config: {
																												...rule.config,
																												fechas:
																													rule.config.fechas.filter(
																														(x) => x !== f,
																													),
																											},
																										})
																									}
																								/>
																							</Badge>
																						))}
																					</div>
																				</div>
																			</div>
																		)}
																	</div>
																</div>

																{/* Matriz de Precios Card Grid */}
																<div className="lg:col-span-8 flex flex-col min-h-[400px]">
																	<div className="flex items-center justify-between mb-6">
																		<div className="flex flex-col">
																			<Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
																				Matriz de Precios por Capacidad
																				<LayoutGrid className="h-3 w-3" />
																			</Label>
																			<p className="text-[10px] text-[#8BA18B] font-medium">
																				Define los precios base y de paquete
																				para cada bungalow.
																			</p>
																		</div>
																		{rule.es_paquete_obligatorio && (
																			<Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] px-3 py-1 animate-pulse shrink-0 rounded-full">
																				PAQUETE OBLIGATORIO
																			</Badge>
																		)}
																	</div>

																	<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
																		{rule.precios_capacidad.map((p) => (
																			<Card
																				key={p.capacidad}
																				className="rounded-[2rem] border-2 border-gray-100/80 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white group"
																			>
																				<div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
																					<div className="flex items-center gap-3">
																						<div className="h-10 w-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
																							<Users className="h-5 w-5 text-primary" />
																						</div>
																						<div>
																							<p className="text-[10px] font-black uppercase tracking-tighter text-[#8BA18B]">
																								CAPACIDAD
																							</p>
																							<p className="font-black text-xl text-[#2C3A2C] leading-none">
																								{p.capacidad} Pers.
																							</p>
																						</div>
																					</div>
																				</div>

																				<div className="p-4 sm:p-6 space-y-6">
																					{/* Sección Noche */}
																					{!rule.es_paquete_obligatorio && (
																						<div className="space-y-3">
																							<div className="flex items-center gap-2 border-l-4 border-primary pl-2">
																								<span className="text-[10px] font-black uppercase tracking-widest text-[#4A5D4A]">
																									Precios por Noche
																								</span>
																							</div>
																							<div className="grid grid-cols-1 gap-2.5">
																								<div className="relative">
																									<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
																										<Badge className="h-5 p-0 px-1.5 bg-blue-100 text-blue-700 border-none rounded-md flex items-center justify-center">
																											<span className="text-[10px] font-black uppercase tracking-tighter">
																												CON PRIV.
																											</span>
																										</Badge>
																										<DollarSign className="h-3 w-3 text-blue-400" />
																									</div>
																									<Input
																										type="number"
																										step="0.01"
																										value={
																											p.precios.noche_con_priv
																										}
																										onFocus={(e) =>
																											e.target.select()
																										}
																										onChange={(e) =>
																											updatePriceInRule(
																												rIdx,
																												p.capacidad,
																												"noche_con_priv",
																												e.target.value,
																											)
																										}
																										className="h-12 pl-24 rounded-2xl border-gray-100 font-mono font-black text-sm text-blue-900 focus:ring-blue-200 focus:border-blue-400 bg-blue-50/10 shadow-sm"
																									/>
																								</div>
																								<div className="relative">
																									<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
																										<Badge className="h-5 p-0 px-1.5 bg-gray-100 text-gray-500 border-none rounded-md flex items-center justify-center">
																											<span className="text-[10px] font-black uppercase tracking-tighter">
																												SIN PRIV.
																											</span>
																										</Badge>
																										<DollarSign className="h-3 w-3 text-gray-400" />
																									</div>
																									<Input
																										type="number"
																										step="0.01"
																										value={
																											p.precios.noche_sin_priv
																										}
																										onFocus={(e) =>
																											e.target.select()
																										}
																										onChange={(e) =>
																											updatePriceInRule(
																												rIdx,
																												p.capacidad,
																												"noche_sin_priv",
																												e.target.value,
																											)
																										}
																										className="h-12 pl-24 rounded-2xl border-gray-100 font-mono font-black text-sm text-gray-700 focus:ring-gray-200 focus:border-gray-400 bg-gray-50/30 shadow-sm"
																									/>
																								</div>
																							</div>
																						</div>
																					)}

																					{/* Sección Paquete */}
																					<div className="space-y-3 pt-4 border-t border-dashed border-gray-100">
																						<div className="flex items-center gap-2 border-l-4 border-amber-400 pl-2">
																							<span className="text-[10px] font-black uppercase tracking-widest text-[#4A5D4A]">
																								Precios Paquete
																							</span>
																							{!rule.es_paquete_obligatorio && (
																								<Badge className="h-4 p-0 px-1.5 bg-gray-100 text-gray-400 border-none rounded-md font-black text-[8px]">
																									OPCIONAL
																								</Badge>
																							)}
																						</div>
																						<div className="grid grid-cols-1 gap-2.5">
																							<div className="relative">
																								<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
																									<Badge className="h-5 p-0 px-1.5 bg-amber-100 text-amber-700 border-none rounded-md flex items-center justify-center">
																										<span className="text-[10px] font-black uppercase tracking-tighter">
																											CON PRIV
																										</span>
																									</Badge>
																									<DollarSign className="h-3 w-3 text-amber-400" />
																								</div>
																								<Input
																									type="number"
																									step="0.01"
																									value={
																										p.precios.paquete_con_priv
																									}
																									onFocus={(e) =>
																										e.target.select()
																									}
																									onChange={(e) =>
																										updatePriceInRule(
																											rIdx,
																											p.capacidad,
																											"paquete_con_priv",
																											e.target.value,
																										)
																									}
																									className="h-12 pl-24 rounded-2xl border-amber-100 font-mono font-black text-sm text-amber-900 focus:ring-amber-200 focus:border-amber-400 bg-amber-50/10 shadow-sm"
																								/>
																							</div>
																							<div className="relative">
																								<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
																									<Badge className="h-5 p-0 px-1.5 bg-gray-100 text-gray-500 border-none rounded-md flex items-center justify-center">
																										<span className="text-[10px] font-black uppercase tracking-tighter">
																											SIN PRIV
																										</span>
																									</Badge>
																									<DollarSign className="h-3 w-3 text-gray-400" />
																								</div>
																								<Input
																									type="number"
																									step="0.01"
																									value={
																										p.precios.paquete_sin_priv
																									}
																									onFocus={(e) =>
																										e.target.select()
																									}
																									onChange={(e) =>
																										updatePriceInRule(
																											rIdx,
																											p.capacidad,
																											"paquete_sin_priv",
																											e.target.value,
																										)
																									}
																									className="h-12 pl-24 rounded-2xl border-gray-100 font-mono font-black text-sm text-gray-700 focus:ring-gray-200 focus:border-gray-400 bg-gray-50/30 shadow-sm"
																								/>
																							</div>
																						</div>
																					</div>
																				</div>
																			</Card>
																		))}
																	</div>

																	<div className="mt-8 p-4 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
																		<Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
																		<div className="space-y-1">
																			<p className="text-xs font-black text-blue-900 uppercase tracking-tighter">
																				Recordatorio Operativo
																			</p>
																			<p className="text-[10px] text-blue-700 leading-relaxed font-medium">
																				Si el **Paquete es Obligatorio**, el
																				usuario deberá pagar el precio completo
																				del paquete y reservar todas las noches
																				indicadas. Si es opcional, el sistema
																				aplicará el precio paquete solo si el
																				usuario selecciona todas las noches.
																			</p>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</Card>
												))}
											</div>
										</div>
									</div>
								</div>

								<DialogFooter className="p-6 sm:p-10 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center shrink-0">
									<div className="flex-1 hidden sm:block">
										{!isReady && (
											<div className="flex items-center gap-2 text-amber-600 animate-pulse font-bold text-xs uppercase tracking-tighter">
												<Info className="h-4 w-4" />
												Complete todos los campos obligatorios de las reglas
											</div>
										)}
									</div>
									<Button
										variant="outline"
										type="button"
										onClick={() => onOpenChange(false)}
										className="h-14 sm:h-16 rounded-2xl flex-1 font-black text-[#8BA18B] hover:bg-white border-2 border-gray-200 hover:border-gray-300 transition-all order-2 sm:order-1"
									>
										Cancelar
									</Button>
									<Button
										className="h-14 sm:h-16 rounded-2xl flex-[2] text-lg sm:text-xl font-black shadow-xl shadow-primary/30 gap-2 order-1 sm:order-2"
										disabled={!isReady || isSubmitting}
										onClick={methods.handleSubmit(handleCreate)}
									>
										{isSubmitting ? (
											<Loader2 className="h-6 w-6 animate-spin" />
										) : (
											<Plus className="h-6 w-6" />
										)}
										{isSubmitting ? "Creando..." : "Crear Nueva Tarifa"}
									</Button>
								</DialogFooter>
							</>
						);
					}}
				</GenericForm>
			</DialogContent>
		</Dialog>
	);
}
