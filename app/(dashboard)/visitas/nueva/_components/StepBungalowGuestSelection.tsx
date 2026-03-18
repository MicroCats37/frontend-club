"use client";

import {
	ArrowRight,
	CheckCircle2,
	Info,
	Loader2,
	Star,
	Trash2,
	User,
	UserPlus,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGetGrupoFamiliar } from "@/hooks/visitas/useGetGrupoFamiliar";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepBungalowGuestSelection() {
	const {
		guestSelections,
		addGuest,
		removeGuest,
		setPaso,
		bungalowsSeleccionados,
	} = useVisitaRegistrationStore();

	const { data: grupo, isLoading: loadingGrupo } = useGetGrupoFamiliar();
	const { data: tiposPases, isLoading: loadingPases } = useGetTiposPases();
	const router = useRouter();
	const [showInviteModal, setShowInviteModal] = useState(false);

	// Detectar si solo está el titular para invitarlo a crear más acompañantes
	useEffect(() => {
		if (grupo && grupo.grupo.length === 1 && !loadingGrupo) {
			setShowInviteModal(true);
		}
	}, [grupo, loadingGrupo]);

	// En el flujo de bungalows, necesitamos un tipo de entrada válido para el backend,
	// pero no queremos que el usuario lo elija. Usaremos el primero disponible (ej: Invitado General).
	const defaultForBungalow = useMemo(() => tiposPases?.[0]?.id, [tiposPases]);

	const totalCapacidad = useMemo(() => {
		return bungalowsSeleccionados.reduce(
			(acc, b) => acc + (b.capacidad || 0),
			0,
		);
	}, [bungalowsSeleccionados]);

	const handleTogglePersona = (miembro: any) => {
		const persona = miembro.persona;
		const isSelected = guestSelections.some((g) => g.persona_id === persona.id);

		if (isSelected) {
			removeGuest(persona.id);
		} else {
			// Validación de capacidad
			if (guestSelections.length >= totalCapacidad) {
				toast.error(`Capacidad máxima alcanzada (${totalCapacidad} personas).`);
				return;
			}

			if (!defaultForBungalow) {
				toast.error("No se encontraron tipos de entrada configurados.");
				return;
			}

			addGuest({
				persona_id: persona.id,
				dni: persona.dni,
				nombre_completo: persona.nombre_completo,
				tipo_entrada_id: defaultForBungalow,
				con_cupon: false,
				precio_unitario: 0,
				total_persona: 0,
				usa_cupon: false,
				en_bungalow: true,
				has_been_quoted: true, // Ya están "listos" porque el precio lo da el bungalow
			} as any);
		}
	};

	if (loadingGrupo || loadingPases) {
		return (
			<div className="flex flex-col items-center justify-center py-12 sm:py-24 animate-in fade-in duration-700">
				<Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 animate-spin mb-4" />
				<p className="font-black text-[#2C3A2C] text-base sm:text-lg">
					Cargando tu grupo familiar...
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-full mx-auto py-2 sm:py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
			<div className="flex flex-col lg:flex-row gap-8 px-4 h-full">
				{/* PANEL IZQUIERDO: SELECCIÓN DE INTEGRANTES */}
				<div className="flex-1 space-y-6">
					<div className="bg-white rounded-[32px] sm:rounded-[40px] border-2 border-gray-100 p-6 sm:p-8 shadow-sm">
						<div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
							<div className="flex items-center gap-4 text-center sm:text-left">
								<div className="h-12 w-12 sm:h-14 sm:w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
									<Users className="h-6 w-6 sm:h-7 sm:w-7" />
								</div>
								<div>
									<h2 className="text-2xl sm:text-3xl font-black text-[#2C3A2C] tracking-tighter leading-none">
										Residentes del Bungalow
									</h2>
									<p className="text-muted-foreground font-medium mt-1 text-xs sm:text-sm">
										Selecciona a las personas que se hospedarán contigo.
									</p>
								</div>
							</div>

							<div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 hidden sm:block">
								<p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-0.5">
									Ocupación
								</p>
								<p
									className={`text-lg font-black leading-none ${guestSelections.length >= totalCapacidad ? "text-red-500" : "text-blue-600"}`}
								>
									{guestSelections.length} / {totalCapacidad}{" "}
									<span className="text-[10px] text-gray-400">personas</span>
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{grupo?.grupo.map((miembro) => {
								const persona = miembro.persona;
								const isSelected = guestSelections.some(
									(g) => g.persona_id === persona.id,
								);
								const isVip = !!miembro.tiene_privilegios;

								return (
									<div
										key={persona.id}
										onClick={() => handleTogglePersona(miembro)}
										className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border-2 transition-all duration-300 cursor-pointer ${
											isSelected
												? "bg-blue-50 border-blue-500 shadow-md ring-4 ring-blue-500/5"
												: isVip
													? "bg-green-50 border-green-100 hover:border-green-300"
													: "bg-white border-gray-50 hover:border-blue-200 hover:bg-blue-50/10 shadow-sm"
										}`}
									>
										<div
											className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
												isSelected
													? "bg-blue-600 text-white"
													: isVip
														? "bg-green-600 text-white shadow-sm"
														: "bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
											}`}
										>
											{isVip ? (
												<Zap className="h-5 w-5 mb-0.5" />
											) : miembro.tipo === "TITULAR" ? (
												<Star className="h-5 w-5" />
											) : (
												<User className="h-5 w-5" />
											)}
										</div>

										<div className="flex-1 min-w-0">
											<h3 className="text-sm font-black text-[#2C3A2C] truncate">
												{persona.nombre_completo}
											</h3>
											<div className="flex items-center gap-2 mt-0.5">
												<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
													{miembro.tipo}
												</p>
											</div>
										</div>

										<div
											className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
												isSelected
													? "bg-blue-600 border-blue-600 text-white"
													: "border-gray-100 bg-gray-50/50"
											}`}
										>
											{isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* PANEL DERECHO: RESUMEN DE OCUPANTES */}
				<div className="flex-1 space-y-6">
					<div className="bg-white rounded-[32px] sm:rounded-[40px] border-2 border-gray-100 p-6 sm:p-8 shadow-sm h-full flex flex-col min-h-[400px] sm:min-h-[600px]">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-900/20 shrink-0">
									<Users className="h-6 w-6 sm:h-7 sm:w-7" />
								</div>
								<div>
									<h2 className="text-2xl sm:text-3xl font-black text-[#2C3A2C] tracking-tighter leading-none">
										Resumen de Estadía
									</h2>
									<p className="text-muted-foreground font-medium mt-1 text-xs sm:text-sm">
										Lista de huéspedes para esta reserva.
									</p>
								</div>
							</div>
						</div>

						{guestSelections.length === 0 ? (
							<div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
								<div className="h-20 w-20 bg-white rounded-[28px] flex items-center justify-center text-gray-200 mb-6 shadow-sm">
									<Users className="h-10 w-10" />
								</div>
								<h3 className="text-xl font-black text-gray-400 tracking-tight">
									Selecciona a tus acompañantes
								</h3>
								<p className="text-gray-400 font-medium text-sm max-w-xs mt-2">
									Haz clic en los miembros de tu grupo familiar para agregarlos
									a la reserva del bungalow.
								</p>
							</div>
						) : (
							<div className="flex-1 space-y-4">
								{guestSelections.map((selection) => (
									<div
										key={selection.persona_id}
										className="group relative bg-white rounded-[32px] border-2 border-gray-100 p-6 shadow-sm flex items-center justify-between"
									>
										<div className="flex items-center gap-4">
											<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
												<User className="h-5 w-5" />
											</div>
											<div>
												<h4 className="font-black text-[#2C3A2C] leading-none mb-1 text-sm">
													{selection.nombre_completo}
												</h4>
												<Badge
													variant="secondary"
													className="text-[8px] font-black uppercase tracking-widest px-2 bg-blue-100 text-blue-700 border-none"
												>
													Huésped Bungalow
												</Badge>
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeGuest(selection.persona_id)}
											className="h-10 w-10 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
										>
											<Trash2 className="h-5 w-5" />
										</Button>
									</div>
								))}
							</div>
						)}

						<div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-white sticky bottom-0 gap-6">
							<div className="text-center sm:text-left">
								<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">
									Estado de Ocupación
								</p>
								<p className="text-xl sm:text-2xl font-black text-[#2C3A2C]">
									{guestSelections.length} Huéspedes
								</p>
							</div>

							<Button
								onClick={() => setPaso(5)}
								disabled={guestSelections.length === 0}
								className="h-14 sm:h-16 w-full sm:w-auto px-12 rounded-[20px] sm:rounded-[24px] font-black bg-[#2C3A2C] hover:bg-black text-white shadow-2xl transition-all shadow-gray-200 hover:scale-[1.02] active:scale-95"
							>
								Continuar <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Info footer */}
			<div className="mt-8 sm:mt-12 px-4">
				<div className="bg-blue-50 shadow-inner rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border border-blue-100/50">
					<div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 shrink-0">
						<Info className="h-6 w-6 sm:h-7 sm:w-7" />
					</div>
					<div className="text-center md:text-left">
						<h4 className="font-black text-blue-900 text-base sm:text-lg tracking-tight mb-1">
							Información sobre Huéspedes
						</h4>
						<p className="text-blue-800/60 font-medium text-xs sm:text-sm leading-relaxed max-w-3xl">
							Para estadías en bungalows, los huéspedes no pagan entrada
							individual. Al finalizar su visita se le cobrará el monto
							correspondiente a la entrada.
						</p>
					</div>
				</div>
			</div>

			<Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
				<DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
					<div className="bg-[#2C3A2C] p-8 text-center relative overflow-hidden">
						<div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
							<Users className="h-24 w-24 text-white" />
						</div>
						<div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-amber-900/40 relative z-10">
							<UserPlus className="h-8 w-8" />
						</div>
						<DialogTitle className="text-white text-2xl font-black tracking-tight mb-2 relative z-10">
							¿Deseas agregar invitados?
						</DialogTitle>
						<DialogDescription className="text-white/60 font-medium text-sm relative z-10">
							Hemos detectado que solo estás tú en tu grupo. Para una mejor
							experiencia, puedes registrar a tus acompañantes antes de
							continuar.
						</DialogDescription>
					</div>
					<div className="p-8 space-y-4 bg-white">
						<Button
							onClick={() => router.push("/mi-grupo")}
							className="w-full h-14 rounded-2xl bg-[#2C3A2C] hover:bg-black text-white font-black transition-all active:scale-95"
						>
							Ir a Mi Grupo Familiar
						</Button>
						<Button
							variant="ghost"
							onClick={() => setShowInviteModal(false)}
							className="w-full h-12 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 transition-all"
						>
							Continuar solo por ahora
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
