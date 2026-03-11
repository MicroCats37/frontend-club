"use client";

import {
	Calendar,
	CheckCircle,
	ChevronLeft,
	Clock,
	CreditCard,
	Edit,
	Home,
	Loader2,
	Printer,
	User,
	Users,
	XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetVisitaDetail } from "@/hooks/visitas/useGetVisitaDetail";
import { useVisitaActions } from "@/hooks/visitas/useVisitaActions";

export default function VisitaDetailPage() {
	const { id } = useParams();
	const router = useRouter();
	const { data: visita, isLoading, isError } = useGetVisitaDetail(id as string);
	const { liquidarVisita, cancelarVisita } = useVisitaActions();

	const getEstadoBadge = (estado: string) => {
		switch (estado) {
			case "PENDIENTE":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-50 text-yellow-700 border-yellow-200"
					>
						Pendiente de Pago
					</Badge>
				);
			case "CONFIRMADA":
				return (
					<Badge
						variant="outline"
						className="bg-green-50 text-green-700 border-green-200"
					>
						Confirmada / Activa
					</Badge>
				);
			case "FINALIZADA":
				return <Badge variant="secondary">Finalizada</Badge>;
			case "CANCELADA":
				return <Badge variant="destructive">Anulada</Badge>;
			default:
				return <Badge variant="outline">{estado}</Badge>;
		}
	};

	if (isLoading)
		return (
			<div className="flex h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-3 text-muted-foreground">
					Cargando detalles de la visita...
				</span>
			</div>
		);

	if (isError || !visita)
		return (
			<div className="p-10 text-center">
				<p className="text-destructive font-semibold">
					No se pudo cargar la información de la visita.
				</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.back()}
				>
					Regresar
				</Button>
			</div>
		);

	return (
		<div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
			{/* Header / Navigation */}
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					className="rounded-xl"
					onClick={() => router.back()}
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Volver al Listado
				</Button>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="rounded-xl h-9 border-muted-foreground/20"
					>
						<Printer className="mr-2 h-4 w-4" />
						Imprimir Ticket
					</Button>
					{visita.estado === "PENDIENTE" && (
						<Button
							variant="outline"
							size="sm"
							className="rounded-xl h-9 border-muted-foreground/20"
						>
							<Edit className="mr-2 h-4 w-4" />
							Editar
						</Button>
					)}
				</div>
			</div>

			{/* Main Title Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-8 bg-white border rounded-3xl shadow-sm">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<Badge
							variant="secondary"
							className="bg-primary/5 text-primary border-primary/10 text-xs px-2.5 py-0.5"
						>
							Visita #{visita.id.slice(0, 8)}
						</Badge>
						{getEstadoBadge(visita.estado)}
					</div>
					<h1 className="text-4xl font-extrabold text-[#2C3A2C] tracking-tight">
						{visita.titular?.nombre_completo || "Socio Titular"}
					</h1>
					<div className="flex items-center text-[#8BA18B] mt-2 font-medium">
						<User className="w-4 h-4 mr-1.5" />
						ID: {visita.titular?.id || "---"} | DNI:{" "}
						{visita.titular?.dni || "---"}
					</div>
				</div>
				{visita.estado === "PENDIENTE" && (
					<div className="flex gap-3 w-full md:w-auto">
						<Button
							variant="destructive"
							className="flex-1 md:flex-none rounded-xl h-12 px-6"
							onClick={() => {
								if (confirm("¿Estás seguro de anular esta visita?"))
									cancelarVisita.mutate(visita.id);
							}}
							disabled={cancelarVisita.isPending}
						>
							<XCircle className="mr-2 h-5 w-5" />
							Anular
						</Button>
						<Button
							className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 shadow-lg shadow-primary/20"
							onClick={() => {
								if (confirm("¿Confirmar recepción de pago y activar visita?"))
									liquidarVisita.mutate(visita.id);
							}}
							disabled={liquidarVisita.isPending}
						>
							<CheckCircle className="mr-2 h-5 w-5" />
							Confirmar Pago
						</Button>
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Column 1: Details */}
				<div className="md:col-span-2 space-y-6">
					{/* Estancia Info */}
					<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
						<CardHeader className="bg-muted/30 border-b">
							<CardTitle className="text-lg flex items-center gap-2">
								<Clock className="w-5 h-5 text-primary" /> Detalles de la
								Estancia
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
									Tipo de Visita
								</p>
								<div className="flex items-center text-lg font-semibold">
									{visita.reserva_asociada ? (
										<>
											<Home className="mr-2 h-5 w-5 text-blue-500" /> Bungalow /
											Alojamiento
										</>
									) : (
										<>
											<Calendar className="mr-2 h-5 w-5 text-emerald-500" />{" "}
											Pase Diario / Full Day
										</>
									)}
								</div>
							</div>
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
									Fecha de Registro
								</p>
								<p className="text-lg font-semibold">
									{visita.created_at
										? new Date(visita.created_at).toLocaleString()
										: "---"}
								</p>
							</div>
							{visita.reserva_asociada && (
								<>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
											Check-In
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
											Check-Out
										</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Ingresantes Table */}
					<Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
						<CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
							<CardTitle className="text-lg flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" /> Lista de Ingresantes
							</CardTitle>
							<Badge variant="outline" className="rounded-full px-3">
								{visita.lista_ingresantes?.ingresantes?.length || 0} personas
							</Badge>
						</CardHeader>
						<CardContent className="p-0">
							<table className="w-full text-left border-collapse">
								<thead className="bg-muted/10">
									<tr>
										<th className="p-4 text-xs font-bold uppercase text-muted-foreground">
											Persona
										</th>
										<th className="p-4 text-xs font-bold uppercase text-muted-foreground text-center">
											DNI
										</th>
										<th className="p-4 text-xs font-bold uppercase text-muted-foreground text-center">
											Tipo Entrada
										</th>
										<th className="p-4 text-xs font-bold uppercase text-muted-foreground text-right">
											Monto
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{visita.lista_ingresantes?.ingresantes?.map((ing: any) => (
										<tr
											key={ing.id}
											className="hover:bg-muted/5 transition-colors"
										>
											<td className="p-4 font-medium text-[#2C3A2C] capitalize">
												{ing.persona?.nombre_completo || "---"}
											</td>
											<td className="p-4 text-center text-sm font-mono">
												{ing.persona?.dni || "---"}
											</td>
											<td className="p-4 text-center">
												<Badge
													variant="outline"
													className="text-[10px] font-bold"
												>
													{ing.tipo_entrada?.nombre || "Invitado"}
												</Badge>
											</td>
											<td className="p-4 text-right font-bold text-primary">
												S/ {ing.precio_final || "0.00"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</CardContent>
					</Card>
				</div>

				{/* Column 2: Resumen Económico */}
				<div className="space-y-6">
					<Card className="rounded-3xl border-2 border-primary/10 shadow-lg shadow-primary/5 bg-primary/[0.01] overflow-hidden">
						<CardHeader className="bg-primary/5 border-b border-primary/10">
							<CardTitle className="text-lg flex items-center gap-2 text-primary">
								<CreditCard className="w-5 h-5" /> Resumen de Cobro
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm py-1">
									<span className="text-muted-foreground">
										Subtotal Entradas
									</span>
									<span className="font-semibold italic">
										S/{" "}
										{visita.lista_ingresantes?.ingresantes
											?.reduce(
												(acc: number, cur: any) =>
													acc + (cur.precio_final || 0),
												0,
											)
											.toFixed(2)}
									</span>
								</div>
								{visita.reserva_asociada && (
									<div className="flex justify-between text-sm py-1">
										<span className="text-muted-foreground">
											Costo Alojamiento
										</span>
										<span className="font-semibold">
											S/{" "}
											{(
												Number(visita.reserva_asociada.precio_total) || 0
											).toFixed(2)}
										</span>
									</div>
								)}
								<div className="border-t border-primary/10 pt-4 mt-2 flex justify-between items-end">
									<span className="text-primary font-bold">TOTAL A PAGAR</span>
									<span className="text-3xl font-black text-primary">
										S/{" "}
										{visita.reserva_asociada?.precio_total
											? visita.reserva_asociada.precio_total
											: visita.lista_ingresantes?.ingresantes
													?.reduce(
														(acc: number, cur: any) =>
															acc + (cur.precio_final || 0),
														0,
													)
													.toFixed(2)}
									</span>
								</div>
							</div>

							<div className="pt-4">
								{visita.estado === "PENDIENTE" ? (
									<div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
										<CreditCard className="w-5 h-5 text-orange-500 mt-0.5" />
										<div className="text-xs text-orange-800 leading-relaxed font-medium">
											Esperando validación de pago en caja. La visita no está
											activa hasta la confirmación.
										</div>
									</div>
								) : (
									<div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-start gap-3">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
										<div className="text-xs text-green-800 leading-relaxed font-medium">
											Pago validado correctamente. Registro financiero
											sincronizado con la cuenta corriente.
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* QR / Acceso Rápido mockups if needed */}
				</div>
			</div>
		</div>
	);
}
