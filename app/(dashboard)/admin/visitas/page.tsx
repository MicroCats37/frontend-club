"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle,
	Eye,
	Filter,
	Home,
	Plus,
	RefreshCw,
	Search,
	Ticket,
	UserCheck,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetVisitas } from "@/hooks/visitas/useGetVisitas";
import { useVisitaActions } from "@/hooks/visitas/useVisitaActions";

export default function AdminVisitasPage() {
	const { data: visitas, isLoading, isError } = useGetVisitas();
	const { cancelarVisita, liquidarVisita } = useVisitaActions();
	const queryClient = useQueryClient();

	const handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["visitas"] });
	};

	const getEstadoBadge = (estado: string) => {
		switch (estado) {
			case "PENDIENTE":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase font-bold text-[10px]"
					>
						Pendiente
					</Badge>
				);
			case "CONFIRMADA":
				return (
					<Badge
						variant="outline"
						className="bg-green-50 text-green-700 border-green-200 uppercase font-bold text-[10px]"
					>
						Confirmada
					</Badge>
				);
			case "FINALIZADA":
				return (
					<Badge
						variant="secondary"
						className="bg-blue-50 text-blue-700 border-blue-200 uppercase font-bold text-[10px]"
					>
						Finalizada
					</Badge>
				);
			case "CANCELADA":
				return (
					<Badge
						variant="destructive"
						className="bg-red-50 text-red-700 border-red-200 uppercase font-bold text-[10px]"
					>
						Anulada
					</Badge>
				);
			default:
				return <Badge variant="outline">{estado}</Badge>;
		}
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E0E7E0] shadow-sm">
				<div>
					<h1 className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight flex items-center">
						<UserCheck className="mr-3 h-8 w-8 text-primary" />
						Control de Visitas
					</h1>
					<p className="text-[#8BA18B] mt-1 font-medium">
						Administra el ingreso de socios, invitados y estancias en bungalows.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="icon"
						className="rounded-xl border-[#E0E7E0] text-[#4A5D4A]"
						onClick={handleRefresh}
					>
						<RefreshCw
							className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</Button>
					<Link href="/admin/entradas">
						<Button
							variant="outline"
							className="rounded-xl border-[#E0E7E0] text-[#4A5D4A] hover:bg-muted"
						>
							<Ticket className="mr-2 h-4 w-4" />
							Gestión Entradas
						</Button>
					</Link>
					<Link href="/admin/visitas/nuevo-pase">
						<Button
							variant="outline"
							className="rounded-xl border-primary text-primary hover:bg-primary/5"
						>
							<Plus className="mr-2 h-4 w-4" />
							Pase Diario
						</Button>
					</Link>
					<Link href="/admin/visitas/nuevo-bungalow">
						<Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all">
							<Home className="mr-2 h-4 w-4" />
							Registrar Bungalow
						</Button>
					</Link>
				</div>
			</div>

			{/* Filters and Search Bar */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8BA18B]" />
					<Input
						placeholder="Buscar por titular, DNI o número de registro..."
						className="pl-12 h-12 bg-white border-[#E0E7E0] rounded-2xl shadow-sm"
					/>
				</div>
				<Button
					variant="outline"
					className="h-12 px-6 rounded-2xl border-[#E0E7E0] text-[#4A5D4A] bg-white shadow-sm font-semibold"
				>
					<Filter className="mr-2 h-4 w-4" />
					Filtrar Estados
				</Button>
			</div>

			{/* Content Table Card */}
			<Card className="border shadow-none rounded-3xl overflow-hidden">
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-muted/30 border-b border-muted">
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider">
										Titular
									</th>
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider">
										Tipo
									</th>
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider">
										Estado
									</th>
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider">
										Registro
									</th>
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider text-right">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-muted">
								{isLoading && (
									<tr>
										<td
											colSpan={5}
											className="p-12 text-center text-muted-foreground italic"
										>
											Cargando lista de visitas...
										</td>
									</tr>
								)}
								{isError && (
									<tr>
										<td colSpan={5} className="p-12 text-center text-red-500">
											Error al cargar los datos.
										</td>
									</tr>
								)}
								{!isLoading &&
									visitas?.map((visita: any) => (
										<tr
											key={visita.id}
											className="hover:bg-muted/10 transition-colors group"
										>
											<td className="p-4">
												<div className="flex flex-col text-sm">
													<span className="font-bold text-[#2C3A2C]">
														{visita.titular?.nombre_completo ||
															"Socio Desconocido"}
													</span>
													<span className="text-xs text-muted-foreground">
														DNI: {visita.titular?.dni || "---"}
													</span>
												</div>
											</td>
											<td className="p-4">
												{visita.reserva_asociada ? (
													<span className="text-[10px] font-black py-0.5 px-2 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
														Bungalow
													</span>
												) : (
													<span className="text-[10px] font-black py-0.5 px-2 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
														Pase Diario
													</span>
												)}
											</td>
											<td className="p-4">{getEstadoBadge(visita.estado)}</td>
											<td className="p-4 text-xs text-muted-foreground">
												{visita.created_at
													? new Date(visita.created_at).toLocaleDateString()
													: "---"}
											</td>
											<td className="p-4 text-right">
												<div className="flex justify-end gap-1.5">
													<Link href={`/admin/visitas/${visita.id}`}>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 rounded-lg hover:bg-primary/10"
														>
															<Eye className="w-4 h-4" />
														</Button>
													</Link>
													{visita.estado === "PENDIENTE" && (
														<>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 rounded-lg text-green-600 hover:bg-green-50"
																onClick={() => liquidarVisita.mutate(visita.id)}
																disabled={liquidarVisita.isPending}
															>
																<CheckCircle className="w-4 h-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
																onClick={() => cancelarVisita.mutate(visita.id)}
																disabled={cancelarVisita.isPending}
															>
																<XCircle className="w-4 h-4" />
															</Button>
														</>
													)}
												</div>
											</td>
										</tr>
									))}
								{!isLoading && visitas?.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className="p-20 text-center text-muted-foreground"
										>
											No hay visitas registradas.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
