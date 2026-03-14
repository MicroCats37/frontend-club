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
	UserCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
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
	useGetMatrixTarifas,
	useTarifaActions,
	useMatrixUpdate,
	type TipoEntradaMatriz,
	type CategoriaTarifaMatriz
} from "@/hooks/visitas/usePasesAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
		const items = Array.isArray(categorias) ? categorias : (categorias as any)?.results || [];
		const cat = items.find((c: any) => c.id === selectedCatId);
		return (
			<TarifarioView category={cat} onBack={() => setSelectedCatId(null)} />
		);
	}

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
						Nueva Categoría
					</Button>
				</div>
			</div>

			<Tabs defaultValue="matrix" className="space-y-6">
				<TabsList className="bg-white border p-1 rounded-2xl h-12 inline-flex">
					<TabsTrigger value="matrix" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
						<Tag className="mr-2 h-4 w-4" />
						Matriz de Tarifas
					</TabsTrigger>
					<TabsTrigger value="config" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
						<Settings2 className="mr-2 h-4 w-4" />
						Tipos de Entrada
					</TabsTrigger>
				</TabsList>

				<TabsContent value="matrix">
					<TarifariosMatrixView />
				</TabsContent>

				<TabsContent value="config">
					{isLoading ? (
						<div className="flex h-[300px] items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<span className="ml-3 text-muted-foreground font-medium">
								Cargando categorías...
							</span>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{(Array.isArray(categorias) ? categorias : (categorias as any)?.results || [])?.map((cat: any) => (
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
																patch: { activo: !cat.activo },
															} as any)
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
												className={`mt-2 rounded-full font-bold text-[10px] uppercase tracking-wider ${cat.activo
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
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>

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

function TarifariosMatrixView() {
	const { data: matrix, isLoading } = useGetMatrixTarifas();

	if (isLoading) {
		return (
			<div className="flex h-[300px] items-center justify-center bg-white rounded-3xl border shadow-sm">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-3 text-muted-foreground font-medium">
					Cargando matriz de tarifas...
				</span>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
			{matrix?.map((tipo) => (
				<TipoEntradaCard key={tipo.tipo_entrada_id} tipo={tipo} />
			))}
		</div>
	);
}

function TipoEntradaCard({ tipo }: { tipo: TipoEntradaMatriz }) {
	const [localTipo, setLocalTipo] = useState<TipoEntradaMatriz>(() => JSON.parse(JSON.stringify(tipo)));
	const { mutate: updateTipo, isPending } = useMatrixUpdate(tipo.tipo_entrada_id);

	const handleAddRange = (categoriaKey: string) => {
		const updated = { ...localTipo };
		const cat = updated.categorias.find(c => c.categoria === categoriaKey);
		if (cat) {
			const lastRange = cat.precios_rango_edad[cat.precios_rango_edad.length - 1];
			const nextMin = lastRange ? lastRange.edad_max + 1 : 0;
			cat.precios_rango_edad.push({
				edad_min: nextMin,
				edad_max: 99,
				precio: 0
			});
			setLocalTipo(updated);
		}
	};

	const handleRemoveRange = (categoriaKey: string, index: number) => {
		const updated = { ...localTipo };
		const cat = updated.categorias.find(c => c.categoria === categoriaKey);
		if (cat) {
			cat.precios_rango_edad.splice(index, 1);
			setLocalTipo(updated);
		}
	};

	const handleRangeChange = (categoriaKey: string, index: number, field: string, value: any) => {
		const updated = { ...localTipo };
		const cat = updated.categorias.find(c => c.categoria === categoriaKey);
		if (cat) {
			cat.precios_rango_edad[index] = {
				...cat.precios_rango_edad[index],
				[field]: field === 'precio' ? parseFloat(value) || 0 : parseInt(value) || 0
			};
			setLocalTipo(updated);
		}
	};

	return (
		<Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white border-2 border-primary/5 h-fit">
			<CardHeader className="bg-primary/5 border-b py-6 px-8 flex flex-row items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
						<Ticket className="w-6 h-6" />
					</div>
					<div>
						<CardTitle className="text-xl font-black text-primary tracking-tight">
							{localTipo.tipo_entrada_nombre}
						</CardTitle>
						<CardDescription className="text-sm font-medium">
							Gestionar rangos de precio por categoría
						</CardDescription>
					</div>
				</div>
				<Button
					onClick={() => updateTipo(localTipo)}
					disabled={isPending}
					className="bg-primary text-white rounded-xl font-bold shadow-lg px-6 h-10 hover:scale-105 transition-transform"
				>
					{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
					Guardar Tipo
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				<div className="divide-y divide-[#F0F4F0]">
					{localTipo.categorias.map((cat) => (
						<div key={cat.categoria} className="p-6 space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<span className="text-base font-bold text-[#2C3A2C]">
										{cat.nombre_categoria}
									</span>

								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleAddRange(cat.categoria)}
									className="rounded-lg h-8 px-3 text-xs font-bold border-primary/20 text-primary hover:bg-primary/5"
								>
									<Plus className="mr-1 h-3 w-3" />
									Añadir Rango
								</Button>
							</div>

							<div className="space-y-2">
								{cat.precios_rango_edad.length === 0 ? (
									<p className="text-xs text-muted-foreground italic bg-muted/30 p-3 rounded-xl border border-dashed text-center">
										No hay rangos definidos para esta categoría.
									</p>
								) : (
									<div className="grid grid-cols-12 gap-3 mb-2 px-2">
										<div className="col-span-3 text-[10px] font-bold text-muted-foreground uppercase">Edad Mín</div>
										<div className="col-span-3 text-[10px] font-bold text-muted-foreground uppercase">Edad Máx</div>
										<div className="col-span-4 text-[10px] font-bold text-muted-foreground uppercase">Precio (S/)</div>
										<div className="col-span-2"></div>
									</div>
								)}
								{cat.precios_rango_edad.map((range, idx) => (
									<div key={idx} className="grid grid-cols-12 gap-3 items-center group animate-in fade-in slide-in-from-left-2 transition-all">
										<Input
											type="number"
											className="col-span-3 h-9 rounded-lg text-sm font-medium focus-visible:ring-primary border-muted/60"
											value={range.edad_min}
											onChange={(e) => handleRangeChange(cat.categoria, idx, 'edad_min', e.target.value)}
										/>
										<Input
											type="number"
											className="col-span-3 h-9 rounded-lg text-sm font-medium focus-visible:ring-primary border-muted/60"
											value={range.edad_max}
											onChange={(e) => handleRangeChange(cat.categoria, idx, 'edad_max', e.target.value)}
										/>
										<div className="col-span-4 relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/60">S/</span>
											<Input
												type="number"
												step="0.01"
												className="h-9 pl-7 pr-3 rounded-lg text-sm font-black border-none bg-muted/50 focus-visible:ring-primary text-right"
												value={range.precio}
												onChange={(e) => handleRangeChange(cat.categoria, idx, 'precio', e.target.value)}
											/>
										</div>
										<div className="col-span-2 flex justify-end">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => handleRemoveRange(cat.categoria, idx)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
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
	const { createTarifa, deleteTarifa } = useTarifaActions();

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

			{isLoading ? (
				<div className="flex h-[300px] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{(Array.isArray(tarifas) ? tarifas : (tarifas as any)?.results || [])?.map((t: any) => (
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
													S/ {Number(range.precio).toFixed(2)}
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
			)}

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
