"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowLeft,
	Calendar,
	Loader2,
	Plus,
	Save,
	Ticket,
	Users,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
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
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";
import { useIniciarVisitaPases } from "@/hooks/visitas/useIniciarVisitaPases";
import {
	type RegistroVisitaPases,
	RegistroVisitaPasesSchema,
} from "@/schemas/visita";

export default function NuevoPasePage() {
	const router = useRouter();
	const registrar = useIniciarVisitaPases();
	const { data: tiposPases, isLoading: loadingTipos } = useGetTiposPases();

	const form = useForm<RegistroVisitaPases>({
		resolver: zodResolver(RegistroVisitaPasesSchema),
		defaultValues: {
			fecha_inicio: new Date().toISOString().split("T")[0],
			fecha_fin: new Date().toISOString().split("T")[0],
			ingresantes: [{ persona_id: "", tipo_entrada_id: "", con_cupon: false }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "ingresantes",
	});

	const onSubmit = (data: RegistroVisitaPases) => {
		if (data.ingresantes.length === 0) {
			toast.error("Debes agregar al menos un ingresante");
			return;
		}

		registrar.mutate(data, {
			onSuccess: () => {
				toast.success("Visita con pases diarios registrada");
				router.push("/admin/visitas");
			},
			onError: (err: any) => {
				toast.error(err?.response?.data?.message || "Error al registrar pase");
			},
		});
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
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
							<Ticket className="mr-3 h-8 w-8 text-primary" />
							Registro de Pases Diarios
						</h1>
						<p className="text-[#8BA18B] mt-1 font-medium">
							Emisión de tickets de acceso rápido para socios e invitados.
						</p>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* SECCION 1: VIGENCIA */}
					<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
						<CardHeader className="bg-muted/30 border-b">
							<CardTitle className="text-lg flex items-center gap-2">
								<Calendar className="w-5 h-5 text-primary" /> Vigencia de la
								Visita
							</CardTitle>
							<CardDescription>
								Define el rango de fechas para los pases.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
							<FormField
								control={form.control}
								name="fecha_inicio"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
											Válido Desde
										</FormLabel>
										<FormControl>
											<Input
												type="date"
												className="h-12 bg-muted/5 border-muted-foreground/10 rounded-xl"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="fecha_fin"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-xs text-muted-foreground uppercase font-semibold">
											Válido Hasta
										</FormLabel>
										<FormControl>
											<Input
												type="date"
												className="h-12 bg-muted/5 border-muted-foreground/10 rounded-xl"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* SECCION 2: INVITADOS Y PASES */}
					<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
						<CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-5 px-8">
							<div className="space-y-0.5">
								<CardTitle className="text-lg flex items-center gap-2">
									<Users className="w-5 h-5 text-primary" /> Personas e
									Ingresantes
								</CardTitle>
								<CardDescription>
									Asigna el tipo de pase a cada visitante.
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
											<FormItem className="md:col-span-5">
												<FormLabel className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
													ID Persona / DNI
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
											<FormItem className="md:col-span-5">
												<FormLabel className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
													Tipo de Pase Diario
												</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger className="h-11 bg-white border-muted-foreground/10 rounded-xl focus:ring-primary/20">
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
																<div className="flex flex-col items-start">
																	<span className="font-bold">
																		{tipo.nombre}
																	</span>
																	<span className="text-[10px] text-muted-foreground">
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

					{/* Footer / Submission */}
					<div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#2C3A2C] p-8 rounded-[2rem] shadow-xl shadow-primary/10 border border-primary/20">
						<div className="flex items-start gap-4 text-white/80">
							<div className="p-2 bg-white/10 rounded-lg">
								<Ticket className="h-6 w-6 text-primary-foreground" />
							</div>
							<div className="space-y-1">
								<p className="font-bold text-white">Resumen Administrativo</p>
								<p className="text-xs leading-relaxed opacity-70 max-w-sm">
									Se generará una pre-visita con estado PENDIENTE. El ingreso se
									valida al confirmar el pago en caja.
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
								Cancelar
							</Button>
							<Button
								type="submit"
								size="lg"
								className="flex-1 md:flex-none px-10 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
								disabled={registrar.isPending}
							>
								{registrar.isPending ? (
									<>
										<Loader2 className="animate-spin mr-3 h-5 w-5" />
										Registrando...
									</>
								) : (
									<>
										<Save className="mr-3 h-5 w-5" />
										Confirmar Registro
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
