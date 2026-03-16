"use client";

import { AlertCircle, Loader2, Users, Zap } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBungalowPricingList } from "@/hooks/useBungalows";
import { type TipoTarifa, useSyncTarifasByCapacity } from "@/hooks/useTarifas";

interface SyncCapacidadModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tipo: TipoTarifa | null;
}

export function SyncCapacidadModal({
	open,
	onOpenChange,
	tipo,
}: SyncCapacidadModalProps) {
	const { data: bungalows, isLoading: loadingBungalows } =
		useBungalowPricingList();
	const syncMutation = useSyncTarifasByCapacity();

	// Extraer capacidades únicas de los bungalows existentes
	const capacidadesUnicas = useMemo(() => {
		if (!bungalows) return [];
		const caps = new Set(bungalows.map((b) => b.capacidad));
		return Array.from(caps).sort((a, b) => a - b);
	}, [bungalows]);

	const { register, handleSubmit, reset, setValue } = useForm({
		defaultValues: {
			items: [] as { capacidad: number; con: number; sin: number }[],
		},
	});

	useEffect(() => {
		if (open && capacidadesUnicas.length > 0) {
			reset({
				items: capacidadesUnicas.map((cap) => ({
					capacidad: cap,
					con: 0,
					sin: 0,
				})),
			});
		}
	}, [open, capacidadesUnicas, reset]);

	const onSubmit = (data: any) => {
		if (!tipo) return;

		const payload = {
			tipo_tarifa_id: tipo.id,
			items: data.items.map((item: any) => ({
				capacidad: item.capacidad,
				precio_con_privilegio: Number(item.con),
				precio_sin_privilegio: Number(item.sin),
			})),
		};

		syncMutation.mutate(payload, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
				<DialogHeader className="p-8 bg-primary/5">
					<div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
						<Zap className="h-8 w-8" />
					</div>
					<DialogTitle className="text-3xl font-black text-[#2C3A2C]">
						Sincronización Masiva
					</DialogTitle>
					<DialogDescription className="text-[#8BA18B] text-lg font-medium">
						Configura precios para{" "}
						<span className="text-primary font-bold">"{tipo?.nombre}"</span>
						{tipo?.reglas?.some((r) => r.es_paquete_obligatorio) && (
							<Badge
								variant="outline"
								className="ml-2 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 border-amber-200"
							>
								Paquete
							</Badge>
						)}{" "}
						en todos los bungalows de acuerdo a su capacidad de personas.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="p-8 max-h-[50vh] overflow-y-auto">
						{loadingBungalows ? (
							<div className="flex flex-col items-center justify-center py-10 text-[#8BA18B]">
								<Loader2 className="h-10 w-10 animate-spin mb-4" />
								<p className="font-bold">Analizando bungalows...</p>
							</div>
						) : capacidadesUnicas.length === 0 ? (
							<div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4">
								<AlertCircle className="h-8 w-8 shrink-0" />
								<p className="font-bold">
									No se encontraron bungalows para sincronizar.
								</p>
							</div>
						) : (
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-100">
										<th className="text-left py-3 font-black text-[#2C3A2C]">
											Capacidad
										</th>
										<th className="text-left py-3 font-black text-[#2C3A2C]">
											S/ Con Priv.
										</th>
										<th className="text-left py-3 font-black text-[#2C3A2C]">
											S/ Sin Priv.
										</th>
									</tr>
								</thead>
								<tbody>
									{capacidadesUnicas.map((cap, index) => (
										<tr
											key={cap}
											className="border-b border-gray-50 group hover:bg-primary/[0.02]"
										>
											<td className="py-4">
												<div className="flex items-center gap-2">
													<div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
														<Users className="h-4 w-4" />
													</div>
													<input
														type="hidden"
														{...register(`items.${index}.capacidad`)}
														value={cap}
													/>
													<span className="font-bold text-[#2C3A2C]">
														{cap} Personas
													</span>
												</div>
											</td>
											<td className="py-4 px-2">
												<Input
													type="number"
													step="0.01"
													className="h-10 rounded-xl border-gray-100 font-mono font-bold focus:ring-primary/20"
													placeholder="0.00"
													{...register(`items.${index}.con`)}
												/>
											</td>
											<td className="py-4">
												<Input
													type="number"
													step="0.01"
													className="h-10 rounded-xl border-gray-100 font-mono font-bold focus:ring-primary/20"
													placeholder="0.00"
													{...register(`items.${index}.sin`)}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					<DialogFooter className="p-8 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							className="h-14 rounded-2xl flex-1 font-bold text-[#8BA18B]"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								syncMutation.isPending || capacidadesUnicas.length === 0
							}
							className="h-14 rounded-2xl flex-[2] font-black text-lg shadow-xl shadow-primary/20"
						>
							{syncMutation.isPending ? (
								<Loader2 className="mr-2 h-6 w-6 animate-spin" />
							) : (
								<Zap className="mr-2 h-6 w-6" />
							)}
							Sincronizar Todo
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
