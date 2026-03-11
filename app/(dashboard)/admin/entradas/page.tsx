"use client";

import {
	ArrowLeft,
	ChevronRight,
	Loader2,
	MoreVertical,
	Plus,
	RefreshCw,
	Settings2,
	Tag,
	Ticket,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetCategoriasEntrada } from "@/hooks/visitas/useGetCategoriasEntrada";
import {
	useCategoriaActions,
	useGetTarifas,
	useTarifaActions,
} from "@/hooks/visitas/usePasesAdmin";

export default function CategoriasEntradaPage() {
	const {
		data: categorias,
		isLoading,
		refetch,
		isFetching,
	} = useGetCategoriasEntrada();
	const { updateCategoria, createCategoria } = useCategoriaActions();

	const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
	const [isCatModalOpen, setIsCatModalOpen] = useState(false);
	const [editingCat, setEditingCat] = useState<any>(null);

	const handleEditCat = (cat: any) => {
		setEditingCat(cat);
		setIsCatModalOpen(true);
	};

	const handleSaveCat = async () => {
		if (!editingCat.nombre) return toast.error("El nombre es requerido");

		if (editingCat.id) {
			updateCategoria.mutate(editingCat, {
				onSuccess: () => setIsCatModalOpen(false),
			});
		} else {
			createCategoria.mutate(editingCat, {
				onSuccess: () => setIsCatModalOpen(false),
			});
		}
	};

	if (selectedCatId) {
		const cat = categorias?.find((c) => c.id === selectedCatId);
		return (
			<TarifarioView category={cat} onBack={() => setSelectedCatId(null)} />
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E0E7E0] shadow-sm">
				<div>
					<h1 className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight flex items-center">
						<Settings2 className="mr-3 h-8 w-8 text-primary" />
						Gestión de Entradas
					</h1>
					<p className="text-[#8BA18B] mt-1 font-medium">
						Configuración de categorías de acceso y tarifarios.
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="outline"
						size="icon"
						className="rounded-xl h-11 w-11"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						<RefreshCw
							className={`h-5 w-5 text-[#4A5D4A] ${isFetching ? "animate-spin" : ""}`}
						/>
					</Button>
					<Button
						onClick={() => {
							setEditingCat({ nombre: "", descripcion: "", activo: true });
							setIsCatModalOpen(true);
						}}
						className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20"
					>
						<Plus className="mr-2 h-5 w-5" />
						Nueva Categoría
					</Button>
				</div>
			</div>

			{/* List */}
			{isLoading ? (
				<div className="flex h-[300px] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-3 text-muted-foreground font-medium">
						Cargando categorías...
					</span>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{categorias?.map((cat) => (
						<Card
							key={cat.id}
							className="rounded-3xl border-none shadow-sm overflow-hidden bg-white group hover:shadow-md transition-all duration-300"
						>
							<CardHeader className="bg-muted/30 border-b relative">
								<div className="flex justify-between items-start">
									<div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
										<Ticket className="w-6 h-6" />
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="rounded-xl border-muted-foreground/10 shadow-xl"
										>
											<DropdownMenuItem
												onClick={() => handleEditCat(cat)}
												className="rounded-lg"
											>
												Editar Categoría
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => setSelectedCatId(cat.id)}
												className="rounded-lg"
											>
												Ver Tarifas
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													updateCategoria.mutate({
														id: cat.id,
														activo: !cat.activo,
													})
												}
												className={`rounded-lg ${cat.activo ? "text-destructive" : "text-green-600"}`}
											>
												{cat.activo ? "Desactivar" : "Activar"}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								<div className="mt-4">
									<CardTitle className="text-xl font-bold text-[#2C3A2C]">
										{cat.nombre}
									</CardTitle>
									<Badge
										variant="outline"
										className={`mt-2 rounded-full font-bold text-[10px] uppercase tracking-wider ${
											cat.activo
												? "bg-green-50 text-green-700 border-green-200"
												: "bg-red-50 text-red-700 border-red-200"
										}`}
									>
										{cat.activo ? "Activo" : "Inactivo"}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="p-6">
								<p className="text-sm text-muted-foreground leading-relaxed min-h-[40px] line-clamp-2">
									{cat.descripcion || "Sin descripción proporcionada."}
								</p>

								<Button
									onClick={() => setSelectedCatId(cat.id)}
									className="w-full mt-6 rounded-xl bg-[#2C3A2C] text-white font-bold hover:bg-[#1f291f]"
								>
									Gestionar Tarifarios
									<ChevronRight className="ml-2 w-4 h-4" />
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Category Modal */}
			<Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
				<DialogContent className="rounded-[2rem] max-w-md">
					<DialogHeader>
						<DialogTitle>
							{editingCat?.id ? "Editar Categoría" : "Nueva Categoría"}
						</DialogTitle>
						<DialogDescription>
							Define el nombre y descripción para este tipo de entrada.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Nombre del Tipo de Entrada</Label>
							<Input
								value={editingCat?.nombre || ""}
								onChange={(e) =>
									setEditingCat({ ...editingCat, nombre: e.target.value })
								}
								placeholder="Ej: Full Day VIP, Invitado Especial"
								className="rounded-xl"
							/>
						</div>
						<div className="space-y-2">
							<Label>Descripción</Label>
							<Input
								value={editingCat?.descripcion || ""}
								onChange={(e) =>
									setEditingCat({ ...editingCat, descripcion: e.target.value })
								}
								placeholder="Detalles adicionales..."
								className="rounded-xl"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setIsCatModalOpen(false)}>
							Cancelar
						</Button>
						<Button
							onClick={handleSaveCat}
							className="bg-primary text-white rounded-xl px-8"
							disabled={updateCategoria.isPending || createCategoria.isPending}
						>
							Guardar Cambios
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function TarifarioView({
	category,
	onBack,
}: {
	category: any;
	onBack: () => void;
}) {
	const { data: tarifas, isLoading } = useGetTarifas(category?.id);
	const { createTarifa, updateTarifa, deleteTarifa } = useTarifaActions();

	const [isAdding, setIsAdding] = useState(false);
	const [newTarifa, setNewTarifa] = useState({
		tipo_entrada_id: category?.id,
		categoria_usuario: "HABILITADO",
		precios_rango_edad: [{ edad_min: 0, edad_max: 99, precio: 0 }],
	});

	const handleAddTarifa = () => {
		createTarifa.mutate(newTarifa, { onSuccess: () => setIsAdding(false) });
	};

	return (
		<div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-6xl mx-auto pb-10">
			<div className="flex items-center justify-between gap-4 bg-white p-8 rounded-3xl border shadow-sm">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-xl"
						onClick={onBack}
					>
						<ArrowLeft className="h-6 w-6" />
					</Button>
					<div>
						<h1 className="text-3xl font-extrabold text-[#2C3A2C]">
							Tarifario: {category?.nombre}
						</h1>
						<p className="text-muted-foreground font-medium">
							Configura precios por categoría de socio y edad.
						</p>
					</div>
				</div>
				<Button
					onClick={() => setIsAdding(true)}
					className="bg-primary text-white rounded-xl h-11 px-6 font-bold shadow-lg"
				>
					<Plus className="mr-2 h-5 w-5" /> Agregar Categoría de Socio
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{tarifas?.map((t: any) => (
					<Card
						key={t.id}
						className="rounded-3xl border-none shadow-sm overflow-hidden bg-white border-2 border-primary/5"
					>
						<CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
							<div>
								<CardTitle className="text-lg font-bold text-primary">
									{t.categoria_usuario}
								</CardTitle>
								<CardDescription>Precios por rangos de edad</CardDescription>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="text-destructive hover:bg-destructive/10"
								onClick={() => deleteTarifa.mutate(t.id)}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</CardHeader>
						<CardContent className="p-6">
							<div className="space-y-3">
								{t.precios_rango_edad.map((range: any, idx: number) => (
									<div
										key={idx}
										className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-muted-foreground/10"
									>
										<div className="flex flex-col">
											<span className="text-xs font-bold text-muted-foreground uppercase">
												Edad: {range.edad_min} a {range.edad_max}
											</span>
											<span className="text-sm font-black text-primary">
												S/ {range.precio.toFixed(2)}
											</span>
										</div>
										<Tag className="w-4 h-4 text-primary/40" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Modal para agregar tarifa (Socio Categoría) */}
			<Dialog open={isAdding} onOpenChange={setIsAdding}>
				<DialogContent className="max-w-md rounded-[2rem]">
					<DialogHeader>
						<DialogTitle>Nueva Tarifa por Categoría</DialogTitle>
						<DialogDescription>
							Asigna precios para una categoría de socio específica.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Categoría de Socio</Label>
							<select
								className="w-full h-11 rounded-xl border border-muted-foreground/20 px-3"
								value={newTarifa.categoria_usuario}
								onChange={(e) =>
									setNewTarifa({
										...newTarifa,
										categoria_usuario: e.target.value,
									})
								}
							>
								<option value="HABILITADO">Socio Habilitado</option>
								<option value="VITALICIO">Socio Vitalicio</option>
								<option value="INVITADO">Invitado General</option>
								<option value="CONVENIO">Convenio Institucional</option>
							</select>
						</div>
						<div className="space-y-2">
							<Label>Precio General (Por ahora único rango)</Label>
							<Input
								type="number"
								value={newTarifa.precios_rango_edad[0].precio}
								onChange={(e) => {
									const prices = [...newTarifa.precios_rango_edad];
									prices[0].precio = parseFloat(e.target.value);
									setNewTarifa({ ...newTarifa, precios_rango_edad: prices });
								}}
								className="rounded-xl"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setIsAdding(false)}>
							Cancelar
						</Button>
						<Button
							onClick={handleAddTarifa}
							className="bg-primary text-white rounded-xl shadow-lg"
						>
							Guardar Tarifa
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
