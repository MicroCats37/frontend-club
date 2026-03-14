// _components/BungalowCards.tsx
"use client";

import { 
	Edit2, 
	Images, 
	Users, 
	MapPin, 
	Layers,
	ChevronDown,
	DollarSign,
	CheckCircle2, 
	RefreshCcw, 
	AlertCircle,
	Loader2
} from "lucide-react";
import { useBungalows, useUpdateBungalowEstado } from "@/hooks/useBungalows";
import { useState } from "react";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CarouselDots,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

	const handleStatusChange = (e: React.MouseEvent, id: number, nuevoEstado: string) => {
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
				<Button variant="outline" className="mt-4 rounded-xl" onClick={() => refetch()}>
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
						className="group rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white flex flex-col"
					>
						{/* Image Header with Carousel */}
						<div className="relative h-48 overflow-hidden bg-muted group/carousel">
							{bg.imagenes && bg.imagenes.length > 0 ? (
								<Carousel className="w-full h-full">
									<CarouselContent className="h-full ml-0">
										{bg.imagenes.map((img, idx) => (
											<CarouselItem key={img.id} className="h-full pl-0">
												<img 
													src={`${apiUrl}${img.imagen}`} 
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
												className="opacity-0 group-hover/carousel:opacity-100 bg-white/20 hover:bg-white/40 text-white border-none transition-opacity h-8 w-8"
											/>
											<CarouselNext 
												inside 
												variant="ghost" 
												className="opacity-0 group-hover/carousel:opacity-100 bg-white/20 hover:bg-white/40 text-white border-none transition-opacity h-8 w-8"
											/>
											<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
												<CarouselDots className="pt-0 pb-1" />
											</div>
										</>
									)}
								</Carousel>
							) : bg.image_main ? (
								<img 
									src={`${apiUrl}${bg.image_main}`} 
									alt={bg.nombre} 
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							) : (
								<div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/30">
									<Layers className="w-12 h-12 mb-2" />
									<span className="text-xs font-bold uppercase tracking-widest">Sin Imagen</span>
								</div>
							)}
							
							{/* Badges Overlay */}
							<div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
								<Badge className="bg-white/90 backdrop-blur-md text-[#2C3A2C] border-none shadow-sm font-black px-3 py-1 rounded-xl text-xs">
									#{bg.numero}
								</Badge>
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
									<DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] shadow-2xl border-none">
										<DropdownMenuItem 
											onClick={(e) => handleStatusChange(e as any, bg.id, "DISPONIBLE")}
											className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-green-50 focus:bg-green-50 text-green-700 font-bold mb-1"
										>
											<div className="h-2 w-2 rounded-full bg-green-500" />
											Disponible
										</DropdownMenuItem>
										<DropdownMenuItem 
											onClick={(e) => handleStatusChange(e as any, bg.id, "MANTENIMIENTO")}
											className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 text-orange-700 font-bold mb-1"
										>
											<div className="h-2 w-2 rounded-full bg-orange-500" />
											Mantenimiento
										</DropdownMenuItem>
										<DropdownMenuItem 
											onClick={(e) => handleStatusChange(e as any, bg.id, "BLOQUEADO")}
											className="rounded-xl flex items-center gap-2 p-3 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-700 font-bold"
										>
											<div className="h-2 w-2 rounded-full bg-red-500" />
											Bloqueado
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>


						<CardContent className="p-6 flex-1">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="font-extrabold text-xl text-[#2C3A2C] leading-tight">
										{bg.nombre || `Bungalow ${bg.numero}`}
									</h3>
									<p className="text-[10px] text-[#8BA18B] font-mono mt-1 uppercase tracking-tighter opacity-70">
										ID: {String(bg.id).slice(0, 13)}...
									</p>

								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center text-sm font-medium text-[#4A5D4A] bg-muted/20 p-2 rounded-xl">
									<MapPin className="h-4 w-4 mr-2 text-primary/60" />
									<span className="truncate">Zona {bg.zona || "A"}</span>
								</div>
								<div className="flex items-center text-sm font-medium text-[#4A5D4A] bg-muted/20 p-2 rounded-xl">
									<Layers className="h-4 w-4 mr-2 text-primary/60" />
									<span>Piso {bg.piso || 1}</span>
								</div>
								<div className="col-span-2 flex items-center text-sm font-medium text-[#4A5D4A] bg-primary/5 p-2 rounded-xl border border-primary/10">
									<Users className="h-4 w-4 mr-2 text-primary" />
									<span>Capacidad: {bg.capacidad} personas</span>
								</div>
							</div>
							
							{bg.descripcion && (
								<p className="text-xs text-[#8BA18B] mt-4 line-clamp-2 italic leading-relaxed">
									"{bg.descripcion}"
								</p>
							)}
						</CardContent>

						<CardFooter className="p-4 pt-0 gap-2">
							<Button
								variant="outline"
								className="flex-1 h-11 rounded-xl border-[#E0E7E0] text-[#4A5D4A] hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-bold group/btn"
								onClick={() => onEditDetails(bg)}
							>
								<Edit2 className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
								Editar
							</Button>
							<Button
								variant="outline"
								className="h-11 w-11 p-0 rounded-xl border-[#E0E7E0] text-[#4A5D4A] hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
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
		<div className="flex items-center gap-1.5">
			{estado}
			{withChevron && <ChevronDown className="h-3 w-3 opacity-50" />}
		</div>
	);

	switch (estado) {
		case "DISPONIBLE":
			return (
				<Badge className="bg-green-500 text-white border-none shadow-lg shadow-green-500/20 font-black px-3 py-1 rounded-xl text-[10px] cursor-pointer hover:bg-green-600 transition-colors">
					{content}
				</Badge>
			);
		case "MANTENIMIENTO":
			return (
				<Badge className="bg-orange-500 text-white border-none shadow-lg shadow-orange-500/20 font-black px-3 py-1 rounded-xl text-[10px] cursor-pointer hover:bg-orange-600 transition-colors">
					{content}
				</Badge>
			);
		case "BLOQUEADO":
			return (
				<Badge className="bg-red-500 text-white border-none shadow-lg shadow-red-500/20 font-black px-3 py-1 rounded-xl text-[10px] cursor-pointer hover:bg-red-600 transition-colors">
					{content}
				</Badge>
			);
		default:
			return (
				<Badge variant="outline" className="bg-white/90 backdrop-blur-sm cursor-pointer">
					{content}
				</Badge>
			);
	}
}
