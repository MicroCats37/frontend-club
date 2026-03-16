"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	Calendar as CalendarIcon,
	Filter,
	Plus,
	Search,
	TreeDeciduous,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";
import BungalowAddModal from "./_components/BungalowAddModal";
import BungalowCards from "./_components/BungalowCards";
import BungalowDetailsEditor from "./_components/BungalowDetailsEditor";
import BungalowGalleryEditor from "./_components/BungalowGalleryEditor";

export default function BungalowsAdminPage() {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [galleryOpen, setGalleryOpen] = useState(false);
	const [addOpen, setAddOpen] = useState(false);

	const [selectedBungalow, setSelectedBungalow] = useState<Bungalow | null>(
		null,
	);
	const queryClient = useQueryClient();

	const handleEditDetails = (bungalow: Bungalow) => {
		setSelectedBungalow(bungalow);
		setDetailsOpen(true);
	};

	const handleManageGallery = (bungalow: Bungalow) => {
		setSelectedBungalow(bungalow);
		setGalleryOpen(true);
	};

	const _handleRefresh = () => {
		queryClient.invalidateQueries({ queryKey: ["bungalows"] });
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E0E7E0] shadow-sm">
				<div>
					<h1 className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight flex items-center">
						<TreeDeciduous className="mr-3 h-8 w-8 text-primary" />
						Gestión de Bungalows
					</h1>
					<p className="text-[#8BA18B] mt-1 font-medium">
						Administra el inventario, estados y galerías de los alojamientos.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Link href="/admin/bungalows-estadia">
						<Button
							variant="outline"
							className="h-12 px-6 rounded-2xl border-[#E0E7E0] text-primary bg-primary/5 hover:bg-primary/10 shadow-sm font-black uppercase text-xs tracking-widest"
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							Ver Calendario de Estadía
						</Button>
					</Link>
					<Button
						onClick={() => setAddOpen(true)}
						className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-black uppercase text-xs tracking-widest"
					>
						<Plus className="mr-2 h-4 w-4" />
						Nuevo Bungalow
					</Button>
				</div>
			</div>

			{/* Filters and Search Bar */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8BA18B] group-focus-within:text-primary transition-colors" />
					<Input
						placeholder="Buscar por nombre, número o zona..."
						className="pl-12 h-12 bg-white border-[#E0E7E0] rounded-2xl focus:ring-primary/20 transition-all shadow-sm"
					/>
				</div>
				<Button
					variant="outline"
					className="h-12 px-6 rounded-2xl border-[#E0E7E0] text-[#4A5D4A] bg-white shadow-sm font-semibold"
				>
					<Filter className="mr-2 h-4 w-4" />
					Filtrar por Estado
				</Button>
			</div>

			{/* Main Content: Cards instead of Table */}
			<BungalowCards
				onEditDetails={handleEditDetails}
				onManageGallery={handleManageGallery}
			/>

			{/* Editor Modals - Solo se montan si hay un bungalow seleccionado para evitar errores de reconciliación */}
			{selectedBungalow && (
				<>
					<BungalowDetailsEditor
						open={detailsOpen}
						onOpenChange={setDetailsOpen}
						bungalow={selectedBungalow}
					/>

					<BungalowGalleryEditor
						open={galleryOpen}
						onOpenChange={setGalleryOpen}
						bungalow={selectedBungalow}
					/>
				</>
			)}

			<BungalowAddModal open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
}
