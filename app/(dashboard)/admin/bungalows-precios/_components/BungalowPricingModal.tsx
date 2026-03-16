"use client";

import {
	CreditCard,
	DollarSign,
	Info,
	Loader2,
	Save,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSyncBungalowTarifas, useTipoTarifas } from "@/hooks/useTarifas";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";

interface BungalowPricingModalProps {
	bungalow: Bungalow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BungalowPricingModal({
	bungalow,
	open,
	onOpenChange,
}: BungalowPricingModalProps) {
	const { data: response, isLoading: loadingTipos } = useTipoTarifas();
	const tipos = useMemo(() => {
		const raw =
			response && !Array.isArray(response)
				? response.results
				: (response as any[]);
		return raw?.filter((t) => t.activo) || [];
	}, [response]);

	const syncMutation = useSyncBungalowTarifas(bungalow.id);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full sm:max-w-[800px] max-h-[95vh] rounded-[2rem] border-none shadow-2xl p-0 flex flex-col overflow-hidden bg-white">
				<DialogHeader className="p-6 sm:p-8 bg-primary/5 shrink-0 border-b border-gray-100">
					<DialogTitle className="text-xl sm:text-3xl font-black text-[#2C3A2C] flex items-center gap-4">
						<div className="h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
							<CreditCard className="h-5 w-5 sm:h-7 sm:w-7" />
						</div>
						Precios Especiales - Bungalow {bungalow.numero}
					</DialogTitle>
					<p className="text-[10px] sm:text-sm text-[#8BA18B] font-medium mt-1">
						Define precios excepcionales que sobrescriben el tarifario general
						para este bungalow.
					</p>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-10 space-y-8 custom-scrollbar">
					<div className="space-y-6">
						{loadingTipos ? (
							<div className="flex flex-col items-center justify-center py-20 gap-4">
								<Loader2 className="h-12 w-12 animate-spin text-primary/40" />
								<p className="text-sm font-bold text-gray-400">
									Cargando categorías...
								</p>
							</div>
						) : (
							<div className="grid gap-6">
								{tipos?.map((tipo) => (
									<CategoryPricingRow
										key={tipo.id}
										tipo={tipo}
										bungalow={bungalow}
										onSync={(data) => syncMutation.mutate(data)}
										isSyncing={syncMutation.isPending}
									/>
								))}

								{tipos.length === 0 && (
									<div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
										<p className="text-gray-400 font-medium">
											No hay categorías activas disponibles.
										</p>
									</div>
								)}
							</div>
						)}

						<div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100">
							<Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
							<p className="text-[10px] sm:text-[11px] text-amber-700 leading-relaxed font-medium">
								Los sobrescritos aquí definidos se aplican a todas las reglas
								(días de semana, rangos, etc.) dentro de la categoría
								seleccionada. Si dejas el campo vacío, se usará el precio base
								según la capacidad del bungalow ({bungalow.capacidad} personas).
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function CategoryPricingRow({
	tipo,
	bungalow,
	onSync,
	isSyncing,
}: {
	tipo: any;
	bungalow: any;
	onSync: (data: any) => void;
	isSyncing: boolean;
}) {
	const existingOverride = bungalow.tarifas?.find(
		(t: any) => t.tipo_tarifa === tipo.id,
	);

	const [precioCon, setPrecioCon] = useState(
		existingOverride?.precios_override?.noche_con_priv &&
			existingOverride?.precios_override?.noche_con_priv !== 0
			? existingOverride.precios_override.noche_con_priv.toString()
			: "",
	);
	const [precioSin, setPrecioSin] = useState(
		existingOverride?.precios_override?.noche_sin_priv &&
			existingOverride?.precios_override?.noche_sin_priv !== 0
			? existingOverride.precios_override.noche_sin_priv.toString()
			: "",
	);

	const hasChanges = useMemo(() => {
		const oldCon =
			existingOverride?.precios_override?.noche_con_priv?.toString() || "";
		const oldSin =
			existingOverride?.precios_override?.noche_sin_priv?.toString() || "";
		return precioCon !== oldCon || precioSin !== oldSin;
	}, [precioCon, precioSin, existingOverride]);

	const handleSave = () => {
		onSync({
			tipo_tarifa_id: tipo.id,
			precio_con_privilegio:
				precioCon === "" ? 0 : Number.parseFloat(precioCon),
			precio_sin_privilegio:
				precioSin === "" ? 0 : Number.parseFloat(precioSin),
		});
	};

	return (
		<Card className="border-gray-100 shadow-sm hover:border-primary/20 transition-all bg-white rounded-[2rem] overflow-hidden group">
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-4">
						<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
							<TrendingUp className="h-5 w-5" />
						</div>
						<div>
							<h4 className="font-black text-[#2C3A2C] tracking-tight">
								{tipo.nombre}
							</h4>
							<div className="flex items-center gap-2 mt-0.5">
								<Badge
									variant="outline"
									className="text-[9px] font-bold bg-white px-2 py-0 border-gray-200"
								>
									CATEGORÍA
								</Badge>
								{existingOverride && (
									<Badge className="bg-green-100 text-green-700 text-[9px] font-bold border-none px-2 py-0">
										SOBREESCRITO ACTIVO
									</Badge>
								)}
							</div>
						</div>
					</div>

					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSyncing || !hasChanges}
						className="h-10 px-6 rounded-xl shadow-lg shadow-primary/20 text-xs font-black transition-all hover:scale-105"
					>
						{isSyncing ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						{existingOverride ? "Actualizar" : "Asignar"}
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-[1.5rem] border border-gray-100">
					<div className="space-y-2">
						<Label className="text-[10px] uppercase font-black text-[#4A5D4A] flex items-center gap-2 pl-1 mb-1">
							<Badge className="h-4 p-0 px-1.5 bg-blue-100 text-blue-700 border-none rounded-md font-black text-[8px]">
								C/ PRIV
							</Badge>
							Con Privilegio
						</Label>
						<div className="relative group/input">
							<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400 pointer-events-none" />
							<Input
								type="number"
								step="0.01"
								value={precioCon}
								onFocus={(e) => e.target.select()}
								onChange={(e) => setPrecioCon(e.target.value)}
								className="h-11 pl-9 bg-white rounded-xl border-gray-100 focus-visible:ring-blue-200 font-mono font-black text-sm text-blue-900 shadow-sm"
								placeholder="0.00"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label className="text-[10px] uppercase font-black text-[#4A5D4A] flex items-center gap-2 pl-1 mb-1">
							<Badge className="h-4 p-0 px-1.5 bg-gray-100 text-gray-500 border-none rounded-md font-black text-[8px]">
								S/ PRIV
							</Badge>
							Sin Privilegio
						</Label>
						<div className="relative group/input">
							<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
							<Input
								type="number"
								step="0.01"
								value={precioSin}
								onFocus={(e) => e.target.select()}
								onChange={(e) => setPrecioSin(e.target.value)}
								className="h-11 pl-9 bg-white rounded-xl border-gray-100 focus-visible:ring-gray-200 font-mono font-black text-sm text-gray-700 shadow-sm"
								placeholder="0.00"
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
