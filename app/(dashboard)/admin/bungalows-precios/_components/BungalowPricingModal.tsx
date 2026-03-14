"use client";

import { useState } from "react";
import { type Bungalow, type TarifaBungalow } from "@/schemas/alojamiento/bungalow";
import { useTipoTarifas, useSyncBungalowTarifas } from "@/hooks/useTarifas";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CreditCard, UserCheck, Users } from "lucide-react";

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
	const tipos = response && !Array.isArray(response) ? response.results : (response as any[]);
	const syncMutation = useSyncBungalowTarifas(bungalow.id);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5 text-primary" />
						Gestión de Precios - Bungalow {bungalow.numero}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{loadingTipos ? (
						<div className="flex justify-center p-8">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid gap-6">
							{tipos?.filter(t => t.activo).map((tipo) => (
								<div key={tipo.id} className="space-y-3">
									<div className="flex items-center gap-3 px-2">
										<div className="h-1 w-1 rounded-full bg-primary" />
										<h4 className="font-black text-[#2C3A2C] uppercase tracking-wider text-sm">
											{tipo.nombre}
										</h4>
										<div className="h-[1px] flex-1 bg-gray-100" />
									</div>
									
									<div className="grid gap-3 pl-4 border-l-2 border-primary/5">
										{tipo.reglas?.map((regla: any, idx: number) => (
											<TariffRow
												key={regla.id}
												tipo={tipo}
												regla={regla}
												reglaIdx={idx}
												bungalow={bungalow}
												onSync={(data) => syncMutation.mutate(data)}
												isSyncing={syncMutation.isPending}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

const DIAS_LABELS: Record<number, string> = {
	1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 7: "D"
};

function TariffRow({
	tipo,
	regla,
	reglaIdx,
	bungalow,
	onSync,
	isSyncing,
}: {
	tipo: any;
	regla: any;
	reglaIdx: number;
	bungalow: Bungalow;
	onSync: (data: any) => void;
	isSyncing: boolean;
}) {
	// Buscar si ya tiene tarifas para esta regla específica (dias_tarifa_id)
	const tarifaCon = bungalow.tarifas?.find(
		(t) => t.dias_tarifa_id === regla.id && t.con_privilegio,
	);
	const tarifaSin = bungalow.tarifas?.find(
		(t) => t.dias_tarifa_id === regla.id && !t.con_privilegio,
	);

	const [precioCon, setPrecioCon] = useState(tarifaCon?.precio?.toString() || "");
	const [precioSin, setPrecioSin] = useState(tarifaSin?.precio?.toString() || "");

	const handleSave = () => {
		onSync({
			dias_tarifa_id: regla.id,
			precio_con_privilegio: Number.parseFloat(precioCon),
			precio_sin_privilegio: Number.parseFloat(precioSin),
		});
	};

	return (
		<Card className="border-gray-100 shadow-none hover:border-primary/20 transition-all bg-[#FBFCFB]/50 rounded-2xl group overflow-hidden">
			<CardContent className="p-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
					<div className="flex items-center gap-3">
						<div className="flex gap-0.5">
							{[1, 2, 3, 4, 5, 6, 7].map((d) => (
								<span 
									key={d} 
									className={`text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-[4px] transition-colors ${regla.dias_semana.includes(d) ? "bg-primary text-white" : "bg-gray-100 text-gray-300"}`}
								>
									{DIAS_LABELS[d]}
								</span>
							))}
						</div>
						<div className="hidden sm:block h-4 w-[1px] bg-gray-200" />
						<span className="text-[10px] font-black text-[#8BA18B] uppercase tracking-tighter">
							Regla {reglaIdx + 1}
						</span>
					</div>
					
					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSyncing || precioCon === "" || precioSin === ""}
						className="h-9 px-4 rounded-xl shadow-sm text-xs font-bold"
					>
						{isSyncing ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						Actualizar
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label className="text-[10px] uppercase font-bold text-[#4A5D4A] flex items-center gap-1.5 pl-1">
							<UserCheck className="h-3 w-3 text-primary" />
							Con Privilegio
						</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
								S/
							</span>
							<Input
								type="number"
								value={precioCon}
								onChange={(e) => setPrecioCon(e.target.value)}
								className="pl-8 bg-white/80 rounded-xl"
								placeholder="0.00"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<Label className="text-[10px] uppercase font-bold text-[#4A5D4A] flex items-center gap-1.5 pl-1">
							<Users className="h-3 w-3 text-[#8BA18B]" />
							Sin Privilegio
						</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
								S/
							</span>
							<Input
								type="number"
								value={precioSin}
								onChange={(e) => setPrecioSin(e.target.value)}
								className="pl-8 bg-white/80 rounded-xl"
								placeholder="0.00"
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
