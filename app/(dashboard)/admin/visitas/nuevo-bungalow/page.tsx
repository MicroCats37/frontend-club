"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	addDays,
	eachDayOfInterval,
	format,
	getISODay,
	isSameISOWeek,
	isWithinInterval,
	parseISO,
} from "date-fns";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Home,
	Loader2,
	Plus,
	Save,
	Search,
	ShieldCheck,
	Users,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerCustom } from "@/components/ui/DatePickerCustom";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBungalowsDisponibilidad } from "@/hooks/useBungalows";
import { useTipoTarifasHabilitadas } from "@/hooks/useTarifas";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import { useIniciarVisitaBungalow } from "@/hooks/visitas/useIniciarVisitaBungalow";
import {
	type RegistroVisitaBungalow,
	RegistroVisitaBungalowSchema,
} from "@/schemas/visita";

export default function NuevoBungalowPage() {
	const router = useRouter();
	const registrar = useIniciarVisitaBungalow();
	const { data: tiposPases } = useGetTiposPases();

	const form = useForm<RegistroVisitaBungalow>({
		resolver: zodResolver(RegistroVisitaBungalowSchema),
		defaultValues: {
			bungalow_ids: [],
			fecha_llegada: new Date().toISOString().split("T")[0],
			fecha_salida: new Date(Date.now() + 86400000).toISOString().split("T")[0],
			tipo_tarifa_id: "",
			con_privilegio: false,
			ingresantes: [{ persona_id: "", tipo_entrada_id: "", con_cupon: false }],
		},
	});

	const [watchInicioStr, watchFinStr, watchTipoTarifa, watchBungalows] =
		form.watch([
			"fecha_llegada",
			"fecha_salida",
			"tipo_tarifa_id",
			"bungalow_ids",
		]);
	const { data: categorias } = useTipoTarifasHabilitadas(watchInicioStr);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "ingresantes",
	});

	const [step, setStep] = useState(1);
	const [visitType, setVisitType] = useState<"bungalow" | "pase">("bungalow");

	const watchInicio = watchInicioStr ? parseISO(watchInicioStr) : undefined;
	const watchFin = watchFinStr ? parseISO(watchFinStr) : undefined;
	const isPending = registrar.isPending;

	const selectedTariff = categorias?.find(
		(cat: any) => cat.id === watchTipoTarifa,
	);
	const _hasBungalow = watchBungalows && watchBungalows.length > 0;

	// Sincronizar fechas para Solo Pase (Full Day)
	useEffect(() => {
		if (visitType === "pase" && watchInicioStr) {
			form.setValue("fecha_salida", watchInicioStr);
		}
	}, [visitType, watchInicioStr, form]);

	// Lógica de deshabilitar fechas llegada
	const isArrivalDateDisabled = (date: Date) => {
		const day = getISODay(date);

		// 1. Bloqueo por tipo de visita
		if (visitType === "bungalow") {
			if (day === 1 || day === 7) return true; // Lunes y Domingo bloqueados para estadía
		} else {
			if (day === 1) return true; // Solo Lunes bloqueado para Pase Diario
		}

		if (selectedTariff) {
			// 2. Validar rango temporal si es temporal
			if (selectedTariff.es_temporal && selectedTariff.fecha_inicio) {
				const start = parseISO(selectedTariff.fecha_inicio);
				const end = selectedTariff.fecha_fin
					? parseISO(selectedTariff.fecha_fin)
					: undefined;

				if (end) {
					if (!isWithinInterval(date, { start, end })) return true;
				} else {
					if (date < start) return true;
				}
			}

			// 3. Validar días de la semana según reglas
			const allowedDays = new Set<number>();
			selectedTariff.reglas?.forEach((r: any) => {
				r.dias_semana.forEach((d: number) => allowedDays.add(d));
			});

			if (allowedDays.size > 0 && !allowedDays.has(day)) {
				return true;
			}
		}

		return false;
	};

	// Lógica de deshabilitar fechas salida
	const isDepartureDateDisabled = (date: Date) => {
		if (!watchInicio) return true;
		if (date <= watchInicio) return true;

		// 1. Restricción de Misma Semana para Bungalows
		if (visitType === "bungalow") {
			// Regla de Oro: La estadía debe terminar en la misma semana (Lunes a Sábado)
			// Si llega un viernes, solo puede salir sábado.
			if (!isSameISOWeek(date, watchInicio)) return true;

			const day = getISODay(date);
			// No se puede salir un domingo ni lunes (las estancias terminan máximo sábado)
			if (day === 1 || day === 7) return true;
		}

		return false;
	};

	// Validar paquete
	const getPackageError = () => {
		if (!selectedTariff?.reglas || !watchInicio || !watchFin) return null;

		const requiredDays = new Set<number>();
		selectedTariff.reglas?.forEach((r: any) => {
			r.dias_semana.forEach((d: number) => requiredDays.add(d));
		});

		try {
			const selectedDaysInRange = eachDayOfInterval({
				start: watchInicio,
				end: watchFin,
			});
			const presentDays = new Set(selectedDaysInRange.map((d) => getISODay(d)));

			for (const day of Array.from(requiredDays)) {
				if (!presentDays.has(day)) {
					return `Este paquete requiere incluir el día ${["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][day - 1]}`;
				}
			}
		} catch (_e) {
			return "Rango de fechas inválido";
		}

		return null;
	};

	const packageError = getPackageError();

	const {
		data: bungalowsDisponibles,
		isLoading: buscandoBungalows,
		refetch: buscarBungalows,
	} = useBungalowsDisponibilidad({
		f_inicio: watchInicioStr || "",
		f_fin: watchFinStr || "",
		tipo_tarifa_id: watchTipoTarifa,
	});

	const _selectedBungalows = form.watch("bungalow_ids");

	const toggleBungalow = (id: string) => {
		const current = form.getValues("bungalow_ids");
		if (current.includes(id)) {
			form.setValue(
				"bungalow_ids",
				current.filter((b) => b !== id),
			);
		} else {
			form.setValue("bungalow_ids", [...current, id]);
		}
	};

	const onSubmit = (data: RegistroVisitaBungalow) => {
		if (packageError) {
			toast.error(packageError);
			return;
		}
		if (data.bungalow_ids.length === 0) {
			toast.error("Selecciona al menos un bungalow");
			return;
		}
		if (data.ingresantes.length === 0) {
			toast.error("Agrega al menos un ingresante");
			return;
		}

		registrar.mutate(data, {
			onSuccess: () => {
				toast.success("Registro de bungalow y visita creado exitosamente");
				router.push("/admin/visitas");
			},
			onError: (error: any) => {
				toast.error(
					error?.response?.data?.message || "Error al procesar el registro",
				);
			},
		});
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E0E7E0] shadow-sm">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-xl h-12 w-12 hover:bg-muted"
						onClick={() => router.back()}
					>
						<ArrowLeft className="h-6 w-6 text-[#4A5D4A]" />
					</Button>
					<div>
						<h1 className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight flex items-center">
							<Home className="mr-3 h-8 w-8 text-primary" />
							Registro Integral Bungalow
						</h1>
						<p className="text-[#8BA18B] mt-1 font-medium">
							Reserva de alojamiento y control de ingreso simultáneo.
						</p>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* WIZARD STEP 1: CONFIGURACIÓN DE ESTANCIA Y ALOJAMIENTO */}
					{step === 1 && (
						<div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
							<div className="flex flex-col gap-3">
								<label className="text-xs font-black text-primary/60 uppercase tracking-widest ml-2">
									Tipo de Experiencia
								</label>
								<div className="bg-muted/30 p-1.5 rounded-[2rem] border border-primary/10 shadow-inner inline-flex w-fit">
									<Tabs
										value={visitType}
										onValueChange={(v) => {
											setVisitType(v as "bungalow" | "pase");
											form.setValue("bungalow_ids", []);
										}}
										className="w-full sm:w-80"
									>
										<TabsList className="grid h-14 grid-cols-2 rounded-[1.6rem] bg-transparent p-0">
											<TabsTrigger
												value="bungalow"
												className="rounded-[1.4rem] font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:scale-[0.98] transition-all duration-300 gap-2"
											>
												<Home className="w-4 h-4" /> BUNGALOW
											</TabsTrigger>
											<TabsTrigger
												value="pase"
												className="rounded-[1.4rem] font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:scale-[0.98] transition-all duration-300 gap-2"
											>
												<Users className="w-4 h-4" /> SOLO PASE
											</TabsTrigger>
										</TabsList>
									</Tabs>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white md:col-span-1 border-primary/10 border">
									<CardHeader className="bg-muted/30 border-b">
										<CardTitle className="text-lg flex items-center gap-2">
											<Calendar className="w-5 h-5 text-primary" /> 1. Estancia
										</CardTitle>
										<CardDescription>
											Define las fechas y el tipo de tarifa.
										</CardDescription>
									</CardHeader>
									<CardContent className="p-6 space-y-6">
										<FormField
											control={form.control}
											name="fecha_llegada"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs text-[#2C3A2C] uppercase font-black tracking-widest ml-1">
														{visitType === "pase"
															? "Fecha de Visita (Full Day)"
															: "Llegada (Check-in)"}
													</FormLabel>
													<FormControl>
														<DatePickerCustom
															date={
																field.value ? parseISO(field.value) : undefined
															}
															setDate={(date) =>
																field.onChange(
																	date ? format(date, "yyyy-MM-dd") : "",
																)
															}
															isDateDisabled={isArrivalDateDisabled}
															placeholder={
																visitType === "pase"
																	? "Elegir fecha de día"
																	: "Fecha de llegada"
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="fecha_salida"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs text-[#2C3A2C] uppercase font-black tracking-widest ml-1">
														{visitType === "pase"
															? "Término de Visita"
															: "Salida (Check-out)"}
													</FormLabel>
													<FormControl>
														<DatePickerCustom
															date={
																field.value ? parseISO(field.value) : undefined
															}
															setDate={(date) =>
																field.onChange(
																	date ? format(date, "yyyy-MM-dd") : "",
																)
															}
															isDateDisabled={isDepartureDateDisabled}
															minDate={
																watchInicio
																	? addDays(watchInicio, 1)
																	: undefined
															}
															disabled={visitType === "pase" || !watchInicioStr}
															placeholder={
																!watchInicioStr
																	? "Esperando llegada..."
																	: "Fecha de salida"
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="tipo_tarifa_id"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
														Categoría de Tarifa
													</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<SelectTrigger className="h-11 rounded-xl">
																<SelectValue placeholder="Seleccione categoría" />
															</SelectTrigger>
														</FormControl>
														<SelectContent className="rounded-xl">
															{categorias
																?.filter((cat) => cat.nombre !== "Feriado")
																.map((cat) => (
																	<SelectItem
																		key={cat.id}
																		value={cat.id}
																		className="rounded-lg"
																	>
																		<div className="flex items-center gap-2">
																			<span>{cat.nombre}</span>
																			
																		</div>
																	</SelectItem>
																))}
														</SelectContent>
													</Select>
													{packageError && (
														<div className="mt-2 flex items-center gap-2 text-destructive text-[11px] font-bold bg-destructive/5 p-2 rounded-lg border border-destructive/10 animate-pulse">
															<AlertCircle className="w-3 h-3" />
															{packageError}
														</div>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="button"
											className="w-full h-11 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold"
											onClick={() => buscarBungalows()}
											disabled={buscandoBungalows}
										>
											{buscandoBungalows ? (
												<Loader2 className="animate-spin mr-2" />
											) : (
												<Search className="w-4 h-4 mr-2" />
											)}
											Buscar Disponibles
										</Button>
									</CardContent>
								</Card>

								<Card
									className={`rounded-3xl border-none shadow-sm overflow-hidden bg-white md:col-span-2 border-primary/10 border transition-opacity duration-300 ${visitType === "pase" ? "opacity-50 pointer-events-none grayscale" : ""}`}
								>
									<CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
										<CardTitle className="text-lg flex items-center gap-2">
											<Home className="w-5 h-5 text-primary" /> 2. Selección de
											Bungalows
											{visitType === "pase" && (
												<span className="text-xs font-normal text-muted-foreground ml-2">
													(Deshabilitado para Solo Pase)
												</span>
											)}
										</CardTitle>
										<Badge
											variant="outline"
											className="rounded-full bg-white px-3 font-bold"
										>
											{bungalowsDisponibles?.length || 0} opciones
										</Badge>
									</CardHeader>
									<CardContent className="p-6">
										{buscandoBungalows ? (
											<div className="p-20 text-center space-y-4">
												<Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
												<p className="text-muted-foreground font-medium">
													Buscando bungalows habilitados...
												</p>
											</div>
										) : (
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												{bungalowsDisponibles?.map((b: any) => {
													const isSelected = watchBungalows.includes(
														b.id.toString(),
													);
													return (
														<div
															key={b.id}
															onClick={() => toggleBungalow(b.id.toString())}
															className={`p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
																isSelected
																	? "border-primary bg-primary/5 shadow-md shadow-primary/10"
																	: "border-muted-foreground/10 hover:border-primary/30 bg-muted/5"
															}`}
														>
															<div className="flex justify-between items-start">
																<div>
																	<p className="font-black text-xl text-[#2C3A2C]">
																		{b.nombre || `Bungalow ${b.numero}`}
																	</p>
																	<p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mt-1">
																		CAPACIDAD: {b.capacidad} PERSONAS
																	</p>
																</div>
																<div
																	className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary border-primary rotate-0" : "border-muted rotate-45"}`}
																>
																	{isSelected && (
																		<Save className="w-4 h-4 text-white" />
																	)}
																</div>
															</div>
															<div className="mt-4 flex items-center justify-between">
																<Badge
																	variant="secondary"
																	className="px-3 py-1 bg-white text-muted-foreground border-muted-foreground/20 rounded-lg text-[10px] font-bold"
																>
																	{b.zona || "Área General"}
																</Badge>
																<div className="text-right">
																	<span className="text-[10px] block text-muted-foreground font-bold leading-none">
																		Precio x Noche
																	</span>
																	<span className="font-black text-[#2C3A2C] text-lg">
																		S/ {b.precio_noche || "0.00"}
																	</span>
																</div>
															</div>
														</div>
													);
												})}
												{bungalowsDisponibles?.length === 0 && (
													<div className="col-span-full py-20 text-center border-2 border-dashed border-muted rounded-3xl">
														<Home className="h-12 w-12 text-muted/30 mx-auto mb-4" />
														<p className="text-muted-foreground font-medium">
															No hay bungalows disponibles para el rango y
															tarifa seleccionada.
														</p>
													</div>
												)}
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							<div className="flex justify-end pt-4">
								<Button
									type="button"
									size="lg"
									className="px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
									disabled={
										!watchInicioStr ||
										!watchFinStr ||
										!watchTipoTarifa ||
										!!packageError ||
										(visitType === "bungalow" && watchBungalows.length === 0)
									}
									onClick={() => setStep(2)}
								>
									Continuar con Invitados
									<ArrowLeft className="ml-3 h-5 w-5 rotate-180" />
								</Button>
							</div>
						</div>
					)}

					{/* WIZARD STEP 2: INGRESANTES Y PRIVILEGIOS */}
					{step === 2 && (
						<div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
								{/* Columna Izquierda: Configuración de Privilegios */}
								<div className="space-y-8 lg:col-span-1">
									<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white border-primary/10 border">
										<CardHeader className="bg-muted/30 border-b">
											<CardTitle className="text-lg flex items-center gap-2">
												<ShieldCheck className="w-5 h-5 text-primary" />{" "}
												Configuración
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6">
											<FormField
												control={form.control}
												name="con_privilegio"
												render={({ field }) => (
													<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border-2 border-primary/5 bg-primary/[0.02] p-5">
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={field.onChange}
																className="h-6 w-6 rounded-lg"
															/>
														</FormControl>
														<div className="space-y-1 leading-none">
															<FormLabel className="text-base font-bold text-primary">
																Derecho de Socio
															</FormLabel>
															<FormDescription className="text-[11px] font-medium leading-tight">
																Aplica exoneraciones por convenio titular.
															</FormDescription>
														</div>
													</FormItem>
												)}
											/>
										</CardContent>
									</Card>

									<Card className="rounded-3xl border-none shadow-lg overflow-hidden bg-[#2C3A2C] text-white">
										<CardHeader className="border-b border-white/10">
											<CardTitle className="text-base flex items-center gap-2">
												<Calendar className="w-4 h-4 text-primary" /> Resumen
												Estancia
											</CardTitle>
										</CardHeader>
										<CardContent className="p-6 space-y-4">
											<div className="flex justify-between text-sm">
												<span className="opacity-70 font-medium">Llegada:</span>
												<span className="font-bold">{watchInicioStr}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="opacity-70 font-medium">Salida:</span>
												<span className="font-bold">{watchFinStr}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="opacity-70 font-medium">Tarifa:</span>
												<span className="font-bold">
													{selectedTariff?.nombre}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="opacity-70 font-medium">
													Hospedajes:
												</span>
												<span className="font-bold">
													{watchBungalows.length} seleccionados
												</span>
											</div>
											<Button
												variant="outline"
												type="button"
												className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl mt-2 font-bold"
												onClick={() => setStep(1)}
											>
												Cambiar Estancia
											</Button>
										</CardContent>
									</Card>
								</div>

								{/* Columna Derecha: Listado de Ingresantes */}
								<div className="lg:col-span-2">
									<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white border-primary/10 border">
										<CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-5 px-8">
											<div className="space-y-0.5">
												<CardTitle className="text-lg flex items-center gap-2">
													<Users className="w-5 h-5 text-primary" /> Invitados e
													Ingresantes
												</CardTitle>
												<CardDescription>
													Debes registrar al menos al titular.
												</CardDescription>
											</div>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="h-10 rounded-xl border-primary text-primary hover:bg-primary/5 px-4 font-bold"
												onClick={() =>
													append({
														persona_id: "",
														tipo_entrada_id: "",
														con_cupon: false,
													})
												}
											>
												<Plus className="w-4 h-4 mr-2" /> Agregar Persona
											</Button>
										</CardHeader>
										<CardContent className="p-8 space-y-6">
											{fields.map((field, index) => (
												<div
													key={field.id}
													className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end p-6 border-2 border-dashed border-muted rounded-2xl bg-muted/5 relative animate-in zoom-in-95 duration-300"
												>
													<FormField
														control={form.control}
														name={`ingresantes.${index}.persona_id`}
														render={({ field }) => (
															<FormItem className="md:col-span-5">
																<FormLabel className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
																	Socio / Invitado (UUID)
																</FormLabel>
																<FormControl>
																	<Input
																		placeholder="ID Unico de Persona"
																		className="h-11 bg-white border-muted-foreground/10 rounded-xl text-xs font-medium"
																		{...field}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`ingresantes.${index}.tipo_entrada_id`}
														render={({ field }) => (
															<FormItem className="md:col-span-5">
																<FormLabel className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
																	Tipo de Entrada
																</FormLabel>
																<Select
																	onValueChange={field.onChange}
																	value={field.value}
																>
																	<FormControl>
																		<SelectTrigger className="h-11 bg-white border-muted-foreground/10 rounded-xl">
																			<SelectValue placeholder="Categoría" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent className="rounded-xl border-muted-foreground/10 shadow-2xl">
																		{tiposPases?.map((tipo: any) => (
																			<SelectItem
																				key={tipo.id}
																				value={tipo.id}
																				className="rounded-lg py-3 px-4"
																			>
																				<div className="flex flex-col items-start gap-0.5">
																					<span className="font-bold text-sm">
																						{tipo.nombre}
																					</span>
																					<span className="text-[9px] text-muted-foreground font-black opacity-60">
																						PRECIO BASE: S/ {tipo.precio_base}
																					</span>
																				</div>
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
													<div className="md:col-span-2 flex justify-end">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-11 w-11 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
															onClick={() => remove(index)}
															disabled={fields.length === 1}
														>
															<X className="w-5 h-5" />
														</Button>
													</div>
												</div>
											))}

											<div className="pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-6">
												<Button
													type="button"
													variant="ghost"
													className="text-muted-foreground font-bold hover:bg-muted py-6 px-10 rounded-2xl"
													onClick={() => setStep(1)}
												>
													<ArrowLeft className="mr-2 h-5 w-5" />
													Volver al Paso 1
												</Button>

												<Button
													type="submit"
													size="lg"
													className="w-full md:w-auto px-16 h-16 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
													disabled={isPending || !!packageError}
												>
													{isPending ? (
														<>
															<Loader2 className="animate-spin mr-3 h-6 w-6" />
															REGISTRANDO...
														</>
													) : (
														<>
															<Save className="mr-3 h-6 w-6" />
															FINALIZAR Y REGISTRAR
														</>
													)}
												</Button>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>
						</div>
					)}
				</form>
			</Form>
		</div>
	);
}
