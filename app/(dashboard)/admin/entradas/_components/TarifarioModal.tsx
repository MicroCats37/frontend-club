"use client";

import { ArrowLeft, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetTarifas, useTarifaActions } from "@/hooks/visitas/usePasesAdmin";

interface TarifarioModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	category: any;
}

export function TarifarioModal({
	isOpen,
	onOpenChange,
	category,
}: TarifarioModalProps) {
	const { data: tarifas, isLoading } = useGetTarifas(category?.id);
	const { createTarifa, deleteTarifa } = useTarifaActions();

	const [isAdding, setIsAdding] = useState(false);
	const [newTarifa, setNewTarifa] = useState({
		tipo_entrada_id: category?.id,
		categoria_usuario: "HABILITADO",
		precios_rango_edad: [{ edad_min: 0, edad_max: 99, precio: 0 }],
	});

	const handleAddTarifa = () => {
		createTarifa.mutate(newTarifa, { onSuccess: () => setIsAdding(false) });
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-[2.5rem] max-w-4xl p-0 overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-white/95 backdrop-blur-xl max-h-[90vh] flex flex-col">
				<div className="absolute top-6 right-6 z-10">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onOpenChange(false)}
						className="rounded-full hover:bg-black/5"
					>
						<X className="w-5 h-5 text-[#8BA18B]" />
					</Button>
				</div>

				<DialogHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 pb-6 shrink-0">
					<div className="flex items-center gap-6">
						<div className="p-4 rounded-[1.25rem] bg-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] text-primary border border-primary/5">
							<Tag className="w-8 h-8" />
						</div>
						<div className="space-y-1">
							<DialogTitle className="text-3xl font-black text-[#2C3A2C] tracking-tight">
								Tarifario: {category?.nombre}
							</DialogTitle>
							<DialogDescription className="text-[#8BA18B] text-base font-medium">
								Configura precios por categoría de socio y edad.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-10 pt-4 custom-scrollbar bg-white/50">
					<div className="flex items-center justify-between mb-8">
						<h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#8BA18B]">
							Categorías de Socio Configuradas
						</h3>
						<Button
							onClick={() => setIsAdding(true)}
							className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
						>
							<Plus className="mr-2 h-4 w-4" /> Agregar Nueva Categoría
						</Button>
					</div>

					{isLoading ? (
						<div className="flex h-[300px] items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
							{(Array.isArray(tarifas)
								? tarifas
								: (tarifas as any)?.results || []
							)?.map((t: any) => (
								<Card
									key={t.id}
									className="rounded-[2rem] border-none shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden bg-white border border-[#E0E7E0]/50 group"
								>
									<CardHeader className="bg-[#F8FAF8] border-b flex flex-row justify-between items-center p-6">
										<div>
											<CardTitle className="text-base font-black text-primary uppercase tracking-wider">
												{t.categoria_usuario}
											</CardTitle>
											<CardDescription className="text-xs font-medium">
												Precios por rangos de edad
											</CardDescription>
										</div>
										{!["HABILITADO", "VITALICIO"].includes(t.categoria_usuario.toUpperCase()) && (
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
												onClick={() => deleteTarifa.mutate(t.id)}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										)}
									</CardHeader>
									<CardContent className="p-6">
										<div className="space-y-3">
											{t.precios_rango_edad.map((range: any, idx: number) => (
												<div
													key={idx}
													className="flex items-center justify-between p-4 rounded-2xl bg-[#F0F4F0]/30 border border-[#E0E7E0]/30 transition-all group-hover:border-primary/20 group-hover:bg-white"
												>
													<div className="flex flex-col">
														<span className="text-[10px] font-black text-[#8BA18B] uppercase tracking-widest mb-1">
															Edad: {range.edad_min} a {range.edad_max}
														</span>
														<span className="text-lg font-black text-[#2C3A2C]">
															S/ {Number(range.precio).toFixed(2)}
														</span>
													</div>
													<div className="p-2 rounded-xl bg-white shadow-sm border border-[#E0E7E0]/50">
														<Tag className="w-3.5 h-3.5 text-primary/40" />
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>

				<Dialog open={isAdding} onOpenChange={setIsAdding}>
					<DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
						<DialogHeader className="mb-6">
							<DialogTitle className="text-2xl font-black text-[#2C3A2C] tracking-tight">
								Nueva Tarifa por Categoría
							</DialogTitle>
							<DialogDescription className="text-[#8BA18B] font-medium">
								Asigna precios para una categoría de socio específica.
							</DialogDescription>
						</DialogHeader>
						
						<div className="space-y-6">
							<div className="space-y-2">
								<Label className="text-xs font-black uppercase tracking-widest text-[#8BA18B] ml-1">
									Categoría de Socio
								</Label>
								<select
									className="w-full h-12 rounded-2xl border border-[#E0E7E0] px-4 font-bold text-[#2C3A2C] bg-[#F8FAF8] focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
									value={newTarifa.categoria_usuario}
									onChange={(e) =>
										setNewTarifa({
											...newTarifa,
											categoria_usuario: e.target.value,
										})
									}
								>
									<option value="HABILITADO">Socio Habilitado</option>
									<option value="VITALICIO">Socio Vitalicio</option>
									<option value="INVITADO">Invitado General</option>
									<option value="CONVENIO">Convenio Institucional</option>
								</select>
							</div>
							
							<div className="space-y-2">
								<Label className="text-xs font-black uppercase tracking-widest text-[#8BA18B] ml-1">
									Precio General
								</Label>
								<div className="relative">
									<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-primary/40">
										S/
									</span>
									<Input
										type="number"
										value={newTarifa.precios_rango_edad[0].precio}
										onChange={(e) => {
											const prices = [...newTarifa.precios_rango_edad];
											prices[0].precio = parseFloat(e.target.value);
											setNewTarifa({ ...newTarifa, precios_rango_edad: prices });
										}}
										className="h-12 pl-10 pr-4 rounded-2xl border-none bg-[#F0F4F0] font-black text-lg focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
									/>
								</div>
							</div>
						</div>

						<DialogFooter className="mt-8 flex gap-3">
							<Button 
								variant="ghost" 
								onClick={() => setIsAdding(false)}
								className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 flex-1 hover:bg-black/5"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleAddTarifa}
								className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 flex-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
							>
								Guardar Tarifa
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DialogContent>
		</Dialog>
	);
}
