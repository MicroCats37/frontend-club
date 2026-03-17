"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	Eye,
	Filter,
	Home,
	Plus,
	RefreshCw,
	Search,
	Ticket,
	UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pagination } from "@/components/generic/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetVisitas } from "@/hooks/visitas/useGetVisitas";
import { useVisitaActions } from "@/hooks/visitas/useVisitaActions";

export default function AdminVisitasPage() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [dni, setDni] = useState("");
	const [idPublico, setIdPublico] = useState("");
	const [estado, setEstado] = useState<string>("ALL");

	/* 
	   Acciones removidas de la lista principal para limpiar la UI. 
	   Ahora se gestionan directamente en la página de detalle.
	*/


	const debouncedDni = useDebounce(dni, 500);
	const debouncedIdPublico = useDebounce(idPublico, 500);

	const {
		data: visitsData,
		isLoading,
		isError,
	} = useGetVisitas({
		page,
		page_size: pageSize,
		estado: estado === "ALL" ? undefined : estado,
		dni: debouncedDni || undefined,
		id_publico: debouncedIdPublico || undefined,
	});
	const visitas = visitsData?.results || [];
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
						Pendiente Pago
					</Badge>
				);
			case "PAGADA":
				return (
					<Badge
						variant="outline"
						className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase font-bold text-[10px]"
					>
						Pagada
					</Badge>
				);
			case "CONFIRMADA":
				return (
					<Badge
						variant="outline"
						className="bg-blue-50 text-blue-700 border-blue-200 uppercase font-bold text-[10px]"
					>
						Confirmada
					</Badge>
				);
			case "EN_CURSO":
			case "ACTIVA":
				return (
					<Badge
						variant="outline"
						className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase font-bold text-[10px]"
					>
						En Club
					</Badge>
				);
			case "FINALIZADA":
				return (
					<Badge
						variant="secondary"
						className="bg-slate-50 text-slate-600 border-slate-200 uppercase font-bold text-[10px]"
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

	const handleRowClick = (id: string) => {
		router.push(`/admin/visitas/${id}`);
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
				</div>
			</div>

			{/* Filters and Search Bar */}
			<div className="flex flex-col lg:flex-row gap-4">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8BA18B]" />
					<Input
						placeholder="Escribe DNI para filtrar..."
						value={dni}
						onChange={(e) => {
							setDni(e.target.value);
							setPage(1);
						}}
						className="pl-12 h-12 bg-white border-[#E0E7E0] rounded-2xl shadow-sm focus:ring-primary/20"
					/>
				</div>
				<div className="relative flex-1 group">
					<Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8BA18B]" />
					<Input
						placeholder="ID Público (Ej: 2026-03...)"
						value={idPublico}
						onChange={(e) => {
							setIdPublico(e.target.value);
							setPage(1);
						}}
						className="pl-12 h-12 bg-white border-[#E0E7E0] rounded-2xl shadow-sm focus:ring-primary/20"
					/>
				</div>
				<div className="w-full lg:w-48">
					<Select
						value={estado}
						onValueChange={(val) => {
							setEstado(val);
							setPage(1);
						}}
					>
						<SelectTrigger className="h-12 bg-white border-[#E0E7E0] rounded-2xl shadow-sm font-semibold text-[#4A5D4A] focus:ring-primary/20">
							<div className="flex items-center">
								<Filter className="mr-2 h-4 w-4 text-[#8BA18B]" />
								<SelectValue placeholder="Estado" />
							</div>
						</SelectTrigger>
						<SelectContent className="rounded-2xl border-[#E0E7E0] shadow-xl">
							<SelectItem value="ALL">Todos los estados</SelectItem>
							<SelectItem value="PENDIENTE">Pendiente</SelectItem>
							<SelectItem value="CONFIRMADA">Confirmada</SelectItem>
							<SelectItem value="FINALIZADA">Finalizada</SelectItem>
							<SelectItem value="CANCELADA">Anulada</SelectItem>
						</SelectContent>
					</Select>
				</div>
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
										ID Público
									</th>
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider">
										Registro
									</th>
									<th className="p-4 font-semibold text-sm text-foreground/70 uppercase tracking-wider text-right">
										{/* Columna de acciones removida */}
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
									visitas.map((visita: any) => (
										<tr
											key={visita.id}
											onClick={() => handleRowClick(visita.id)}
											className="hover:bg-muted/10 transition-colors group cursor-pointer"
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
											<td className="p-4 text-center">
												{visita.is_bungalow ? (
													<span className="text-[10px] font-black py-0.5 px-3 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
														Bungalow
													</span>
												) : (
													<span className="text-[10px] font-black py-0.5 px-3 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
														Pase Diario
													</span>
												)}
											</td>
											<td className="p-4">{getEstadoBadge(visita.estado)}</td>
											<td className="p-4">
												<span className="font-mono text-[10px] font-black uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">
													{visita.id_publico || "---"}
												</span>
											</td>
											<td className="p-4 text-xs text-muted-foreground">
												{visita.created_at
													? new Date(visita.created_at).toLocaleDateString()
													: "---"}
											</td>
											<td className="p-4 text-right">
												<div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
													<Button
														variant="ghost"
														size="sm"
														className="rounded-xl bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider gap-2 px-3 h-8"
													>
														Detalle <Eye className="w-3.5 h-3.5" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								{!isLoading && visitas.length === 0 && (
									<tr>
										<td
											colSpan={6}
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

			{visitsData && visitsData.count > 0 && (
				<Pagination
					currentPage={page}
					totalPages={Math.ceil(visitsData.count / pageSize)}
					onPageChange={setPage}
					onPageSizeChange={(size) => {
						setPageSize(size);
						setPage(1);
					}}
					pageSize={pageSize}
					totalItems={visitsData.count}
				/>
			)}


		</div>
	);
}
