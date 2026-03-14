"use client";

import { useState, useMemo, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Users,
	UserPlus,
	Trash2,
	Ticket,
	Info,
	Plus,
	Star,
} from "lucide-react";
import { useGetGrupoFamiliar } from "@/hooks/visitas/useGetGrupoFamiliar";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import {
	useUpdateVisitaPases,
	useUpdateVisitaBungalow,
} from "@/hooks/visitas/useVisitaMutations";
import type { Visita } from "@/schemas/visita";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditIngresantesModalProps {
	isOpen: boolean;
	onClose: () => void;
	visita: Visita;
}

export function EditIngresantesModal({
	isOpen,
	onClose,
	visita,
}: EditIngresantesModalProps) {
	const { data: grupo } = useGetGrupoFamiliar();
	const { data: tiposPases } = useGetTiposPases();
	const isBungalow = !!(visita as any).reserva_asociada;

	const updatePases = useUpdateVisitaPases(visita.id);
	const updateBungalow = useUpdateVisitaBungalow(visita.id);

	const [currentIngresantes, setCurrentIngresantes] = useState<any[]>([]);
	const [initialIngresantes, setInitialIngresantes] = useState<any[]>([]);

	useEffect(() => {
		if (isOpen && visita.lista_ingresantes?.ingresantes) {
			const mapped = visita.lista_ingresantes.ingresantes.map((i) => ({
				...i,
				isExisting: true,
				isDeleted: false,
			}));
			setCurrentIngresantes(mapped);
			setInitialIngresantes(JSON.parse(JSON.stringify(mapped)));
		}
	}, [isOpen, visita]);

	const defaultTipoPase = useMemo(() => {
		if (!tiposPases) return null;
		return (
			tiposPases.find((p) => p.nombre.toUpperCase().includes("GENERAL")) ||
			tiposPases[0]
		);
	}, [tiposPases]);

	const handleAddPerson = (miembro: any) => {
		if (currentIngresantes.some((ing) => ing.persona.id === miembro.persona.id && !ing.isDeleted)) {
			toast.info("Esta persona ya está en la lista.");
			return;
		}

		const deletedIndex = currentIngresantes.findIndex(ing => ing.persona.id === miembro.persona.id && ing.isDeleted);
		if (deletedIndex !== -1) {
			const newIngs = [...currentIngresantes];
			newIngs[deletedIndex].isDeleted = false;
			setCurrentIngresantes(newIngs);
			return;
		}

		setCurrentIngresantes([
			...currentIngresantes,
			{
				id: `temp-${Date.now()}`,
				persona: miembro.persona,
				tipo_entrada: defaultTipoPase,
				con_cupon: false,
				isExisting: false,
				isDeleted: false,
			},
		]);
	};

	const handleDelete = (ingId: string) => {
		const ing = currentIngresantes.find((i) => i.id === ingId);
		if (ing?.isExisting) {
			setCurrentIngresantes(
				currentIngresantes.map((i) =>
					i.id === ingId ? { ...i, isDeleted: true } : i,
				),
			);
		} else {
			setCurrentIngresantes(currentIngresantes.filter((i) => i.id !== ingId));
		}
	};

	const handleUpdate = (ingId: string, delta: any) => {
		setCurrentIngresantes(
			currentIngresantes.map((i) => (i.id === ingId ? { ...i, ...delta } : i)),
		);
	};

	const handleSave = async () => {
		const add = currentIngresantes
			.filter((i) => !i.isExisting && !i.isDeleted)
			.map((i) => ({
				persona_id: i.persona.id,
				tipo_entrada_id: i.tipo_entrada?.id,
				con_cupon: i.con_cupon,
			}));

		const deleteList = currentIngresantes
			.filter((i) => i.isExisting && i.isDeleted)
			.map((i) => i.id);

		const update = currentIngresantes
			.filter((i) => i.isExisting && !i.isDeleted)
			.filter((i) => {
				const initial = initialIngresantes.find((ini) => ini.id === i.id);
				return (
					initial.tipo_entrada?.id !== i.tipo_entrada?.id ||
					initial.con_cupon !== i.con_cupon
				);
			})
			.map((i) => ({
				ingresante_id: i.id,
				tipo_entrada_id: i.tipo_entrada?.id,
				con_cupon: i.con_cupon,
			}));

		if (add.length === 0 && deleteList.length === 0 && update.length === 0) {
			onClose();
			return;
		}

		try {
			if (isBungalow) {
				await updateBungalow.mutateAsync({
					add,
					delete: deleteList,
					update: update.map(({ ingresante_id, con_cupon }) => ({
						ingresante_id,
						con_cupon,
					})),
				});
			} else {
				await updatePases.mutateAsync({
					add,
					delete: deleteList,
					update,
				});
			}
			onClose();
		} catch (e) { }
	};

	const activeIngresantes = currentIngresantes.filter((i) => !i.isDeleted);
	const availableFromGroup = grupo?.grupo.filter(
		(m) => !activeIngresantes.some((ing) => ing.persona.id === m.persona.id)
	) || [];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			{/* 1. Añadimos flex flex-col a la estructura principal para controlar el layout */}
			<DialogContent className="p-0 overflow-hidden rounded-[24px] md:rounded-[40px] border-none shadow-2xl h-[95vh] md:h-[85vh] w-[95vw] md:max-w-6xl max-h-[900px] flex flex-col">
				<DialogHeader className="sr-only">
					<DialogTitle>Editar Invitados</DialogTitle>
					<DialogDescription>
						Gestiona los acompañantes y sus tipos de entrada para esta visita.
					</DialogDescription>
				</DialogHeader>

				{/* 2. Este div actúa como el cuerpo de nuestro modal. Toma todo el espacio disponible (flex-1) excluyendo al footer */}
				<div className="flex flex-col md:flex-row flex-1 min-h-0 w-full overflow-hidden">

					{/* Panel Izquierdo: Selección */}
					<div className="w-full md:w-[35%] lg:w-[30%] bg-gray-50/50 p-5 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col h-[40%] md:h-full flex-shrink-0 md:flex-shrink">
						<div className="flex items-center gap-3 mb-6 flex-shrink-0">
							<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
								<UserPlus className="h-5 w-5 md:h-6 md:w-6" />
							</div>
							<div>
								<h3 className="font-black text-[#2C3A2C] text-sm md:text-lg leading-none mb-1">Añadir Invitados</h3>
								<p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toca para incluir</p>
							</div>
						</div>

						<ScrollArea className="flex-1 min-h-0 -mx-2 px-2">
							<div className="grid grid-cols-1 gap-2 md:gap-3 pb-4">
								{availableFromGroup.map((miembro) => (
									<button
										key={miembro.persona.id}
										onClick={() => handleAddPerson(miembro)}
										className="w-full flex items-center justify-between p-3 md:p-4 rounded-[20px] md:rounded-[24px] bg-white border border-gray-100 hover:border-primary/30 hover:shadow-md hover:scale-[1.01] transition-all group active:scale-95"
									>
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gray-50 flex items-center justify-center font-black text-xs md:text-sm text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
												{miembro.persona.nombres[0]}
											</div>
											<div className="text-left overflow-hidden">
												<p className="text-[12px] md:text-sm font-black text-[#2C3A2C] leading-none mb-1 truncate">{miembro.persona.nombre_completo}</p>
												<p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">DNI {miembro.persona.dni}</p>
											</div>
										</div>
										<div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
											<Plus className="h-3 w-3 md:h-4 md:w-4" />
										</div>
									</button>
								))}
								{availableFromGroup.length === 0 && (
									<div className="text-center py-6 opacity-50 bg-white/50 rounded-[24px] border border-dashed border-gray-200">
										<p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase">Sin más opciones</p>
									</div>
								)}
							</div>
						</ScrollArea>
					</div>

					{/* Panel Derecho: Lista Actual */}
					<div className="w-full md:w-[65%] lg:w-[70%] flex flex-col bg-white flex-1 min-h-0 relative">

						{/* Header Panel Derecho */}
						<div className="p-5 md:p-8 pb-4 md:pb-6 flex-shrink-0 flex items-center justify-between border-b border-gray-50 md:border-none">
							<div className="flex items-center gap-3 md:gap-4">
								<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shadow-sm">
									<Users className="h-5 w-5 md:h-6 md:w-6" />
								</div>
								<div>
									<h3 className="font-black text-[#2C3A2C] text-base md:text-xl leading-none mb-1">En la Sesión</h3>
									<p className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">{activeIngresantes.length} personas</p>
								</div>
							</div>
						</div>

						{/* Scrollable Area */}
						<div className="flex-1 min-h-0 relative">
							<ScrollArea className="h-full px-5 md:px-8">
								<div className="space-y-3 md:space-y-5 pb-8">
									{activeIngresantes.map((ing) => (
										<div key={ing.id} className="p-4 md:p-6 rounded-[24px] md:rounded-[36px] border border-gray-100 bg-white shadow-sm flex flex-col gap-4 md:gap-5 group hover:border-amber-200 transition-all text-left">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
													<div className="h-9 w-9 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
														{ing.persona.nombres[0]}
													</div>
													<div className="min-w-0">
														<p className="text-[13px] md:text-base font-black text-[#2C3A2C] truncate leading-tight mb-1">{ing.persona.nombre_completo}</p>
														<div className="flex items-center gap-2 flex-wrap">
															<Badge className="h-4 md:h-5 px-1.5 md:px-2 text-[8px] md:text-[10px] font-black tracking-widest bg-gray-50 text-gray-400 border-none rounded-md md:rounded-lg uppercase">DNI {ing.persona.dni}</Badge>
															{!ing.isExisting && <Badge className="h-4 md:h-5 px-1.5 md:px-2 text-[8px] md:text-[10px] font-black tracking-widest bg-green-50 text-green-700 border-none rounded-md md:rounded-lg uppercase">NUEVO</Badge>}
														</div>
													</div>
												</div>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDelete(ing.id)}
													className="rounded-full h-8 w-8 md:h-10 md:w-10 text-gray-300 hover:text-destructive hover:bg-destructive/5 transition-colors flex-shrink-0"
												>
													<Trash2 className="h-4 w-4 md:h-5 md:w-5" />
												</Button>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
												<div className="space-y-1.5">
													<label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
														<Ticket className="h-3 md:h-3.5 w-3 md:w-3.5" /> Tipo de Pase
													</label>
													<Select
														value={ing.tipo_entrada?.id}
														onValueChange={(val) => {
															const selected = tiposPases?.find(p => p.id === val);
															handleUpdate(ing.id, { tipo_entrada: selected });
														}}
													>
														<SelectTrigger className="h-9 md:h-11 text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl bg-gray-50/50 border-gray-100 focus:ring-amber-500 transition-all">
															<SelectValue />
														</SelectTrigger>
														<SelectContent className="rounded-xl md:rounded-2xl">
															{tiposPases?.map((p) => (
																<SelectItem key={p.id} value={p.id} className="text-xs font-medium py-2.5">
																	{p.nombre}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-1.5">
													<label className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
														<Star className="h-3 md:h-3.5 w-3 md:w-3.5" /> Beneficio
													</label>
													<Select
														value={isBungalow ? "included" : (ing.con_cupon ? "true" : "false")}
														onValueChange={(val) => handleUpdate(ing.id, { con_cupon: val === "true" })}
														disabled={isBungalow}
													>
														<SelectTrigger className="h-9 md:h-11 text-[10px] md:text-xs font-bold rounded-xl md:rounded-2xl bg-gray-50/50 border-gray-100 focus:ring-amber-500 transition-all">
															<SelectValue />
														</SelectTrigger>
														<SelectContent className="rounded-xl md:rounded-2xl">
															{isBungalow ? (
																<SelectItem value="included" className="text-xs font-medium py-2.5">Incluido en Estancia</SelectItem>
															) : (
																<>
																	<SelectItem value="false" className="text-xs font-medium py-2.5">Pagar Entrada</SelectItem>
																	<SelectItem value="true" className="text-xs font-medium py-2.5">Usar Cupón (S/ 0)</SelectItem>
																</>
															)}
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									))}

									{activeIngresantes.length === 0 && (
										<div className="flex flex-col items-center justify-center py-10 md:py-24 bg-gray-50/30 rounded-[28px] md:rounded-[40px] border-2 border-dashed border-gray-100">
											<div className="h-10 w-10 md:h-16 md:w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
												<Users className="h-5 w-5 md:h-8 md:w-8 text-gray-200" />
											</div>
											<p className="text-[10px] md:text-sm font-black text-gray-300 uppercase tracking-widest text-center px-6">La lista de asistentes está vacía</p>
										</div>
									)}
								</div>
							</ScrollArea>
						</div>
					</div>
				</div>

				{/* 3. Footer reubicado en la jerarquía principal del modal (fuera del panel derecho) */}
				<div className="p-5 md:p-8 bg-white border-t border-gray-100 flex-shrink-0 w-full z-20">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="hidden sm:flex items-center gap-3 text-gray-400 bg-gray-50/80 px-4 py-2.5 rounded-xl md:rounded-2xl border border-gray-100/50">
							<Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
							<p className="text-[8px] md:text-[9px] font-bold leading-tight uppercase tracking-tight">
								Sincronización automática <br /> de la sesión actual.
							</p>
						</div>

						<div className="flex gap-3 w-full sm:w-auto">
							<Button
								variant="ghost"
								className="flex-1 sm:flex-none rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest h-10 md:h-12 border border-transparent hover:border-gray-100"
								onClick={onClose}
							>
								Cerrar
							</Button>
							<Button
								className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-[#2C3A2C] hover:bg-black text-white px-6 md:px-10 font-black text-[10px] md:text-xs uppercase tracking-widest h-10 md:h-12 shadow-xl shadow-[#2C3A2C]/10 transition-all active:scale-95"
								onClick={handleSave}
								disabled={updatePases.isPending || updateBungalow.isPending}
							>
								{updatePases.isPending || updateBungalow.isPending ? "Sincronizando..." : "Confirmar Cambios"}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}