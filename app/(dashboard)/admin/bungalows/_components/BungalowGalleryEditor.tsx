"use client";

import {
	ImagePlus,
	Images,
	Loader2,
	RefreshCcw,
	Save,
	Trash2,
	X,
	GripVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useBatchGallery } from "@/hooks/useBungalows";
import type {
	BatchGaleriaItem,
	Bungalow,
} from "@/schemas/alojamiento/bungalow";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CarouselDots,
} from "@/components/ui/carousel";


import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BungalowGalleryEditorProps {
	bungalow: Bungalow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface TempImage {
	id?: number | string;
	preview: string;
	file?: File;
	deleted?: boolean;
	orden: number;
	dndId: string; // ID estable para dnd-kit
}

function SortableImage({ 
	img, 
	index, 
	onRemove 
}: { 
	img: TempImage; 
	index: number; 
	onRemove: (index: number) => void 
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: img.dndId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : "auto",
		opacity: isDragging ? 0.3 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
				img.deleted 
					? "border-destructive/50 opacity-50 grayscale" 
					: "border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20"
			}`}
		>
			<img
				src={img.preview}
				alt="Miniatura"
				className="w-full h-full object-cover select-none"
			/>
			
			{/* Draggable Area - Solo el ícono de grip si se desea, o toda la imagen */}
			<div 
				{...attributes} 
				{...listeners}
				className="absolute top-2 left-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 text-slate-400 hover:text-primary"
			>
				<GripVertical className="h-4 w-4" />
			</div>

			<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
				<button
					type="button"
					onClick={() => onRemove(index)}
					className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-30 ${
						img.deleted ? "bg-primary text-white" : "bg-white text-destructive"
					}`}
				>
					{img.deleted ? (
						<RefreshCcw className="h-5 w-5" />
					) : (
						<Trash2 className="h-5 w-5" />
					)}
				</button>
			</div>

			{img.deleted && (
				<div className="absolute top-2 right-2 bg-destructive text-white px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider z-30">
					Eliminar
				</div>
			)}
			
			{!img.deleted && (
				<div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[9px] font-mono z-10">
					#{img.orden}
				</div>
			)}
		</div>
	);
}

