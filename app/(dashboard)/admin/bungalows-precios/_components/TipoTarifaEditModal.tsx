"use client";

import { useState, useEffect, useMemo } from "react";
import { useUpdateTipoTarifa, type TipoTarifa } from "@/hooks/useTarifas";
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
	Save, 
	Calendar, 
	Trash2, 
	Plus,
	LayoutGrid, 
	Users, 
	Clock
} from "lucide-react";

interface TipoTarifaEditModalProps {
	tipo: TipoTarifa | null;
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
	id?: string;
	dias_semana: number[];
	precios_base: PricingItem[];
}

export function TipoTarifaEditModal({
	tipo,
	open,
	onOpenChange,
}: TipoTarifaEditModalProps) {
	const updateMutation = useUpdateTipoTarifa();
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
	const [fechaInicio, setFechaInicio] = useState("");
	const [fechaFin, setFechaFin] = useState("");
	const [reglas, setReglas] = useState<RuleState[]>([]);

	useEffect(() => {
		if (tipo && open) {
			setNombre(tipo.nombre);
			setEsTemporal(tipo.es_temporal);
			setEsPaquete(tipo.es_paquete);
			setActivo(tipo.activo);
			setFechaInicio(tipo.fecha_inicio);
			setFechaFin(tipo.fecha_fin || "");
			
			setReglas((tipo.reglas || []).map(r => ({
				id: r.id,
				dias_semana: r.dias_semana,
				precios_base: capacities.map(c => ({ 
					capacidad: c, 
					precio_con_privilegio: 0, 
					precio_sin_privilegio: 0 
				}))
			})));
		}
	}, [tipo, open, capacities]);

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

	const handleUpdate = () => {
		if (!tipo) return;

		updateMutation.mutate({
			id: tipo.id,
			data: {
				nombre,
				es_temporal: esTemporal,
				es_paquete: esPaquete,
				activo,
				reglas: reglas.map(r => ({
					dias_semana: r.dias_semana,
					precios_base: r.precios_base
				})),
				fecha_inicio: fechaInicio,
				fecha_fin: fechaFin || null,
			},
		}, {
			onSuccess: () => {
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
						<div className="h-12 w-12 rounded-2xl bg-white border border-primary/20 flex items-center justify-center text-primary">
							<Calendar className="h-6 w-6" />
						</div>
						Editar Categoría de Tarifa
					</DialogTitle>
				</DialogHeader>

				<div className="p-8 space-y-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div className="space-y-2">
								<Label className="text-sm font-bold text-[#4A5D4A]">Nombre de la Categoría</Label>
								<Input
									value={nombre}
									onChange={(e) => setNombre(e.target.value)}
									className="rounded-2xl h-12 border-gray-100 shadow-sm"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs font-bold text-[#4A5D4A]">Fecha Inicio</Label>
									<Input 
										type="date" 
										value={fechaInicio} 
										onChange={(e) => setFechaInicio(e.target.value)}
										className="rounded-xl h-10"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs font-bold text-[#4A5D4A]">Fecha Fin</Label>
									<Input 
										type="date" 
										value={fechaFin} 
										onChange={(e) => setFechaFin(e.target.value)}
										className="rounded-xl h-10"
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
									<Label className="font-bold">¿Es Temporal?</Label>
								</div>
								<Checkbox checked={esTemporal} onCheckedChange={(c) => setEsTemporal(!!c)} />
							</div>

							<div className={`p-4 rounded-2xl border flex items-center justify-between ${esPaquete ? "bg-amber-50 border-amber-200" : "bg-gray-50/50 border-gray-100"}`}>
								<div className="flex gap-3 items-center">
									<div className={`h-10 w-10 rounded-xl flex items-center justify-center ${esPaquete ? "bg-amber-100 text-amber-600" : "bg-white text-gray-400"}`}>
										<LayoutGrid className="h-5 w-5" />
									</div>
									<Label className="font-bold">¿Es Paquete?</Label>
								</div>
								<Checkbox checked={esPaquete} onCheckedChange={(c) => setEsPaquete(!!c)} />
							</div>
						</div>
					</div>

					<div className="border-t border-gray-100 pt-8">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-xl font-black text-[#2C3A2C]">Bloques y Precios</h3>
								<p className="text-sm text-[#8BA18B]">Se sincronizarán precios al guardar.</p>
							</div>
							<Button 
								type="button" 
								onClick={addRule}
								variant="outline"
								className="rounded-xl"
							>
								<Plus className="h-4 w-4 mr-2" />
								Agregar Bloque
							</Button>
						</div>

						<div className="space-y-6">
							{reglas.map((rule, bIdx) => (
								<Card key={bIdx} className="rounded-3xl border-gray-100 overflow-hidden">
									<div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
										<div className="flex items-center gap-4 flex-1">
											<div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-primary">
												{bIdx + 1}
											</div>
											<div className="font-bold text-[#4A5D4A]">
												Configuración de Días
											</div>
										</div>
										<Button 
											variant="ghost" 
											size="icon" 
											onClick={() => removeRule(bIdx)}
											className="text-red-400 hover:text-red-600 rounded-xl"
										>
											<Trash2 className="h-5 w-5" />
										</Button>
									</div>
									
									<div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
										<div className="lg:col-span-4 space-y-4">
											<Label className="text-xs font-black uppercase text-[#8BA18B]">Días del Bloque</Label>
											<div className="flex flex-wrap gap-2">
												{DIAS.map((dia) => (
													<button
														key={dia.id}
														type="button"
														onClick={() => toggleDiaInRule(bIdx, dia.id)}
														className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${rule.dias_semana.includes(dia.id)
															? "bg-primary text-white shadow-lg"
															: "bg-white text-[#8BA18B] border border-[#E0E7E0]"
															}`}
													>
														{dia.label}
													</button>
												))}
											</div>
										</div>

										<div className="lg:col-span-8">
											<Label className="text-xs font-black uppercase text-[#8BA18B] mb-4 block">Tabla de Precios (Sobrescribir)</Label>
											<div className="bg-gray-50/30 rounded-2xl border border-gray-100 overflow-hidden">
												<table className="w-full text-sm">
													<thead>
														<tr className="bg-gray-50 text-[#4A5D4A] border-b border-gray-100">
															<th className="py-3 px-4 text-left font-black">Personas</th>
															<th className="py-3 px-4 text-left font-black">Con Priv.</th>
															<th className="py-3 px-4 text-left font-black">Sin Priv.</th>
														</tr>
													</thead>
													<tbody className="divide-y divide-gray-100">
														{rule.precios_base.map((p) => (
															<tr key={p.capacidad} className="hover:bg-white transition-colors">
																<td className="py-3 px-4 font-bold">{p.capacidad}</td>
																<td className="py-3 px-4">
																	<Input 
																		type="number" 
																		step="0.01"
																		value={p.precio_con_privilegio}
																		onChange={(e) => updatePriceInRule(bIdx, p.capacidad, 'precio_con_privilegio', e.target.value)}
																		className="h-9 rounded-lg"
																	/>
																</td>
																<td className="py-3 px-4">
																	<Input 
																		type="number" 
																		step="0.01"
																		value={p.precio_sin_privilegio}
																		onChange={(e) => updatePriceInRule(bIdx, p.capacidad, 'precio_sin_privilegio', e.target.value)}
																		className="h-9 rounded-lg"
																	/>
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
						className="h-14 rounded-2xl flex-[2] text-lg font-black shadow-xl"
						disabled={!isReady || updateMutation.isPending}
						onClick={handleUpdate}
					>
						{updateMutation.isPending ? (
							<Loader2 className="h-6 w-6 animate-spin mr-2" />
						) : (
							<Save className="h-6 w-6 mr-2" />
						)}
						{updateMutation.isPending ? "Actualizando..." : "Guardar y Sincronizar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
