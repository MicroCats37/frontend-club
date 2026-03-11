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
		<div className="bg-white rounded-2xl shadow-sm border border-[#E0E7E0] overflow-hidden">
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
											<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold">
												{bg.numero}
											</div>
											<div>
												<p className="font-semibold text-[#2C3A2C]">
													{bg.nombre}
												</p>
												<p className="text-xs text-[#8BA18B]">ID: {bg.id}</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm">
											<p className="text-[#4A5D4A]">{bg.zona || "General"}</p>
											<p className="text-xs text-[#8BA18B]">
												Piso {bg.piso || 1}
											</p>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center text-sm font-medium text-[#4A5D4A]">
											<Users className="h-4 w-4 mr-2 text-[#8BA18B]" />
											{bg.capacidad} personas
										</div>
									</td>
									<td className="px-6 py-4">{renderEstadoBadge(bg.estado)}</td>
									<td className="px-6 py-4 text-right space-x-2">
										<Button
											variant="outline"
											size="sm"
											className="h-8 border-[#E0E7E0] text-[#4A5D4A] hover:bg-[#F8FAF8]"
											onClick={() => onEditDetails(bg)}
										>
											<Edit2 className="h-3.5 w-3.5 mr-2" />
											Editar
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="h-8 border-[#E0E7E0] text-[#4A5D4A] hover:bg-[#F8FAF8]"
											onClick={() => onManageGallery(bg)}
										>
											<Images className="h-3.5 w-3.5 mr-2" />
											Galería
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
	switch (estado) {
		case "DISPONIBLE":
			return (
				<Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100 font-bold px-3">
					DISPONIBLE
				</Badge>
			);
		case "MANTENIMIENTO":
			return (
				<Badge className="bg-orange-100 text-orange-700 border-none hover:bg-orange-100 font-bold px-3">
					MANTENIMIENTO
				</Badge>
			);
		case "BLOQUEADO":
			return (
				<Badge className="bg-red-100 text-red-700 border-none hover:bg-red-100 font-bold px-3">
					BLOQUEADO
				</Badge>
			);
		default:
			return <Badge variant="outline">{estado}</Badge>;
	}
}
