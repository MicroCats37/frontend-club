// _components/BungalowCards.tsx
"use client";

import {
	ChevronDown,
	Edit2,
	Images,
	Layers,
	MapPin,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useBungalows, useUpdateBungalowEstado } from "@/hooks/useBungalows";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";

interface BungalowCardsProps {
	onEditDetails: (bungalow: Bungalow) => void;
	onManageGallery: (bungalow: Bungalow) => void;
}

export default function BungalowCards({
	onEditDetails,
	onManageGallery,
}: BungalowCardsProps) {
	const { data: rows, isLoading, isError, refetch } = useBungalows();
	const updateStatusMutation = useUpdateBungalowEstado();

	const handleStatusChange = (
		e: React.MouseEvent,
		id: number,
		nuevoEstado: string,
	) => {
		e.preventDefault();
		e.stopPropagation();
		updateStatusMutation.mutate({ id, data: { estado: nuevoEstado } });
	};

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Skeleton key={i} className="h-[380px] w-full rounded-3xl" />
				))}
			</div>
		);
	}

	if (isError || !rows) {
		return (
			<div className="text-center p-10 border-2 border-dashed rounded-[2rem] bg-white">
				<p className="text-destructive font-medium">
					Error al cargar la lista de bungalows.
				</p>
				<Button
					variant="outline"
					className="mt-4 rounded-xl"
					onClick={() => refetch()}
				>
					Reintentar
				</Button>
			</div>
		);
	}

	const bungalows = (rows || []) as Bungalow[];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{bungalows.length === 0 ? (
				<div className="col-span-full py-20 text-center text-[#8BA18B] bg-white rounded-[2rem] border-2 border-dashed">
					No hay bungalows registrados.
				</div>
			) : (
				bungalows.map((bg: Bungalow) => (
					<Card
						key={bg.id}
						className="group relative rounded-[2px] border-[#E0E7E0] shadow-none hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 overflow-hidden bg-white flex flex-col"
					>
						{/* Image Header with Carousel */}
						<div className="relative h-56 overflow-hidden bg-[#F8FAF8] group/carousel">
							{bg.imagenes && bg.imagenes.length > 0 ? (
								<Carousel className="w-full h-full">
									<CarouselContent className="h-full ml-0">
										{bg.imagenes.map((img, idx) => (
											<CarouselItem key={img.id} className="h-full pl-0">
												<img
													src={resolveImageUrl(img.imagen)}
													alt={`${bg.nombre} ${idx + 1}`}
													className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
												/>
											</CarouselItem>
										))}
									</CarouselContent>
									{bg.imagenes.length > 1 && (
										<>
											<CarouselPrevious
												inside
												variant="ghost"
												className="opacity-0 group-hover/carousel:opacity-100 bg-black/20 hover:bg-black/40 text-white border-none transition-opacity h-8 w-8 rounded-[2px]"
											/>
											<CarouselNext
												inside
												variant="ghost"
												className="opacity-0 group-hover/carousel:opacity-100 bg-black/20 hover:bg-black/40 text-white border-none transition-opacity h-8 w-8 rounded-[2px]"
											/>
											<div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
												{bg.imagenes.map((_, i) => (
													<div
														key={i}
														className="w-1.5 h-1.5 bg-white/40 rounded-full transition-all group-hover:bg-white/60"
													/>
												))}
											</div>
										</>
									)}
								</Carousel>
							) : bg.image_main ? (
								<img
									src={resolveImageUrl(bg.image_main)}
									alt={bg.nombre}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							) : (
								<div className="w-full h-full flex flex-col items-center justify-center text-[#8BA18B]/30 bg-[#F0F4F0]">
									<Layers className="w-10 h-10 mb-2 opacity-20" />
									<span className="text-[9px] font-black uppercase tracking-[0.2em]">
										Sin Imagen
									</span>
								</div>
							)}

							{/* Asymmetric Badge Overlay */}
							<div className="absolute top-0 left-0 z-10">
								<div className="bg-[#111827] text-white font-black px-4 py-2 text-[10px] tracking-widest uppercase">
									BNG-{bg.numero}
								</div>
							</div>

							<div className="absolute top-4 right-4 z-10">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											className="outline-none focus:ring-0"
											onClick={(e) => e.stopPropagation()}
										>
											{renderEstadoBadge(bg.estado, true)}
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="end"
										className="rounded-2xl p-2 min-w-[160px] shadow-2xl border-none"
									>
										<DropdownMenuItem
											onClick={(e) =>
												handleStatusChange(e as any, bg.id, "DISPONIBLE")
											}
											className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-green-50 focus:bg-green-50 text-green-700 font-bold mb-1"
										>
											<div className="h-2 w-2 rounded-full bg-green-500" />
											Disponible
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) =>
												handleStatusChange(e as any, bg.id, "MANTENIMIENTO")
											}
											className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 text-orange-700 font-bold mb-1"
										>
											<div className="h-2 w-2 rounded-full bg-orange-500" />
											Mantenimiento
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) =>
												handleStatusChange(e as any, bg.id, "BLOQUEADO")
											}
											className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-700 font-bold"
										>
											<div className="h-2 w-2 rounded-full bg-red-500" />
											Bloqueado
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>

						<CardContent className="p-8 flex-1 flex flex-col">
							<div className="mb-6">
								<h3 className="font-black text-xl text-[#111827] leading-tight tracking-tight uppercase mb-1">
									{bg.nombre || `Bungalow ${bg.numero}`}
								</h3>
								<div className="flex items-center gap-2">
									<MapPin className="h-3 w-3 text-emerald-600" />
									<p className="text-[10px] text-[#8BA18B] font-black uppercase tracking-widest">
										Zona {bg.zona || "A"} • Piso {bg.piso || 1}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-3 mb-6">
								<div className="flex items-center justify-between p-4 bg-[#F8FAF8] border border-[#E0E7E0] hover:border-emerald-100 transition-colors">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-[2px] bg-emerald-50 flex items-center justify-center">
											<Users className="h-4 w-4 text-emerald-700" />
										</div>
										<span className="text-[10px] font-black text-[#111827] uppercase tracking-wider">
											Capacidad Máxima
										</span>
									</div>
									<span className="text-sm font-black text-emerald-800">
										{bg.capacidad} Pers.
									</span>
								</div>
							</div>

							{bg.descripcion && (
								<div className="mt-auto pt-4 border-t border-dashed border-[#E0E7E0]">
									<p className="text-[11px] text-[#8BA18B] leading-relaxed italic line-clamp-2">
										{bg.descripcion}
									</p>
								</div>
							)}
						</CardContent>

						<CardFooter className="p-0 flex border-t border-[#E0E7E0]">
							<Button
								variant="ghost"
								className="flex-1 h-14 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-[#4A5D4A] hover:bg-emerald-50 hover:text-emerald-900 border-r border-[#E0E7E0] transition-all"
								onClick={() => onEditDetails(bg)}
							>
								<Edit2 className="h-4 w-4 mr-2" />
								Configurar
							</Button>
							<Button
								variant="ghost"
								className="w-16 h-14 rounded-none text-[#4A5D4A] hover:bg-emerald-50 hover:text-emerald-900 transition-all"
								onClick={() => onManageGallery(bg)}
								title="Ver Galería"
							>
								<Images className="h-5 w-5" />
							</Button>
						</CardFooter>
					</Card>
				))
			)}
		</div>
	);
}

