"use client";

import { Loader2, Plus, RefreshCw, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	type TipoEntradaMatriz,
	useMatrixUpdate,
} from "@/hooks/visitas/usePasesAdmin";

interface TipoEntradaMatrixCardProps {
	tipo: TipoEntradaMatriz;
}

export function TipoEntradaMatrixCard({ tipo }: TipoEntradaMatrixCardProps) {
	const [localTipo, setLocalTipo] = useState<TipoEntradaMatriz>(() =>
		JSON.parse(JSON.stringify(tipo)),
	);
	const { mutate: updateTipo, isPending } = useMatrixUpdate(
		tipo.tipo_entrada_id,
	);

	const handleAddRange = (categoriaKey: string) => {
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

	return (
		<Card className="rounded-[2.5rem] border-none shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden bg-white border border-[#E0E7E0]/50 h-fit">
			<CardHeader className="bg-[#F8FAF8] border-b p-8 flex flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-5">
					<div className="p-4 rounded-[1.25rem] bg-white shadow-sm text-primary border border-primary/5">
						<Ticket className="w-7 h-7" />
					</div>
					<div>
						<CardTitle className="text-2xl font-black text-[#2C3A2C] tracking-tight">
							{localTipo.tipo_entrada_nombre}
						</CardTitle>
						<CardDescription className="text-sm font-medium text-[#8BA18B]">
							Matriz de precios por categoría y edad
						</CardDescription>
					</div>
				</div>
				<Button
					onClick={() => updateTipo(localTipo)}
					disabled={isPending}
					className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] h-12 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
				>
					{isPending ? (
						<Loader2 className="mr-3 h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="mr-3 h-4 w-4" />
					)}
					Sincronizar Matriz
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				<div className="divide-y divide-[#F0F4F0]">
					{localTipo.categorias.map((cat) => (
						<div
							key={cat.categoria}
							className="p-8 space-y-6 group/cat hover:bg-[#FDFDFD] transition-colors"
						>
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<h4 className="text-lg font-black text-[#2C3A2C]">
										{cat.nombre_categoria}
									</h4>
									<div className="h-1 w-8 bg-primary/20 rounded-full group-hover/cat:w-12 transition-all duration-500" />
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleAddRange(cat.categoria)}
									className="rounded-xl h-9 px-4 text-[11px] font-black uppercase tracking-wider border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
								>
									<Plus className="mr-2 h-3.5 w-3.5" />
									Nuevo Rango
								</Button>
							</div>

							<div className="space-y-3">
								{cat.precios_rango_edad.length === 0 ? (
									<div className="p-10 rounded-[2rem] border-2 border-dashed border-[#E0E7E0] bg-[#F8FAF8]/50 flex flex-col items-center justify-center text-center">
										<Ticket className="w-10 h-10 text-[#8BA18B]/20 mb-3" />
										<p className="text-xs font-bold text-[#8BA18B]/80 uppercase tracking-widest">
											No hay precios configurados
										</p>
									</div>
								) : (
									<>
										<div className="grid grid-cols-12 gap-4 px-4 pb-2">
											<div className="col-span-3 text-[10px] font-black text-[#8BA18B] uppercase tracking-[0.2em]">
												Desde (Años)
											</div>
											<div className="col-span-3 text-[10px] font-black text-[#8BA18B] uppercase tracking-[0.2em]">
												Hasta (Años)
											</div>
											<div className="col-span-4 text-[10px] font-black text-[#8BA18B] uppercase tracking-[0.2em]">
												Tarifa (S/)
											</div>
											<div className="col-span-2"></div>
										</div>
										<div className="space-y-2">
											{cat.precios_rango_edad.map((range, idx) => (
												<div
													key={idx}
													className="grid grid-cols-12 gap-4 items-center group/range p-1 hover:bg-primary/5 rounded-[1.5rem] transition-all duration-300"
												>
													<Input
														type="number"
														className="col-span-3 h-11 rounded-xl text-sm font-bold border-[#E0E7E0] focus:border-primary/50 focus:ring-primary/20 transition-all text-center bg-white"
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
													<Input
														type="number"
														className="col-span-3 h-11 rounded-xl text-sm font-bold border-[#E0E7E0] focus:border-primary/50 focus:ring-primary/20 transition-all text-center bg-white"
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
													<div className="col-span-4 relative group/input">
														<span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-primary/40 group-focus-within/input:text-primary transition-colors">
															S/
														</span>
														<Input
															type="number"
															step="0.01"
															className="h-11 pl-9 pr-4 rounded-xl text-base font-black border-none bg-[#F0F4F0] focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-right"
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
													<div className="col-span-2 flex justify-end pr-2">
														<Button
															variant="ghost"
															size="icon"
															className="h-9 w-9 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover/range:opacity-100 transition-all duration-300 hover:rotate-90"
															onClick={() =>
																handleRemoveRange(cat.categoria, idx)
															}
														>
															<Trash2 className="h-4.5 w-4.5" />
														</Button>
													</div>
												</div>
											))}
										</div>
									</>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
