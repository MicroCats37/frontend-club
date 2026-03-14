"use client";

import { useState, useMemo, useEffect } from "react";
import { useCreateTipoTarifa } from "@/hooks/useTarifas";
import { useBungalowPricingList } from "@/hooks/useBungalows";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	Loader2, 
	Plus, 
	Calendar, 
	Trash2, 
	LayoutGrid, 
	Users, 
	DollarSign,
	Clock
} from "lucide-react";

interface TipoTarifaCreateModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DIAS = [
	{ id: 1, label: "L" },
	{ id: 2, label: "M" },
	{ id: 3, label: "X" },
	{ id: 4, label: "J" },
	{ id: 5, label: "V" },
	{ id: 6, label: "S" },
	{ id: 7, label: "D" },
];

interface PricingItem {
	capacidad: number;
	precio_con_privilegio: number;
	precio_sin_privilegio: number;
}

interface RuleState {
	dias_semana: number[];
	precios_base: PricingItem[];
}

export function TipoTarifaCreateModal({
	open,
	onOpenChange,
}: TipoTarifaCreateModalProps) {
	const createMutation = useCreateTipoTarifa();
	const { data: bungalows } = useBungalowPricingList();

	const capacities = useMemo(() => {
		if (!bungalows) return [];
		const caps = new Set(bungalows.map(b => b.capacidad));
		return Array.from(caps).sort((a, b) => a - b);
	}, [bungalows]);

	const [nombre, setNombre] = useState("");
	const [esTemporal, setEsTemporal] = useState(false);
	const [esPaquete, setEsPaquete] = useState(false);
	const [activo, setActivo] = useState(true);
	const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split("T")[0]);
	const [fechaFin, setFechaFin] = useState("");

	const [reglas, setReglas] = useState<RuleState[]>([
		{ 
			dias_semana: [], 
			precios_base: []
		}
	]);

	// Inicializar precios base cuando se cargan las capacidades
	useEffect(() => {
		if (capacities.length > 0 && reglas[0].precios_base.length === 0) {
			setReglas([
				{ 
					dias_semana: [], 
					precios_base: capacities.map(c => ({ capacidad: c, precio_con_privilegio: 0, precio_sin_privilegio: 0 }))
				}
			]);
		}
	}, [capacities]);

	const addRule = () => {
		setReglas([...reglas, { 
			dias_semana: [],
			precios_base: capacities.map(c => ({ capacidad: c, precio_con_privilegio: 0, precio_sin_privilegio: 0 }))
		}]);
	};

	const removeRule = (index: number) => {
		setReglas(reglas.filter((_, i) => i !== index));
	};

	const updateRule = (index: number, updates: Partial<RuleState>) => {
		setReglas(reglas.map((r, i) => i === index ? { ...r, ...updates } : r));
	};

	const toggleDiaInRule = (ruleIndex: number, dayId: number) => {
		const rule = reglas[ruleIndex];
		const newDays = rule.dias_semana.includes(dayId)
			? rule.dias_semana.filter(d => d !== dayId)
			: [...rule.dias_semana, dayId];
		updateRule(ruleIndex, { dias_semana: newDays });
	};

	const updatePriceInRule = (ruleIndex: number, capacity: number, field: 'precio_con_privilegio' | 'precio_sin_privilegio', value: string) => {
		const numValue = parseFloat(value) || 0;
		const rule = reglas[ruleIndex];
		const newPrices = rule.precios_base.map(p => 
			p.capacidad === capacity ? { ...p, [field]: numValue } : p
		);
		updateRule(ruleIndex, { precios_base: newPrices });
	};

	const handleCreate = () => {
		createMutation.mutate({
			nombre,
			es_temporal: esTemporal,
			es_paquete: esPaquete,
			activo,
			reglas: reglas.map(r => ({
				dias_semana: r.dias_semana,
				precios_base: r.precios_base
			})),
			fecha_inicio: fechaInicio,
			fecha_fin: fechaFin || undefined,
		}, {
			onSuccess: () => {
				setNombre("");
				setEsTemporal(false);
				setEsPaquete(false);
				setActivo(true);
				setFechaInicio(new Date().toISOString().split("T")[0]);
				setFechaFin("");
				setReglas([{ 
					dias_semana: [], 
					precios_base: capacities.map(c => ({ capacidad: c, precio_con_privilegio: 0, precio_sin_privilegio: 0 }))
				}]);
				onOpenChange(false);
			}
		});
	};

	const isReady = nombre && reglas.length > 0 && reglas.every(r => r.dias_semana.length > 0) && (!esTemporal || fechaFin);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
				<DialogHeader className="p-8 bg-primary/5">
					<DialogTitle className="text-3xl font-black text-[#2C3A2C] flex items-center gap-3">
						<div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
							<LayoutGrid className="h-6 w-6" />
						</div>
						Nueva Categoría de Tarifa
					</DialogTitle>
				</DialogHeader>

				<div className="p-8 space-y-8">
					{/* Configuración General */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div className="space-y-2">
								<Label className="text-sm font-bold text-[#4A5D4A]">Nombre de la Categoría</Label>
								<Input
									placeholder="Ej: Temporada Alta 2026"
									value={nombre}
									onChange={(e) => setNombre(e.target.value)}
									className="rounded-2xl h-12 border-gray-100 shadow-sm focus:ring-primary/20"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs font-bold text-[#4A5D4A]">Fecha Inicio</Label>
									<Input 
										type="date" 
										value={fechaInicio} 
										onChange={(e) => setFechaInicio(e.target.value)}
										className="rounded-xl h-10 border-gray-100"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs font-bold text-[#4A5D4A]">Fecha Fin</Label>
									<Input 
										type="date" 
										value={fechaFin} 
										onChange={(e) => setFechaFin(e.target.value)}
										className="rounded-xl h-10 border-gray-100"
										required={esTemporal}
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${activo ? "bg-green-50 border-green-200" : "bg-gray-50/50 border-gray-100"}`}>
								<div className="flex gap-3 items-center">
									<div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activo ? "bg-green-100 text-green-600" : "bg-white text-gray-400"}`}>
										<Badge className="p-0 border-none bg-transparent">
											<div className={`h-2 w-2 rounded-full ${activo ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
										</Badge>
									</div>
									<div className="flex flex-col">
										<Label className={`font-bold ${activo ? "text-green-900" : "text-gray-700"}`}>Categoría Activa</Label>
										<span className="text-[10px] text-green-600/70">Visible para el sistema</span>
									</div>
								</div>
								<Checkbox checked={activo} onCheckedChange={(c) => setActivo(!!c)} />
							</div>

							<div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${esTemporal ? "bg-orange-50 border-orange-200" : "bg-gray-50/50 border-gray-100"}`}>
								<div className="flex gap-3 items-center">
									<div className={`h-10 w-10 rounded-xl flex items-center justify-center ${esTemporal ? "bg-orange-100 text-orange-600" : "bg-white text-gray-400"}`}>
										<Clock className="h-5 w-5" />
									</div>
									<div className="flex flex-col">
										<Label className={`font-bold ${esTemporal ? "text-orange-900" : "text-gray-700"}`}>¿Es Temporal?</Label>
										<span className="text-[10px] text-orange-600/70">Requiere fecha de fin</span>
									</div>
								</div>
								<Checkbox checked={esTemporal} onCheckedChange={(c) => setEsTemporal(!!c)} />
							</div>

							<div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${esPaquete ? "bg-amber-50 border-amber-200" : "bg-gray-50/50 border-gray-100"}`}>
								<div className="flex gap-3 items-center">
									<div className={`h-10 w-10 rounded-xl flex items-center justify-center ${esPaquete ? "bg-amber-100 text-amber-600" : "bg-white text-gray-400"}`}>
										<LayoutGrid className="h-5 w-5" />
									</div>
									<div className="flex flex-col">
										<Label className={`font-bold ${esPaquete ? "text-amber-900" : "text-gray-700"}`}>¿Es Paquete?</Label>
										<span className="text-[10px] text-amber-600/70">Mínimo de noches obligatorio</span>
									</div>
								</div>
								<Checkbox checked={esPaquete} onCheckedChange={(c) => setEsPaquete(!!c)} />
							</div>
						</div>
					</div>

					<div className="border-t border-gray-100 pt-8">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-xl font-black text-[#2C3A2C]">Bloques de Días y Precios</h3>
								<p className="text-sm text-[#8BA18B]">Define los días de la semana y sus precios base.</p>
							</div>
							<Button 
								type="button" 
								onClick={addRule}
								variant="outline"
								className="rounded-xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/30 py-6 px-6"
							>
								<Plus className="h-5 w-5 mr-2" />
								Agregar Bloque
							</Button>
						</div>

						<div className="space-y-6">
							{reglas.map((rule, bIdx) => (
								<Card key={bIdx} className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
									<div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
										<div className="flex items-center gap-4 flex-1">
											<div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-primary">
												{bIdx + 1}
											</div>
											<div className="font-bold text-[#4A5D4A]">
												Configuración de Días
											</div>
										</div>
										{reglas.length > 1 && (
											<Button 
												variant="ghost" 
												size="icon" 
												onClick={() => removeRule(bIdx)}
												className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
											>
												<Trash2 className="h-5 w-5" />
											</Button>
										)}
									</div>
									
									<div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
										<div className="lg:col-span-4 space-y-4">
											<Label className="text-xs font-black uppercase tracking-wider text-[#8BA18B]">Días del Bloque</Label>
											<div className="flex flex-wrap gap-2">
												{DIAS.map((dia) => (
													<button
														key={dia.id}
														type="button"
														onClick={() => toggleDiaInRule(bIdx, dia.id)}
														className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${rule.dias_semana.includes(dia.id)
															? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
															: "bg-white text-[#8BA18B] border border-[#E0E7E0] hover:border-primary/30"
															}`}
													>
														{dia.label}
													</button>
												))}
											</div>
										</div>

										<div className="lg:col-span-8">
											<Label className="text-xs font-black uppercase tracking-wider text-[#8BA18B] mb-4 block">Tabla de Precios Sincronizada</Label>
											<div className="bg-gray-50/30 rounded-2xl border border-gray-100 overflow-hidden">
												<table className="w-full text-sm">
													<thead>
														<tr className="bg-gray-50 text-[#4A5D4A] border-b border-gray-100">
															<th className="py-3 px-4 text-left font-black">Personas</th>
															<th className="py-3 px-4 text-left font-black">Con Priv.</th>
															<th className="py-3 px-4 text-left font-black">Sin Priv. (General)</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-gray-100">
														{rule.precios_base.map((p) => (
															<tr key={p.capacidad} className="hover:bg-white transition-colors">
																<td className="py-3 px-4">
																	<div className="flex items-center gap-2">
																		<Users className="h-3 w-3 text-[#8BA18B]" />
																		<span className="font-bold text-[#2C3A2C]">{p.capacidad}</span>
																	</div>
																</td>
																<td className="py-3 px-4">
																	<div className="relative">
																		<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8BA18B]">S/</span>
																		<Input 
																			type="number" 
																			step="0.01"
																			value={p.precio_con_privilegio}
																			onChange={(e) => updatePriceInRule(bIdx, p.capacidad, 'precio_con_privilegio', e.target.value)}
																			className="h-9 pl-7 rounded-lg border-gray-100 bg-white font-mono font-bold"
																		/>
																	</div>
																</td>
																<td className="py-3 px-4">
																	<div className="relative">
																		<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8BA18B]">S/</span>
																		<Input 
																			type="number" 
																			step="0.01"
																			value={p.precio_sin_privilegio}
																			onChange={(e) => updatePriceInRule(bIdx, p.capacidad, 'precio_sin_privilegio', e.target.value)}
																			className="h-9 pl-7 rounded-lg border-gray-100 bg-white font-mono font-bold"
																		/>
																	</div>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="h-14 rounded-2xl flex-1 font-bold text-[#8BA18B]"
					>
						Cancelar
					</Button>
					<Button
						className="h-14 rounded-2xl flex-[2] text-lg font-black shadow-xl shadow-primary/30"
						disabled={!isReady || createMutation.isPending}
						onClick={handleCreate}
					>
						{createMutation.isPending ? (
							<Loader2 className="h-6 w-6 animate-spin mr-2" />
						) : (
							<Calendar className="h-6 w-6 mr-2" />
						)}
						{createMutation.isPending ? "Configurando..." : "Crear Categoría y Sincronizar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
