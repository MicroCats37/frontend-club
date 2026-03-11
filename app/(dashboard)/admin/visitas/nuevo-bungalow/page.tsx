"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import { useBungalowsDisponibilidad } from "@/hooks/useBungalows";
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
			con_privilegio: false,
			ingresantes: [{ persona_id: "", tipo_entrada_id: "", con_cupon: false }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "ingresantes",
	});

	const watchFechas = form.watch(["fecha_llegada", "fecha_salida"]);
	const {
		data: bungalowsDisponibles,
		isLoading: buscandoBungalows,
		refetch: buscarBungalows,
	} = useBungalowsDisponibilidad({
		f_inicio: watchFechas[0] || "",
		f_fin: watchFechas[1] || "",
	});

	const selectedBungalows = form.watch("bungalow_ids");

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
					{/* SECCIÓN 1: FECHAS Y BUSQUEDA */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white md:col-span-1">
							<CardHeader className="bg-muted/30 border-b">
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="w-5 h-5 text-primary" /> Estancia
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								<FormField
									control={form.control}
									name="fecha_llegada"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
												Llegada (Check-in)
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													className="h-11 rounded-xl"
													{...field}
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
											<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
												Salida (Check-out)
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													className="h-11 rounded-xl"
													{...field}
												/>
											</FormControl>
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

						{/* SECCIÓN 2: SELECCIÓN BUNGALOWS */}
						<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white md:col-span-2">
							<CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
								<CardTitle className="text-lg flex items-center gap-2">
									<Home className="w-5 h-5 text-primary" /> Bungalows
									Disponibles
								</CardTitle>
								<Badge variant="outline" className="rounded-full">
									{bungalowsDisponibles?.length || 0} opciones
								</Badge>
							</CardHeader>
							<CardContent className="p-6">
								{buscandoBungalows ? (
									<div className="p-10 text-center text-muted-foreground italic">
										Verificando disponibilidad...
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{bungalowsDisponibles?.map((b: any) => {
											const isSelected = selectedBungalows.includes(
												b.id.toString(),
											);
											return (
												<div
													key={b.id}
													onClick={() => toggleBungalow(b.id.toString())}
													className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
														isSelected
															? "border-primary bg-primary/5 shadow-md"
															: "border-muted-foreground/10 hover:border-primary/30"
													}`}
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-black text-lg text-[#2C3A2C]">
																{b.nombre || `Bungalow ${b.numero}`}
															</p>
															<p className="text-xs text-muted-foreground font-semibold">
																CAPACIDAD: {b.capacidad} PERSONAS
															</p>
														</div>
														<div
															className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-muted"}`}
														>
															{isSelected && (
																<Save className="w-3 h-3 text-white" />
															)}
														</div>
													</div>
													<div className="mt-3 flex items-center justify-between text-xs">
														<span className="bg-muted px-2 py-0.5 rounded-full font-bold">
															{b.zona || "Área General"}
														</span>
														<span className="font-black text-primary">
															S/ {b.precio_noche || "0.00"} / noche
														</span>
													</div>
												</div>
											);
										})}
										{bungalowsDisponibles?.length === 0 && (
											<div className="col-span-full py-10 text-center text-muted-foreground opacity-50">
												No hay bungalows disponibles en estas fechas.
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* SECCIÓN 3: BENEFICIOS Y CONFIG */}
					<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
						<CardHeader className="bg-muted/30 border-b">
							<CardTitle className="text-lg flex items-center gap-2">
								<ShieldCheck className="w-5 h-5 text-primary" /> Privilegios y
								Beneficios
							</CardTitle>
						</CardHeader>
						<CardContent className="p-8">
							<FormField
								control={form.control}
								name="con_privilegio"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-2xl border-2 border-primary/5 bg-primary/[0.02] p-6 shadow-sm">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className="h-6 w-6 rounded-lg translate-y-1"
											/>
										</FormControl>
										<div className="space-y-1.5 leading-none">
											<FormLabel className="text-lg font-bold text-primary">
												Aplicar Privilegio de Socio (Exoneración)
											</FormLabel>
											<FormDescription className="text-sm font-medium">
												Al marcar esta casilla, se aplicarán tarifas
												preferenciales o exoneraciones según el convenio del
												socio titular.
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* SECCIÓN 4: INGRESANTES */}
					<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
						<CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-5 px-8">
							<div className="space-y-0.5">
								<CardTitle className="text-lg flex items-center gap-2">
									<Users className="w-5 h-5 text-primary" /> Integrantes de la
									Estadía
								</CardTitle>
								<CardDescription>
									Registra a todas las personas que ocuparán el bungalow.
								</CardDescription>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-10 rounded-xl border-primary text-primary hover:bg-primary/5 px-4 font-semibold"
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
									className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end p-6 border-2 border-dashed border-muted rounded-2xl bg-muted/5 relative animate-in fade-in slide-in-from-right-2 duration-300"
								>
									<FormField
										control={form.control}
										name={`ingresantes.${index}.persona_id`}
										render={({ field }) => (
											<FormItem className="md:col-span-12 lg:col-span-5">
												<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
													Socio / Invitado (ID)
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Ingresa UUID de la persona"
														className="h-11 bg-white border-muted-foreground/10 rounded-xl"
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
											<FormItem className="md:col-span-10 lg:col-span-5">
												<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
													Vínculo / Categoría
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="h-11 bg-white border-muted-foreground/10 rounded-xl">
															<SelectValue placeholder="Selecciona categoría" />
														</SelectTrigger>
													</FormControl>
													<SelectContent className="rounded-xl border-muted-foreground/10 shadow-xl">
														{tiposPases?.map((tipo: any) => (
															<SelectItem
																key={tipo.id}
																value={tipo.id}
																className="rounded-lg py-2.5"
															>
																<div className="flex flex-col items-start text-xs">
																	<span className="font-bold">
																		{tipo.nombre}
																	</span>
																	<span className="text-[10px] text-muted-foreground opacity-70 italic">
																		S/ {tipo.precio_base} base
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
											className="h-11 w-11 text-destructive hover:bg-destructive/10 rounded-xl"
											onClick={() => remove(index)}
											disabled={fields.length === 1}
										>
											<X className="w-5 h-5" />
										</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Footer Actions */}
					<div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#2C3A2C] p-8 rounded-[2rem] shadow-xl shadow-primary/10 border border-primary/20">
						<div className="flex items-start gap-4 text-white/80">
							<div className="p-2 bg-white/10 rounded-lg">
								<ShieldCheck className="h-6 w-6 text-primary-foreground" />
							</div>
							<div className="space-y-1">
								<p className="font-bold text-white">Validación de Registro</p>
								<p className="text-xs leading-relaxed opacity-70 max-w-sm">
									Se validarán las fechas y la membresía del socio titular al
									procesar el registro. Las llaves se entregan previa validación
									de pago.
								</p>
							</div>
						</div>
						<div className="flex gap-4 w-full md:w-auto">
							<Button
								type="button"
								variant="ghost"
								className="flex-1 md:flex-none text-white hover:bg-white/10 rounded-xl"
								onClick={() => router.back()}
							>
								Salir
							</Button>
							<Button
								type="submit"
								size="lg"
								className="flex-1 md:flex-none px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg transition-transform active:scale-95"
								disabled={registrar.isPending}
							>
								{registrar.isPending ? (
									<>
										<Loader2 className="animate-spin mr-3 h-5 w-5" />
										PROCESANDO...
									</>
								) : (
									<>
										<Save className="mr-3 h-5 w-5" />
										REGISTRAR TODO
									</>
								)}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