export default function BungalowGalleryEditor({
	bungalow,
	open,
	onOpenChange,
}: BungalowGalleryEditorProps) {
	if (!bungalow) return null;

	const [tempImages, setTempImages] = useState<TempImage[]>([]);
	const [isDraggingFiles, setIsDraggingFiles] = useState(false);
	const batchMutation = useBatchGallery(bungalow.id);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		if (open && bungalow) {
			if (bungalow?.imagenes) {
				setTempImages(
					bungalow.imagenes.map((img) => ({
						id: img.id,
						preview: getImageUrl(img.imagen),
						orden: img.orden || 0,
						dndId: `existente-${img.id}`,
					})).sort((a, b) => a.orden - b.orden),
				);
			} else {
				setTempImages([]);
			}
		}
	}, [bungalow, open]);

	const getImageUrl = (url: string) => {
		if (url.startsWith("http")) return url;
		return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
	};

	const processFiles = (files: FileList | File[]) => {
		const nextOrder = tempImages.length > 0 
			? Math.max(...tempImages.map(img => img.orden)) + 1 
			: 1;

		const newImages = Array.from(files).map((file, index) => ({
			preview: URL.createObjectURL(file),
			file,
			orden: nextOrder + index,
			dndId: `nuevo-${Math.random().toString(36).substring(7)}`,
		}));

		setTempImages((prev) => [...prev, ...newImages]);
		toast.success(`${newImages.length} imágenes añadidas para subir`);
	};

	const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) processFiles(e.target.files);
	};

	const handleRemoveImage = (index: number) => {
		setTempImages((prev) =>
			prev.map((item, i) =>
				i === index ? { ...item, deleted: !item.deleted } : item,
			),
		);
	};

	// Handlers para Drag & Drop de archivos externos
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Solo activar si lo que se arrastra son archivos
		if (e.dataTransfer.types.includes("Files")) {
			setIsDraggingFiles(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingFiles(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingFiles(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			processFiles(files);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setTempImages((items) => {
				const oldIndex = items.findIndex((i) => i.dndId === active.id);
				const newIndex = items.findIndex((i) => i.dndId === over.id);

				const reordered = arrayMove(items, oldIndex, newIndex);
				
				// Reasignar órdenes basados en la nueva posición
				return reordered.map((img, idx) => ({
					...img,
					orden: idx + 1
				}));
			});
		}
	};

	const handleSaveGallery = async () => {
		const ops: any[] = [];

		// Enviar todo el lote
		for (const img of tempImages) {
			if (img.deleted) {
				if (img.id) ops.push({ action: "DELETE", id: img.id });
			} else if (!img.id) {
				// Es nueva
				ops.push({ 
					action: "CREATE", 
					file: img.file,
					orden: img.orden
				});
			} else {
				// Es existente, verificar si cambió de orden (opcionalmente)
				const original = bungalow.imagenes?.find(i => i.id === img.id);
				if (original && original.orden !== img.orden) {
					ops.push({
						action: "UPDATE",
						id: img.id,
						orden: img.orden
					});
				}
			}
		}

		if (ops.length === 0) {
			toast.info("No hay cambios pendientes");
			return;
		}

		try {
			await batchMutation.mutateAsync(ops);
			toast.success("Galería actualizada correctamente");
			onOpenChange(false);
		} catch (_error) {
			toast.error("Error al actualizar la galería");
		}
	};

	const activeImages = tempImages.filter(img => !img.deleted);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent 
				className="w-[95vw] sm:max-w-[800px] border-none shadow-2xl rounded-t-3xl sm:rounded-3xl p-0 overflow-hidden bg-white max-h-[95vh] sm:max-h-[90vh]"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				{/* Overlay para Arrastre de Archivos (VISIBLE SOLO AL ARRASTRAR) */}
				{isDraggingFiles && (
					<div className="absolute inset-0 z-[100] bg-primary/20 backdrop-blur-[4px] border-4 border-dashed border-primary flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
						<div className="bg-white p-10 rounded-full shadow-[0_0_50px_rgba(var(--primary),0.3)] mb-6 border-4 border-primary/20">
							<ImagePlus className="h-16 w-16 text-primary animate-bounce" />
						</div>
						<h2 className="text-4xl font-black text-primary tracking-tighter mb-2">
							¡SUELTA AQUÍ!
						</h2>
						<p className="text-primary font-bold text-lg bg-white/50 px-4 py-1 rounded-full">
							Sube tus fotos instantáneamente
						</p>
					</div>
				)}

				<DialogHeader className="p-6 bg-[#FBFCFB] border-b border-[#E0E7E0]">
					<DialogTitle className="text-2xl font-bold text-[#2C3A2C] flex items-center">
						<Images className="h-6 w-6 mr-2 text-primary" />
						Galería: {bungalow.nombre}
					</DialogTitle>
				</DialogHeader>

				<div className="p-0 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
					{/* Vista previa con Carrusel */}
					{activeImages.length > 0 && (
						<div className="bg-slate-50 p-4 sm:p-8 flex justify-center border-b border-[#E0E7E0]">
							<Carousel className="w-full max-w-md">
								<div className="relative group/modal-carousel">
									<CarouselContent>
										{activeImages.map((img, index) => (
											<CarouselItem key={img.dndId}>
												<div className="aspect-video relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
													<img
														src={img.preview}
														alt={`Vista ${index}`}
														className="w-full h-full object-cover"
													/>
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
									{activeImages.length > 1 && (
										<>
											<CarouselPrevious inside variant="default" className="bg-white/90 hover:bg-white text-primary border-none shadow-lg -left-4" />
											<CarouselNext inside variant="default" className="bg-white/90 hover:bg-white text-primary border-none shadow-lg -right-4" />
										</>
									)}
								</div>
								<CarouselDots className="mt-2" />
							</Carousel>
						</div>
					)}


					<div className="p-4 sm:p-8 space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-bold text-[#4A5D4A]">
									Gestionar Imágenes
								</h3>
								<p className="text-sm text-[#8BA18B]">
									Arrastra para reordenar o suelta archivos aquí para subirlos.
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="rounded-xl relative h-10 border-primary/20 text-primary hover:bg-primary/5 font-bold"
							>
								<ImagePlus className="h-4 w-4 mr-2" />
								Añadir Fotos
								<input
									type="file"
									multiple
									className="absolute inset-0 opacity-0 cursor-pointer"
									onChange={handleAddImages}
									accept="image/*"
								/>
							</Button>
						</div>

						{/* Zona de Drop Permanente + Grid */}
						<div className="space-y-4">
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={tempImages.map(img => img.dndId)}
									strategy={rectSortingStrategy}
								>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-1">
										{/* INPUT / DROPZONE PERMANENTE */}
										<div 
											className="relative group aspect-square rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center"
											onClick={() => document.getElementById("file-input")?.click()}
										>
											<ImagePlus className="h-8 w-8 text-primary/60 group-hover:text-primary mb-2 transition-transform group-hover:scale-110" />
											<span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
												Arrastra o haz click
											</span>
											<input
												id="file-input"
												type="file"
												multiple
												className="absolute inset-0 opacity-0 cursor-pointer"
												onChange={handleAddImages}
												accept="image/*"
											/>
										</div>

										{tempImages.map((img, index) => (
											<SortableImage 
												key={img.dndId} 
												img={img} 
												index={index} 
												onRemove={handleRemoveImage} 
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>
						</div>
					</div>
				</div>


				<DialogFooter className="p-4 sm:p-6 bg-[#FBFCFB] border-t border-[#E0E7E0] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
					<Button
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="rounded-xl font-medium"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSaveGallery}
						className="rounded-xl px-10 shadow-lg font-bold"
						disabled={batchMutation.isPending}
					>
						{batchMutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						{tempImages.some(img => img.deleted || !img.id) ? "Guardar Cambios" : "Cerrar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

