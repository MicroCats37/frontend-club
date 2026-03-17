"use client";

import {
	ArrowLeft,
	Loader2,
	Plus,
	RefreshCw,
	Settings2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCategoriasEntrada } from "@/hooks/visitas/useGetCategoriasEntrada";
import {
	useGetMatrixTarifas,
} from "@/hooks/visitas/usePasesAdmin";
import { TipoEntradaModal } from "./_components/TipoEntradaModal";
import { TipoEntradaCard } from "./_components/TipoEntradaCard";
import { TipoEntradaMatrixModal } from "./_components/TipoEntradaMatrixModal";
import { Badge } from "@/components/ui/badge";
import { Trash2, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";



export default function CategoriasEntradaPage() {
	const {
		data: categorias,
		isLoading,
		refetch,
		isFetching,
	} = useGetCategoriasEntrada();
	const [selectedMatrixId, setSelectedMatrixId] = useState<string | null>(null);
	const [isCatModalOpen, setIsCatModalOpen] = useState(false);
	const [editingCat, setEditingCat] = useState<any>(null);

	const handleEditCat = (cat: any) => {
		setEditingCat(cat);
		setIsCatModalOpen(true);
	};



	return (
		<div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E0E7E0] shadow-sm">
				<div>
					<h1 className="text-2xl font-black text-[#2C3A2C] tracking-tight flex items-center">
						<Settings2 className="mr-3 h-7 w-7 text-primary" />
						Configuración de Entradas
					</h1>
					<p className="text-[#8BA18B] text-sm font-medium">
						Gestiona los tipos de acceso y sus tarifarios generales.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="icon"
						className="rounded-xl h-10 w-10"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						<RefreshCw
							className={`h-4 w-4 text-[#4A5D4A] ${isFetching ? "animate-spin" : ""}`}
						/>
					</Button>
					<Button
						onClick={() => {
							setEditingCat({ nombre: "", descripcion: "", activo: true });
							setIsCatModalOpen(true);
						}}
						className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 text-sm font-bold shadow-sm"
					>
						<Plus className="mr-2 h-4 w-4" />
						Nuevo Tipo de Entrada
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-[300px] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-3 text-muted-foreground font-medium">
						Cargando categorías...
					</span>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{(Array.isArray(categorias)
						? categorias
						: (categorias as any)?.results || []
					)?.map((cat: any) => (
						<TipoEntradaCard
							key={cat.id}
							cat={cat}
							onEdit={handleEditCat}
							onViewMatrix={(id) => setSelectedMatrixId(id)}
						/>
					))}
				</div>
			)}

			<TipoEntradaModal
				isOpen={isCatModalOpen}
				onOpenChange={setIsCatModalOpen}
				editingCat={editingCat}
			/>

			<TipoEntradaMatrixModal
				isOpen={!!selectedMatrixId}
				onOpenChange={(open) => !open && setSelectedMatrixId(null)}
				tipoId={selectedMatrixId}
			/>
		</div>
	);
}

