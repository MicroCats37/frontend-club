"use client";

import { format } from "date-fns";
import {
	ArrowRight,
	Calculator,
	CheckCircle2,
	Info,
	Loader2,
	Star,
	Ticket,
	Trash2,
	TrendingUp,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGetGrupoFamiliar } from "@/hooks/visitas/useGetGrupoFamiliar";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import { useCotizarVisita } from "@/hooks/visitas/useVisitaFlow";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepVisitorSelection() {
	const {
		guestSelections,
		addGuest,
		removeGuest,
		updateGuest,
		setPaso,
		defaultTipoPaseId,
		fechas,
		setTotalEstimado,
	} = useVisitaRegistrationStore();

	const { data: grupo, isLoading: loadingGrupo } = useGetGrupoFamiliar();
	const { data: tiposPases, isLoading: loadingPases } = useGetTiposPases();
	const router = useRouter();
	const [showInviteModal, setShowInviteModal] = useState(false);

	const [isDirty, setIsDirty] = useState(false);

	// Detectar si solo está el titular para invitarlo a crear más acompañantes
	useEffect(() => {
		if (grupo && grupo.grupo.length === 1 && !loadingGrupo) {
			setShowInviteModal(true);
		}
	}, [grupo, loadingGrupo]);

	const { mutate: cotizar, isPending: isCotizando } = useCotizarVisita();

	// Separamos los invitados: los que ya tienen precio (cotizados) y los que no
	const quotedGuests = useMemo(
		() =>
			guestSelections.filter((g) => g.total_persona > 0 || g.has_been_quoted),
		[guestSelections],
	);

	const pendingGuests = useMemo(
		() =>
			guestSelections.filter(
				(g) => g.total_persona === 0 && !g.has_been_quoted,
			),
		[guestSelections],
	);

	const handleCotizar = () => {
		if (!fechas.start || !fechas.end) {
			toast.error("Por favor, selecciona las fechas primero.");
			setPaso(2);
			return;
		}
		if (guestSelections.length === 0) {
			toast.error("Selecciona al menos un invitado.");
			return;
		}

		cotizar(
			{
				fecha_inicio: format(fechas.start, "yyyy-MM-dd"),
				fecha_fin: format(fechas.end, "yyyy-MM-dd"),
				ingresantes: guestSelections.map((g) => ({
					persona_id: g.persona_id,
					tipo_entrada_id: g.tipo_entrada_id,
					con_cupon: g.con_cupon,
				})),
			},
			{
				onSuccess: (res) => {
					setTotalEstimado(res.total);
					// Actualizar todos los invitados con sus precios y marcar como cotizados
					res.desglose.forEach((c) => {
						updateGuest(c.persona_id, {
							precio_unitario: Number(c.precio_unitario),
							total_persona: Number(c.total_persona),
							usa_cupon: c.usa_cupon,
							has_been_quoted: true,
						});
					});
					setIsDirty(false);
					toast.success("Cotización actualizada correctamente.");
				},
			},
		);
	};

	const handleTogglePersona = (miembro: any) => {
		const persona = miembro.persona;
		const isSelected = guestSelections.some((g) => g.persona_id === persona.id);
		if (isSelected) {
			removeGuest(persona.id);
			setIsDirty(true);
		} else if (defaultTipoPaseId) {
			addGuest({
				persona_id: persona.id,
				dni: persona.dni,
				nombre_completo: persona.nombre_completo,
				tipo_entrada_id: defaultTipoPaseId,
				con_cupon: false,
				precio_unitario: 0,
				total_persona: 0,
				usa_cupon: false,
				en_bungalow: false,
				has_been_quoted: false,
			} as any);
			setIsDirty(true);
		} else {
			toast.error("Por favor, selecciona un tipo de entrada primero.");
			setPaso(1);
		}
	};

	const handleToggleCoupon = (personaId: string, value: boolean) => {
		updateGuest(personaId, { con_cupon: value });
		setIsDirty(true);
		toast.info("Configuración de cupones actualizada.");
	};

	const cuponesEnUsoCount = useMemo(
		() => guestSelections.filter((g) => g.con_cupon).length,
		[guestSelections],
	);

	const totalCuponesDisponibles = grupo?.cupos_disponibles || 0;
	const cuponesRestantes = Math.max(
		0,
		totalCuponesDisponibles - cuponesEnUsoCount,
	);

	const needsUpdate = isDirty || pendingGuests.length > 0;

	if (loadingGrupo || loadingPases) {
		return (
			<div className="flex flex-col items-center justify-center py-12 sm:py-24 animate-in fade-in duration-700">
				<Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500 animate-spin mb-4" />
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
								<div className="h-12 w-12 sm:h-14 sm:w-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
									<Users className="h-6 w-6 sm:h-7 sm:w-7" />
								</div>
								<div>
									<h2 className="text-2xl sm:text-3xl font-black text-[#2C3A2C] tracking-tighter leading-none">
										Tu Grupo Familiar
									</h2>
									<p className="text-muted-foreground font-medium mt-1 text-xs sm:text-sm">
										Selecciona a los miembros que te acompañarán hoy.
									</p>
								</div>
							</div>

							<div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 hidden sm:block">
								<p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-0.5">
									Cupones Libres
								</p>
								<p className="text-lg font-black text-green-600 leading-none">
									{cuponesRestantes}{" "}
									<span className="text-[10px] text-gray-400">disponibles</span>
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{grupo?.grupo.map((miembro) => {
								const persona = miembro.persona;
								const isSelected = guestSelections.some(
									(g) => g.persona_id === persona.id,
								);
								const isQuoted = quotedGuests.some(
									(g) => g.persona_id === persona.id,
								);
								const isVip = !!miembro.tiene_privilegios;

								return (
									<div
										key={persona.id}
										onClick={() => !isQuoted && handleTogglePersona(miembro)}
										className={`group relative flex items-center gap-4 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] border-2 transition-all duration-300 cursor-pointer ${
											isSelected
												? isQuoted
													? "bg-gray-50 border-gray-100 opacity-60 cursor-default"
													: "bg-amber-50 border-amber-500 shadow-md ring-4 ring-amber-500/5"
												: isVip
													? "bg-green-50 border-green-100 hover:border-green-300"
													: "bg-white border-gray-50 hover:border-amber-200 hover:bg-amber-50/10 shadow-sm"
										}`}
									>
										<div
											className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
												isSelected
													? "bg-amber-500 text-white"
													: isVip
														? "bg-green-600 text-white shadow-sm"
														: "bg-gray-50 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600"
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
												{isVip && (
													<span className="text-[8px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
														Pase Libre
													</span>
												)}
											</div>
										</div>

										<div
											className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${
												isSelected
													? "bg-amber-500 border-amber-500 text-white"
													: "border-gray-100 bg-gray-50/50"
											}`}
										>
											{isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
										</div>
									</div>
								);
							})}
						</div>

						{pendingGuests.length > 0 && (
							<div className="mt-8 p-6 bg-amber-500 rounded-[32px] shadow-xl animate-in slide-in-from-top-4">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
											<Calculator className="h-5 w-5" />
										</div>
										<p className="text-white font-black text-sm leading-tight">
											{pendingGuests.length} personas listas
											<br />
											<span className="text-white/60 font-medium text-[10px] uppercase tracking-wider">
												Pendientes de cotización
											</span>
										</p>
									</div>
									<Button
										onClick={handleCotizar}
										disabled={isCotizando}
										className="h-12 px-6 rounded-xl bg-white text-amber-600 hover:bg-white/90 font-black shadow-lg transition-all active:scale-95 text-xs"
									>
										{isCotizando ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<>
												Pasar a Cotización{" "}
												<ArrowRight className="ml-2 h-4 w-4" />
											</>
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* PANEL DERECHO: PASES COTIZADOS Y CUPONES */}
				<div className="flex-1 space-y-6">
					<div className="bg-white rounded-[32px] sm:rounded-[40px] border-2 border-gray-100 p-6 sm:p-8 shadow-sm h-full flex flex-col min-h-[400px] sm:min-h-[600px]">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-4">
								<div className="h-12 w-12 sm:h-14 sm:w-14 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-600/20 shrink-0">
									<Ticket className="h-6 w-6 sm:h-7 sm:w-7" />
								</div>
								<div>
									<h2 className="text-2xl sm:text-3xl font-black text-[#2C3A2C] tracking-tighter leading-none">
										Lista de Ingresantes
									</h2>
									<p className="text-muted-foreground font-medium mt-1 text-xs sm:text-sm">
										Gestiona precios y cupones de los ingresantes de esta
										visita.
									</p>
								</div>
							</div>
						</div>

						{quotedGuests.length === 0 ? (
							<div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
								<div className="h-20 w-20 bg-white rounded-[28px] flex items-center justify-center text-gray-200 mb-6 shadow-sm">
									<Ticket className="h-10 w-10" />
								</div>
								<h3 className="text-xl font-black text-gray-400 tracking-tight">
									Mueve invitados aquí
								</h3>
								<p className="text-gray-400 font-medium text-sm max-w-xs mt-2">
									Usa el botón "Pasar a Cotización" para procesar los precios de
									los miembros seleccionados.
								</p>
							</div>
						) : (
							<div className="flex-1 space-y-4">
								{/* Lista de ya cotizados */}
								{quotedGuests.map((selection) => {
									const memberInfo = grupo?.grupo?.find(
										(m) => m.persona.id === selection.persona_id,
									);
									const isSocioVip = !!memberInfo?.tiene_privilegios;
									const isPriceFree = isSocioVip || selection.usa_cupon;

									return (
										<div
											key={selection.persona_id}
											className={`group relative bg-white rounded-[32px] border-2 p-6 shadow-sm transition-all animate-in zoom-in-95 duration-300 ${
												isSocioVip
													? "border-green-200 bg-green-50/10 shadow-green-900/5 ring-4 ring-green-500/5"
													: "border-gray-100 hover:border-amber-200"
											}`}
										>
											<div className="flex items-center justify-between mb-6">
												<div className="flex items-center gap-4">
													<div
														className={`h-10 w-10 rounded-xl flex items-center justify-center ${isSocioVip ? "bg-green-600 text-white" : "bg-gray-50 text-gray-400"}`}
													>
														{isSocioVip ? (
															<Zap className="h-5 w-5" />
														) : (
															<User className="h-5 w-5" />
														)}
													</div>
													<div>
														<h4 className="font-black text-[#2C3A2C] leading-none mb-1 text-sm">
															{selection.nombre_completo}
														</h4>
														<Badge
															variant="secondary"
															className="text-[8px] font-black uppercase tracking-widest px-2"
														>
															Pase General
														</Badge>
													</div>
												</div>
												<div className="text-right">
													<div className="flex items-center gap-2 mb-1 justify-end">
														<span
															className={`text-xl font-black ${isPriceFree ? "text-green-600" : "text-[#2C3A2C] tracking-tighter"}`}
														>
															{isPriceFree
																? "S/ 0"
																: `S/ ${Math.ceil(selection.total_persona)}`}
														</span>
													</div>
													<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
														Costo Final
													</p>
												</div>
											</div>

											<div className="flex items-center gap-3">
												<div
													className={`flex-1 flex items-center justify-between p-4 rounded-[22px] border-2 transition-all cursor-pointer ${
														isSocioVip
															? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/20"
															: selection.con_cupon
																? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
																: cuponesRestantes <= 0 && !selection.con_cupon
																	? "bg-gray-50 border-gray-100 opacity-40 cursor-not-allowed"
																	: "bg-gray-50 border-gray-100 hover:bg-white hover:border-blue-200"
													}`}
												>
													<div className="flex items-center gap-3">
														<div
															className={`h-8 w-8 rounded-lg flex items-center justify-center ${isSocioVip ? "bg-white text-green-600" : selection.con_cupon ? "bg-white text-blue-600" : "bg-white shadow-sm text-gray-300"}`}
														>
															<Ticket className="h-4 w-4" />
														</div>
														<div>
															<p className="text-[10px] font-black uppercase tracking-widest leading-none">
																{isSocioVip
																	? "Sin costo • Privilegio"
																	: selection.con_cupon
																		? "Cupón Aplicado"
																		: cuponesRestantes <= 0
																			? "Sin cupones"
																			: "Usar Cupón"}
															</p>
														</div>
													</div>
													{!isSocioVip && (
														<Checkbox
															checked={selection.con_cupon}
															disabled={
																isCotizando ||
																(cuponesRestantes <= 0 && !selection.con_cupon)
															}
															onCheckedChange={(val) =>
																handleToggleCoupon(
																	selection.persona_id,
																	val as boolean,
																)
															}
															className={`h-6 w-6 rounded-lg transition-all ${selection.con_cupon ? "bg-white text-blue-600 border-none" : "border-gray-200"}`}
														/>
													)}
												</div>

												<Button
													variant="ghost"
													size="icon"
													onClick={() => removeGuest(selection.persona_id)}
													className="h-14 w-14 rounded-[22px] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
												>
													<Trash2 className="h-5 w-5" />
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						)}

						{quotedGuests.length > 0 && (
							<div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-white sticky bottom-0 gap-6">
								<div className="text-center sm:text-left">
									<p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
										{needsUpdate ? "Total Pendiente" : "Inversión Total"}
									</p>
									<p
										className={`text-3xl sm:text-4xl font-black tracking-tighter transition-colors ${needsUpdate ? "text-amber-500" : "text-[#2C3A2C]"}`}
									>
										S/{" "}
										{Math.ceil(
											guestSelections.reduce(
												(acc, g) => acc + (g.total_persona || 0),
												0,
											),
										)}
									</p>
								</div>

								{needsUpdate ? (
									<Button
										onClick={handleCotizar}
										disabled={isCotizando || guestSelections.length === 0}
										className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-[20px] sm:rounded-[24px] font-black bg-amber-500 hover:bg-amber-600 text-white shadow-2xl transition-all shadow-amber-200 hover:scale-[1.02] active:scale-95"
									>
										{isCotizando ? (
											<Loader2 className="h-6 w-6 animate-spin" />
										) : (
											<>
												<TrendingUp className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />{" "}
												Actualizar Cotización
											</>
										)}
									</Button>
								) : (
									<Button
										onClick={() => setPaso(4)}
										className="h-14 sm:h-16 w-full sm:w-auto px-12 rounded-[20px] sm:rounded-[24px] font-black bg-[#2C3A2C] hover:bg-black text-white shadow-2xl transition-all shadow-gray-200 hover:scale-[1.02] active:scale-95"
									>
										Confirmar{" "}
										<ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
									</Button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Info footer */}
			<div className="mt-8 sm:mt-12 px-4">
				<div className="bg-amber-50 shadow-inner rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border border-amber-100/50">
					<div className="h-12 w-12 sm:h-14 sm:w-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 shrink-0">
						<Info className="h-6 w-6 sm:h-7 sm:w-7" />
					</div>
					<div className="text-center md:text-left">
						<h4 className="font-black text-amber-900 text-base sm:text-lg tracking-tight mb-1">
							Gestión Dinámica de Pases
						</h4>
						<p className="text-amber-800/60 font-medium text-xs sm:text-sm leading-relaxed max-w-3xl">
							Puedes agregar o quitar personas en cualquier momento. Al usar un
							cupón, recuerda actualizar la cotización para que el sistema
							recalcule los descuentos correspondientes del fondo de tu grupo
							familiar.
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
							continuar con tu Full Day.
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
