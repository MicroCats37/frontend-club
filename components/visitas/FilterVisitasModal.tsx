"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterVisitasModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApply: (filters: { estado: string }) => void;
	currentFilters: { estado: string };
}

export function FilterVisitasModal({
	isOpen,
	onClose,
	onApply,
	currentFilters,
}: FilterVisitasModalProps) {
	const [estado, setEstado] = useState(currentFilters.estado);

	useEffect(() => {
		if (isOpen) {
			setEstado(currentFilters.estado);
		}
	}, [isOpen, currentFilters]);

	const handleApply = () => {
		onApply({ estado });
		onClose();
	};

	const handleReset = () => {
		setEstado("all");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="p-0 overflow-hidden sm:max-w-[450px] rounded-[32px] md:rounded-[40px] border-none shadow-2xl">
				<DialogHeader className="p-6 md:p-8 bg-[#2C3A2C] text-white">
					<div className="flex items-center gap-4">
						<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
							<Filter className="h-5 w-5 md:h-6 md:w-6" />
						</div>
						<div>
							<DialogTitle className="font-black text-lg md:text-xl tracking-tight leading-none mb-1">
								Filtrar Visitas
							</DialogTitle>
							<p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
								Personaliza tu búsqueda
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="p-6 md:p-8 space-y-6 md:space-y-8 bg-white">
					{/* Estado Filter */}
					<div className="space-y-3">
						<label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">
							Estado de la Visita
						</label>
						<Select value={estado} onValueChange={setEstado}>
							<SelectTrigger className="h-12 md:h-14 rounded-2xl md:rounded-3xl border-gray-100 bg-gray-50/50 font-bold focus:ring-primary/20 text-xs md:text-sm">
								<SelectValue placeholder="Selecciona un estado" />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border-gray-100 shadow-xl">
								<SelectItem value="all">Todos los registros</SelectItem>
								<SelectItem value="PENDIENTE">Pendientes de Pago</SelectItem>
								<SelectItem value="CONFIRMADA">Confirmadas / Pagadas</SelectItem>
								<SelectItem value="FINALIZADA">Finalizadas</SelectItem>
								<SelectItem value="CANCELADA">Anuladas</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
					<Button
						variant="ghost"
						onClick={handleReset}
						className="flex-1 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest h-11 md:h-14 border border-transparent hover:border-gray-200"
					>
						Limpiar
					</Button>
					<Button
						onClick={handleApply}
						className="flex-[2] rounded-xl md:rounded-2xl bg-primary hover:bg-[#2C3A2C] text-white font-black text-[10px] md:text-xs uppercase tracking-widest h-11 md:h-14 shadow-xl shadow-primary/10 transition-all active:scale-95"
					>
						Aplicar Filtros
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
