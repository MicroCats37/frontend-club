"use client";

import { Loader2, Plus, RefreshCw, Ticket, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	type TipoEntradaMatriz,
	useGetMatrixTarifas,
	useMatrixUpdate,
} from "@/hooks/visitas/usePasesAdmin";

interface TipoEntradaMatrixModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	tipoId: string | null;
}

export function TipoEntradaMatrixModal({
	isOpen,
	onOpenChange,
	tipoId,
}: TipoEntradaMatrixModalProps) {
	const { data: matrix } = useGetMatrixTarifas();
	const [localTipo, setLocalTipo] = useState<TipoEntradaMatriz | null>(null);

	const targetTipo = matrix?.find((t) => t.tipo_entrada_id === tipoId);

	useEffect(() => {
		if (targetTipo) {
			setLocalTipo(JSON.parse(JSON.stringify(targetTipo)));
		}
	}, [targetTipo]);

	const { mutate: updateTipo, isPending } = useMatrixUpdate(
		tipoId || "",
	);

	const handleAddRange = (categoriaKey: string) => {
		if (!localTipo) return;
		const updated = { ...localTipo };
		const cat = updated.categorias.find((c) => c.categoria === categoriaKey);
		if (cat) {
			const lastRange =
				cat.precios_rango_edad[cat.precios_rango_edad.length - 1];
			const nextMin = lastRange ? lastRange.edad_max + 1 : 0;
			cat.precios_rango_edad.push({
				edad_min: nextMin,
				edad_max: 99,
				precio: 0,
			});
			setLocalTipo(updated);
		}
	};

	const handleRemoveRange = (categoriaKey: string, index: number) => {
		if (!localTipo) return;
		const updated = { ...localTipo };
		const cat = updated.categorias.find((c) => c.categoria === categoriaKey);
		if (cat) {
			cat.precios_rango_edad.splice(index, 1);
			setLocalTipo(updated);
		}
	};

	const handleRangeChange = (
		categoriaKey: string,
		index: number,
		field: string,
		value: any,
	) => {
		if (!localTipo) return;
		const updated = { ...localTipo };
		const cat = updated.categorias.find((c) => c.categoria === categoriaKey);
		if (cat) {
			cat.precios_rango_edad[index] = {
				...cat.precios_rango_edad[index],
				[field]:
					field === "precio"
						? parseFloat(value) || 0
						: parseInt(value, 10) || 0,
			};
			setLocalTipo(updated);
		}
	};

	if (!localTipo) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="w-full sm:max-w-[95vw] lg:max-w-[1200px] max-h-[96vh] rounded-[2.5rem] p-0 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-white/95 backdrop-blur-xl flex flex-col overflow-hidden">


				<DialogHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-10 pb-4 sm:pb-6 shrink-0 border-b border-white/20">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:pr-12">
						<div className="flex items-center gap-4 sm:gap-6">
							<div className="p-3 sm:p-4 rounded-[1.25rem] bg-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] text-primary border border-primary/5 shrink-0">
								<Ticket className="w-6 h-6 sm:w-8 sm:h-8" />
							</div>
							<div className="space-y-0.5 sm:space-y-1">
								<DialogTitle className="text-xl sm:text-3xl font-black text-[#2C3A2C] tracking-tight">
									{localTipo.tipo_entrada_nombre}
								</DialogTitle>
								<DialogDescription className="text-[#8BA18B] text-xs sm:text-base font-medium">
									Matriz de precios por categoría y edad
								</DialogDescription>
							</div>
						</div>
						<Button
							onClick={() => updateTipo(localTipo)}
							disabled={isPending}
							className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] h-10 sm:h-12 px-6 sm:px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
						>
							{isPending ? (
								<Loader2 className="mr-3 h-4 w-4 animate-spin" />
							) : (
								<RefreshCw className="mr-3 h-4 w-4" />
							)}
							Sincronizar Matriz
						</Button>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-4 sm:p-10 pt-4 sm:pt-6 custom-scrollbar bg-white/50">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 pb-10">
						{localTipo.categorias.map((cat) => (
							<Card key={cat.categoria} className="rounded-[2rem] border-none shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden bg-white border border-[#E0E7E0]/50 h-fit group/cat">
								<CardHeader className="bg-[#F8FAF8] border-b p-6 flex flex-row items-center justify-between">
									<div className="space-y-1">
										<CardTitle className="text-lg font-black text-[#2C3A2C]">
											{cat.nombre_categoria}
										</CardTitle>
										<div className="h-1 w-6 bg-primary/20 rounded-full group-hover/cat:w-10 transition-all duration-500" />
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleAddRange(cat.categoria)}
										className="rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-wider border-primary/20 text-primary hover:bg-primary/5"
									>
										<Plus className="mr-2 h-3 w-3" />
										Nuevo Rango
									</Button>
								</CardHeader>
								<CardContent className="p-6 space-y-4">
									{cat.precios_rango_edad.length === 0 ? (
										<div className="p-10 rounded-[1.5rem] border-2 border-dashed border-[#E0E7E0] bg-[#F8FAF8]/50 flex flex-col items-center justify-center text-center">
											<p className="text-[10px] font-bold text-[#8BA18B] uppercase tracking-widest">
												Sin precios
											</p>
										</div>
									) : (
										<>
											<div className="hidden sm:grid grid-cols-12 gap-3 px-2">
												<div className="col-span-3 text-[9px] font-black text-[#8BA18B] uppercase tracking-widest">
													Desde
												</div>
												<div className="col-span-3 text-[9px] font-black text-[#8BA18B] uppercase tracking-widest">
													Hasta
												</div>
												<div className="col-span-4 text-[9px] font-black text-[#8BA18B] uppercase tracking-widest">
													Tarifa (S/)
												</div>
											</div>
											<div className="space-y-2">
												{cat.precios_rango_edad.map((range, idx) => (
													<div
														key={idx}
														className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end sm:items-center group/range p-3 sm:p-1 hover:bg-primary/5 rounded-2xl sm:rounded-xl transition-all border border-transparent hover:border-primary/10"
													>
														<div className="col-span-3 space-y-1">
															<label className="text-[8px] font-black text-[#8BA18B] uppercase tracking-tight sm:hidden ml-1">Desde</label>
															<Input
																type="number"
																className="h-9 sm:h-9 rounded-lg text-xs font-bold border-[#E0E7E0] text-center bg-white"
																value={range.edad_min}
																onChange={(e) =>
																	handleRangeChange(
																		cat.categoria,
																		idx,
																		"edad_min",
																		e.target.value,
																	)
																}
															/>
														</div>
														<div className="col-span-3 space-y-1">
															<label className="text-[8px] font-black text-[#8BA18B] uppercase tracking-tight sm:hidden ml-1">Hasta</label>
															<Input
																type="number"
																className="h-9 sm:h-9 rounded-lg text-xs font-bold border-[#E0E7E0] text-center bg-white"
																value={range.edad_max}
																onChange={(e) =>
																	handleRangeChange(
																		cat.categoria,
																		idx,
																		"edad_max",
																		e.target.value,
																	)
																}
															/>
														</div>
														<div className="col-span-5 sm:col-span-4 space-y-1">
															<label className="text-[8px] font-black text-[#8BA18B] uppercase tracking-tight sm:hidden ml-1">Tarifa (S/)</label>
															<div className="relative group/input">
																<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40">
																	S/
																</span>
																<Input
																	type="number"
																	step="0.01"
																	className="h-9 sm:h-9 pl-8 pr-3 rounded-lg text-sm font-black border-none bg-[#F0F4F0] focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all text-right"
																	value={range.precio}
																	onChange={(e) =>
																		handleRangeChange(
																			cat.categoria,
																			idx,
																			"precio",
																			e.target.value,
																		)
																	}
																/>
															</div>
														</div>
														<div className="col-span-12 sm:col-span-2 flex justify-end">
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full sm:opacity-0 group-hover/range:opacity-100 transition-all"
																onClick={() => handleRemoveRange(cat.categoria, idx)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>
												))}
											</div>
										</>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