function renderEstadoBadge(estado: string, withChevron = false) {
	const content = (
		<div className="flex items-center gap-2">
			<div
				className={cn(
					"w-1.5 h-1.5 rounded-full animate-pulse",
					estado === "DISPONIBLE" ? "bg-white" : "bg-white/80",
				)}
			/>
			<span>{estado}</span>
			{withChevron && <ChevronDown className="h-3 w-3 opacity-50" />}
		</div>
	);

	const baseClass =
		"border-none shadow-none font-black px-4 py-2 rounded-[2px] text-[9px] tracking-[0.15em] cursor-pointer transition-all uppercase";

	switch (estado) {
		case "DISPONIBLE":
			return (
				<Badge
					className={cn(
						baseClass,
						"bg-emerald-600 text-white hover:bg-emerald-700",
					)}
				>
					{content}
				</Badge>
			);
		case "MANTENIMIENTO":
			return (
				<Badge
					className={cn(
						baseClass,
						"bg-orange-500 text-white hover:bg-orange-600",
					)}
				>
					{content}
				</Badge>
			);
		case "BLOQUEADO":
			return (
				<Badge
					className={cn(baseClass, "bg-red-600 text-white hover:bg-red-700")}
				>
					{content}
				</Badge>
			);
		default:
			return (
				<Badge
					variant="outline"
					className={cn(baseClass, "bg-white text-[#111827] border-[#E0E7E0]")}
				>
					{content}
				</Badge>
			);
	}
}
