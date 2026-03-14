"use client";

import { useTipoTarifas, useDeleteTipoTarifa, TipoTarifa } from "@/hooks/useTarifas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Plus, Trash2, Calendar, Loader2, Info, Pencil } from "lucide-react";
import { useState } from "react";
import { TipoTarifaEditModal } from "./_components/TipoTarifaEditModal";
import { TipoTarifaCreateModal } from "./_components/TipoTarifaCreateModal";
import { BungalowPricingList } from "./_components/BungalowPricingList";
import { SyncCapacidadModal } from "./_components/SyncCapacidadModal";
import { Zap } from "lucide-react";

const DIAS = [
	{ id: 1, label: "L" },
	{ id: 2, label: "M" },
	{ id: 3, label: "X" },
	{ id: 4, label: "J" },
	{ id: 5, label: "V" },
	{ id: 6, label: "S" },
	{ id: 7, label: "D" },
];

export default function BungalowsPreciosPage() {
	const [page, setPage] = useState(1);
	const { data: response, isLoading } = useTipoTarifas(page);
	const deleteMutation = useDeleteTipoTarifa();

	const [tipoAEditar, setTipoAEditar] = useState<TipoTarifa | null>(null);
	const [modalEdicionOpen, setModalEdicionOpen] = useState(false);
	const [modalCreacionOpen, setModalCreacionOpen] = useState(false);
	const [modalSyncOpen, setModalSyncOpen] = useState(false);
	const [tipoASync, setTipoASync] = useState<TipoTarifa | null>(null);

	const tipos = response && !Array.isArray(response) ? response.results : (response as TipoTarifa[]);
	const paginacion = response && !Array.isArray(response) ? { count: response.count, next: response.next, previous: response.previous } : null;

	return (
		<div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-extrabold text-[#2C3A2C]">Configuración de Tarifas</h1>
					<p className="text-[#8BA18B]">Gestiona los tipos de tarifa maestros disponibles para los bungalows.</p>
				</div>
				<Button
					onClick={() => setModalCreacionOpen(true)}
					className="h-12 rounded-2xl px-6 font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
				>
					<Plus className="h-5 w-5" />
					Nueva Tarifa
				</Button>
			</div>

			<div className="space-y-4">
				{isLoading ? (
					<div className="flex justify-center p-20">
						<Loader2 className="h-10 w-10 animate-spin text-primary" />
					</div>
				) : tipos?.length === 0 ? (
					<div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed flex flex-col items-center">
						<Info className="h-12 w-12 text-[#8BA18B] mb-4 opacity-20" />
						<p className="text-[#8BA18B] font-medium">No hay tipos de tarifa definidos.</p>
                        <Button 
                            variant="link" 
                            className="mt-2 text-primary font-bold"
                            onClick={() => setModalCreacionOpen(true)}
                        >
                            Crear la primera tarifa
                        </Button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-3">
						{tipos?.map((tipo) => (
							<Card key={tipo.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white/50 hover:bg-white">
								<CardContent className="p-4">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
										<div className="flex items-center gap-4 flex-1">
											<div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
												<Calendar className="h-6 w-6" />
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-bold text-[#2C3A2C] truncate text-lg">{tipo.nombre}</h3>
													{tipo.es_temporal && (
														<Badge className="bg-orange-100 text-orange-700 border-none text-[10px] font-black h-5">
															TEMPORAL
														</Badge>
													)}
													{!tipo.activo && (
														<Badge className="bg-red-100 text-red-700 border-none text-[10px] font-black h-5">
															INACTIVO
														</Badge>
													)}
												</div>
												
												<div className="flex items-center gap-3 text-[10px] text-[#8BA18B] font-medium mb-2">
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{tipo.fecha_inicio}
													</span>
													<span>→</span>
													<span className="flex items-center gap-1">
														{tipo.fecha_fin || "Permanente"}
													</span>
												</div>
												
												<div className="space-y-1">
													{tipo.reglas?.map((regla: any, idx: number) => (
														<div key={regla.id || idx} className="flex gap-1 items-center">
															{DIAS.map((dia) => (
																<div
																	key={dia.id}
																	className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${regla.dias_semana?.includes(dia.id)
																		? "bg-primary/10 text-primary"
																		: "bg-gray-50 text-gray-300"
																		}`}
																>
																	{dia.label}
																</div>
															))}
															{tipo.reglas.length > 1 && (
																<span className="text-[8px] font-black text-primary/40 uppercase ml-2 tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
																	Regla {idx + 1}
																</span>
															)}
														</div>
													))}
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
											<div className="hidden sm:block h-8 w-[1px] bg-gray-100 mx-2" />
											
											<Button 
											    type="button"
												variant="ghost" 
												size="icon" 
												className="text-primary hover:bg-primary/5 sm:opacity-0 group-hover:opacity-100 transition-all rounded-xl h-10 w-10 border border-transparent hover:border-primary/20"
												title="Sincronizar por Capacidad"
												onClick={() => {
													setTipoASync(tipo);
													setModalSyncOpen(true);
												}}
											>
												<Zap className="h-5 w-5" />
											</Button>

											<Button 
											    type="button"
												variant="ghost" 
												size="icon" 
												className="text-[#8BA18B] hover:text-primary hover:bg-primary/5 sm:opacity-0 group-hover:opacity-100 transition-all rounded-xl h-10 w-10"
												onClick={() => {
													setTipoAEditar(tipo);
													setModalEdicionOpen(true);
												}}
											>
												<Pencil className="h-4 w-4" />
											</Button>

											<Button 
											    type="button"
												variant="ghost" 
												size="icon" 
												className="text-[#8BA18B] hover:text-destructive hover:bg-destructive/5 sm:opacity-0 group-hover:opacity-100 transition-all rounded-xl h-10 w-10"
												onClick={() => {
													if(confirm("¿Estás seguro de eliminar este tipo de tarifa?")) {
														deleteMutation.mutate(tipo.id);
													}
												}}
												disabled={deleteMutation.isPending}
											>
												{deleteMutation.isPending ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-5 w-5" />
												)}
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}

						{/* Botones de Paginación */}
						{paginacion && (paginacion.next || paginacion.previous) && (
							<div className="flex items-center justify-center gap-4 mt-8">
								<Button
									variant="outline"
									size="sm"
									disabled={!paginacion.previous}
									onClick={() => setPage(page - 1)}
									className="rounded-xl font-bold"
								>
									Anterior
								</Button>
								<span className="text-sm font-bold text-[#8BA18B]">
									Página {page}
								</span>
								<Button
									variant="outline"
									size="sm"
									disabled={!paginacion.next}
									onClick={() => setPage(page + 1)}
									className="rounded-xl font-bold"
								>
									Siguiente
								</Button>
							</div>
						)}
					</div>
				)}
			</div>

			<BungalowPricingList />

			<TipoTarifaCreateModal
				open={modalCreacionOpen}
				onOpenChange={setModalCreacionOpen}
			/>

			<TipoTarifaEditModal 
				open={modalEdicionOpen} 
				onOpenChange={setModalEdicionOpen} 
				tipo={tipoAEditar} 
			/>

			<SyncCapacidadModal
				open={modalSyncOpen}
				onOpenChange={setModalSyncOpen}
				tipo={tipoASync}
			/>
		</div>
	);
}
