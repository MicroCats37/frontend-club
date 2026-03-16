"use client";

import { Edit2, Images, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBungalows } from "@/hooks/useBungalows";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";

interface BungalowTableProps {
	onEditDetails: (bungalow: Bungalow) => void;
	onManageGallery: (bungalow: Bungalow) => void;
}

export default function BungalowTable({
	onEditDetails,
	onManageGallery,
}: BungalowTableProps) {
	const { data: rows, isLoading, isError, refetch } = useBungalows();

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-16 w-full rounded-xl" />
				))}
			</div>
		);
	}

	if (isError || !rows) {
		return (
			<div className="text-center p-10 border-2 border-dashed rounded-2xl bg-white">
				<p className="text-destructive font-medium">
					Error al cargar la lista de bungalows.
				</p>
				<Button variant="outline" className="mt-4" onClick={() => refetch()}>
					Reintentar
				</Button>
			</div>
		);
	}

	const bungalows = rows || [];

	return (
		<div className="bg-white rounded-none shadow-none border border-[#E0E7E0] overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-[#FBFCFB] border-b border-[#E0E7E0]">
							<th className="px-6 py-4 text-xs font-bold text-[#4A5D4A] uppercase tracking-wider">
								Bungalow
							</th>
							<th className="px-6 py-4 text-xs font-bold text-[#4A5D4A] uppercase tracking-wider">
								Zona / Piso
							</th>
							<th className="px-6 py-4 text-xs font-bold text-[#4A5D4A] uppercase tracking-wider">
								Capacidad
							</th>
							<th className="px-6 py-4 text-xs font-bold text-[#4A5D4A] uppercase tracking-wider">
								Estado
							</th>
							<th className="px-6 py-4 text-xs font-bold text-[#4A5D4A] uppercase tracking-wider text-right">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F0F4F0]">
						{bungalows.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-6 py-10 text-center text-[#8BA18B]"
								>
									No hay bungalows registrados.
								</td>
							</tr>
						) : (
							bungalows.map((bg: Bungalow) => (
								<tr
									key={bg.id}
									className="hover:bg-[#F8FAF8] transition-colors group"
								>
									<td className="px-6 py-4">
										<div className="flex items-center">
											<div className="h-10 w-10 rounded-[2px] bg-emerald-50 flex items-center justify-center mr-4 text-emerald-800 font-black text-xs border border-emerald-100">
												{bg.numero}
											</div>
											<div>
												<p className="font-black text-[#111827] uppercase tracking-tight">
													{bg.nombre}
												</p>
												<p className="text-[10px] text-[#8BA18B] font-black uppercase tracking-widest mt-0.5">
													ID: {String(bg.id).slice(0, 8)}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-[11px]">
											<p className="text-[#111827] font-black uppercase tracking-wider">
												{bg.zona || "General"}
											</p>
											<p className="text-[10px] text-[#8BA18B] font-medium uppercase mt-0.5">
												Piso {bg.piso || 1}
											</p>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center text-[11px] font-black text-[#111827] uppercase tracking-wider">
											<Users className="h-4 w-4 mr-2 text-emerald-600" />
											{bg.capacidad} Pers.
										</div>
									</td>
									<td className="px-6 py-4">{renderEstadoBadge(bg.estado)}</td>
									<td className="px-6 py-4 text-right space-x-2">
										<Button
											variant="ghost"
											size="sm"
											className="h-9 rounded-none text-[10px] font-black uppercase tracking-widest text-[#4A5D4A] hover:bg-emerald-50 hover:text-emerald-900 border border-transparent hover:border-emerald-100 transition-all"
											onClick={() => onEditDetails(bg)}
										>
											<Edit2 className="h-3.5 w-3.5 mr-2" />
											Configurar
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="h-9 w-9 rounded-none text-[#4A5D4A] hover:bg-emerald-50 hover:text-emerald-900 border border-transparent hover:border-emerald-100 transition-all"
											onClick={() => onManageGallery(bg)}
										>
											<Images className="h-4 w-4" />
										</Button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function renderEstadoBadge(estado: string) {
	const baseClass =
		"border-none shadow-none font-black px-3 py-1.5 rounded-[2px] text-[8px] tracking-[0.15em] transition-all uppercase";
	const dot = (
		<div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
	);

	switch (estado) {
		case "DISPONIBLE":
			return (
				<Badge
					className={`${baseClass} bg-emerald-600 text-white flex items-center gap-2`}
				>
					{dot} DISPONIBLE
				</Badge>
			);
		case "MANTENIMIENTO":
			return (
				<Badge
					className={`${baseClass} bg-orange-500 text-white flex items-center gap-2`}
				>
					{dot} MANTENIMIENTO
				</Badge>
			);
		case "BLOQUEADO":
			return (
				<Badge
					className={`${baseClass} bg-red-600 text-white flex items-center gap-2`}
				>
					{dot} BLOQUEADO
				</Badge>
			);
		default:
			return (
				<Badge variant="outline" className={baseClass}>
					{estado}
				</Badge>
			);
	}
}
