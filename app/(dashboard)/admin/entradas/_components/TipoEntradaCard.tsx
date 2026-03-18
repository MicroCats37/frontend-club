"use client";

import { ImageIcon, MoreVertical, Ticket, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveImageUrl } from "@/lib/utils";
import { useCategoriaActions } from "@/hooks/visitas/usePasesAdmin";

interface TipoEntradaCardProps {
	cat: any;
	onEdit: (cat: any) => void;
	onViewMatrix: (catId: string) => void;
}

export function TipoEntradaCard({
	cat,
	onEdit,
	onViewMatrix,
}: TipoEntradaCardProps) {
	const { updateCategoria } = useCategoriaActions();

	return (
		<Card className="rounded-[2.5rem] border-none shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] overflow-hidden bg-white group hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col hover:-translate-y-1">
			<div className="relative h-48 overflow-hidden bg-[#F8FAF8]">
				{cat.image_main ? (
					<img
						src={resolveImageUrl(cat.image_main)}
						alt={cat.nombre}
						className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center text-[#8BA18B]/30">
						<div className="p-4 rounded-3xl bg-white shadow-inner mb-3">
							<ImageIcon className="w-10 h-10 opacity-20" />
						</div>
						<span className="text-[10px] font-black uppercase tracking-[0.3em]">
							Sin Imagen
						</span>
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
				
				<div className="absolute top-5 right-5 z-10">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="secondary"
								size="icon"
								className="h-10 w-10 rounded-2xl shadow-xl border-none bg-white/90 backdrop-blur-md hover:bg-white transition-all hover:scale-110 active:scale-95"
							>
								<MoreVertical className="h-5 w-5 text-[#2C3A2C]" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-3xl border-[#E0E7E0] shadow-[0_16px_32px_-8px_rgba(0,0,0,0.12)] p-3 min-w-[200px] backdrop-blur-xl bg-white/95"
						>
							<DropdownMenuItem
								onClick={() => onEdit(cat)}
								className="rounded-2xl focus:bg-primary/10 focus:text-primary font-bold py-3 px-4 cursor-pointer"
							>
								Editar Detalles
							</DropdownMenuItem>
							<div className="h-px bg-[#E0E7E0] my-2 mx-2" />
							<DropdownMenuItem
								onClick={() =>
									updateCategoria.mutate({
										id: cat.id,
										data: { activo: !cat.activo },
									} as any)
								}
								className={`rounded-2xl font-bold py-3 px-4 cursor-pointer ${
									cat.activo
										? "text-destructive focus:text-destructive focus:bg-destructive/5"
										: "text-green-600 focus:text-green-600 focus:bg-green-50"
								}`}
							>
								{cat.activo ? "Desactivar Entrada" : "Activar Entrada"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="absolute bottom-5 left-6 flex items-center gap-3">
					<Badge
						className={`rounded-full font-black text-[10px] px-4 py-1.5 uppercase tracking-widest shadow-lg border-none animate-in fade-in slide-in-from-bottom-2 duration-700 ${
							cat.activo ? "bg-green-500 text-white" : "bg-red-500 text-white"
						}`}
					>
						{cat.activo ? "Canal Activo" : "Canal Inactivo"}
					</Badge>
				</div>
			</div>

			<CardHeader className="p-8 pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 mb-2 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
						<Ticket className="w-4 h-4 text-primary" />
						<span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8BA18B]">
							Tipo de Acceso
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onEdit(cat)}
						className="h-8 w-8 rounded-xl text-[#8BA18B] hover:text-primary hover:bg-primary/5 transition-all"
						title="Editar información básica"
					>
						<Settings2 className="w-4 h-4" />
					</Button>
				</div>
				<CardTitle className="text-2xl font-black text-[#2C3A2C] tracking-tight group-hover:text-primary transition-colors duration-500">
					{cat.nombre}
				</CardTitle>
			</CardHeader>
			
			<CardContent className="p-8 pt-0 flex-1">
				<p className="text-sm text-[#8BA18B] font-medium leading-relaxed line-clamp-2 italic">
					{cat.descripcion || "Sin descripción detallada para este tipo de entrada."}
				</p>
				
				<div className="mt-8 pt-6 border-t border-[#E0E7E0]">
					<Button
						onClick={() => onViewMatrix(cat.id)}
						className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] h-12 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
					>
						Gestionar Matriz de Precios
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
