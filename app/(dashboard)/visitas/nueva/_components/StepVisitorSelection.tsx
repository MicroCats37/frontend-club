"use client";

import {
	ArrowRight,
	CheckCircle2,
	Star,
	Ticket,
	User,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetGrupoFamiliar } from "@/hooks/visitas/useGetGrupoFamiliar";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepVisitorSelection() {
	const {
		guestSelections,
		addGuest,
		removeGuest,
		updateGuest,
		bulkUpdateGuests,
		setPaso,
		tipoVisita,
	} = useVisitaRegistrationStore();

	const { data: grupo, isLoading: loadingGrupo } = useGetGrupoFamiliar();
	const { data: tiposPases, isLoading: loadingPases } = useGetTiposPases();

	const defaultTipoPase = useMemo(() => {
		if (!tiposPases) return null;
		return (
			tiposPases.find((p) => p.nombre.toUpperCase().includes("GENERAL")) ||
			tiposPases[0]
		);
	}, [tiposPases]);

	const handleTogglePersona = (miembro: any) => {
		const persona = miembro.persona;
		const isSelected = guestSelections.some((g) => g.persona_id === persona.id);
		if (isSelected) {
			removeGuest(persona.id);
		} else if (defaultTipoPase) {
			addGuest({
				persona_id: persona.id,
				nombre_completo: persona.nombre_completo,
				tipo_entrada_id: defaultTipoPase.id,
				con_cupon: false,
				precio_unitario: 0,
				total_persona: 0,
				usa_cupon: false,
				en_bungalow: tipoVisita === "BUNGALOW",
			});
		} else {
			toast.error("No se han cargado los tipos de entrada.");
		}
	};

	const handleBulkPassUpdate = (tipoId: string) => {
		bulkUpdateGuests({ tipo_entrada_id: tipoId });
		toast.success("Pase aplicado a todo el grupo seleccionado.");
	};

	const isNextDisabled = guestSelections.length === 0;

	if (loadingGrupo || loadingPases) {
		return (
			<div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
				<p className="font-black text-[#2C3A2C] text-lg">
					Cargando tu grupo...
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
			{/* Header con acciones globales */}
			<div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b mb-10 -mx-4 px-4 py-6 shadow-sm">
				<div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
					<div>
						<h2 className="text-3xl font-black text-[#2C3A2C] tracking-tighter leading-tight">
							Selecciona los Invitados
						</h2>
						<p className="text-muted-foreground font-medium text-sm">
							Individualiza el tipo de pase o aplica uno a todo el grupo.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
						{guestSelections.length > 1 && (
							<div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2 rounded-2xl animate-in zoom-in-95 duration-300">
								<Zap className="h-4 w-4 text-amber-600 ml-2" />
								<span className="text-[10px] font-black uppercase text-amber-700 whitespace-nowrap hidden md:block">
									Aplicar a todos:
								</span>
								<Select onValueChange={handleBulkPassUpdate}>
									<SelectTrigger className="h-10 w-[180px] bg-white rounded-xl border-amber-200 text-xs font-bold">
										<SelectValue placeholder="Seleccionar pase..." />
									</SelectTrigger>
									<SelectContent className="rounded-xl">
										{tiposPases?.map((p) => (
											<SelectItem
												key={p.id}
												value={p.id}
												className="text-xs font-medium"
											>
												{p.nombre}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<Button
							disabled={isNextDisabled}
							onClick={() => setPaso(tipoVisita === "BUNGALOW" ? 5 : 4)}
							className="h-12 px-10 rounded-xl font-black bg-[#2C3A2C] hover:bg-black text-white transition-all shadow-lg active:scale-95"
						>
							Continuar <ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
				{grupo?.grupo.map((miembro) => {
					const persona = miembro.persona;
					const selection = guestSelections.find(
						(g) => g.persona_id === persona.id,
					);
					const isSelected = !!selection;

					return (
						<div
							key={persona.id}
							className={`group relative flex flex-col rounded-[32px] transition-all duration-300 border-2 ${
								isSelected
									? "border-amber-500 bg-amber-50/20 shadow-xl shadow-amber-900/5 ring-4 ring-amber-500/5"
									: "border-gray-100 hover:border-amber-200 bg-white"
							}`}
						>
							<div
								className="p-6 cursor-pointer flex-1"
								onClick={() => handleTogglePersona(miembro)}
							>
								<div className="flex items-start gap-4 mb-4">
									<div
										className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all duration-500 ${
											isSelected
												? "bg-amber-500 text-white scale-110 rotate-3"
												: "bg-gray-50 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600"
										}`}
									>
										{miembro.tipo === "TITULAR" ? (
											<Star className="h-6 w-6" />
										) : (
											<User className="h-6 w-6" />
										)}
									</div>

									<div className="flex-1 min-w-0">
										<Badge
											variant="outline"
											className={`text-[8px] font-black uppercase tracking-widest mb-1 px-2 rounded-lg border-2 ${
												miembro.tipo === "TITULAR"
													? "border-amber-200 text-amber-700 bg-white"
													: "border-gray-100 text-gray-400 bg-gray-50"
											}`}
										>
											{miembro.tipo}
										</Badge>
										<h3 className="text-base font-black text-[#2C3A2C] leading-tight line-clamp-1">
											{persona.nombre_completo}
										</h3>
									</div>

									<div
										className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
											isSelected
												? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30"
												: "border-gray-100"
										}`}
									>
										{isSelected && (
											<CheckCircle2 className="h-3.5 w-3.5 text-white" />
										)}
									</div>
								</div>

								{isSelected && (
									<div className="space-y-4 pt-4 border-t border-amber-500/10 animate-in fade-in slide-in-from-top-2">
										<div
											className="space-y-1.5"
											onClick={(e) => e.stopPropagation()}
										>
											<label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
												<Ticket className="h-3 w-3" /> Tipo de Pase
											</label>
											<Select
												value={selection.tipo_entrada_id}
												onValueChange={(val) =>
													updateGuest(persona.id, { tipo_entrada_id: val })
												}
											>
												<SelectTrigger className="h-10 bg-white rounded-xl border-amber-100 text-xs font-bold focus:ring-amber-500">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="rounded-xl">
													{tiposPases?.map((p) => (
														<SelectItem
															key={p.id}
															value={p.id}
															className="text-xs font-medium"
														>
															{p.nombre}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
