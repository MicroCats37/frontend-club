"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	GripVertical,
	ImagePlus,
	Images,
	Loader2,
	RefreshCcw,
	Save,
	Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useBatchGallery } from "@/hooks/useBungalows";
import { resolveImageUrl } from "@/lib/utils";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";

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
	onRemove,
}: {
	img: TempImage;
	index: number;
	onRemove: (index: number) => void;
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
			className={`group relative aspect-square rounded-[2px] overflow-hidden border transition-all ${
				img.deleted
					? "border-red-200 opacity-50 grayscale"
					: "border-[#E0E7E0] shadow-none hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200"
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
				className="absolute top-2 left-2 bg-white/90 backdrop-blur-md p-1.5 rounded-[2px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20 text-[#8BA18B] hover:text-emerald-700"
			>
				<GripVertical className="h-4 w-4" />
			</div>

			<div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(index);
					}}
					className={`h-10 w-10 rounded-[2px] flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-30 ${
						img.deleted ? "bg-emerald-600 text-white" : "bg-white text-red-600"
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
				<div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-widest z-30">
					Eliminar
				</div>
			)}

			{!img.deleted && (
				<div className="absolute bottom-2 right-2 bg-emerald-950/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-[2px] text-[8px] font-black z-10">
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
	const gridInputRef = useRef<HTMLInputElement>(null);
	const topInputRef = useRef<HTMLInputElement>(null);
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
		}),
	);

	useEffect(() => {
		if (open && bungalow) {
			if (bungalow?.imagenes) {
				setTempImages(
					bungalow.imagenes
						.map((img) => ({
							id: img.id,
							preview: resolveImageUrl(img.imagen),
							orden: img.orden || 0,
							dndId: `existente-${img.id}`,
						}))
						.sort((a, b) => a.orden - b.orden),
				);
			} else {
				setTempImages([]);
			}
		}
	}, [bungalow, open]);

	const processFiles = (files: FileList | File[]) => {
		const nextOrder =
			tempImages.length > 0
				? Math.max(...tempImages.map((img) => img.orden)) + 1
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
					orden: idx + 1,
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
					orden: img.orden,
				});
			} else {
				// Es existente, verificar si cambió de orden (opcionalmente)
				const original = bungalow.imagenes?.find((i) => i.id === img.id);
				if (original && original.orden !== img.orden) {
					ops.push({
						action: "UPDATE",
						id: img.id,
						orden: img.orden,
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

	const activeImages = tempImages.filter((img) => !img.deleted);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="w-[95vw] sm:max-w-[1000px] border-none shadow-2xl rounded-none p-0 overflow-hidden bg-white h-[95vh] sm:h-[90vh] flex flex-col"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				{/* Overlay para Arrastre de Archivos (VISIBLE SOLO AL ARRASTRAR) */}
				{isDraggingFiles && (
					<div className="absolute inset-0 z-[100] bg-emerald-900/10 backdrop-blur-[4px] border-4 border-dashed border-emerald-600 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
						<div className="bg-white p-12 rounded-none shadow-2xl mb-6 border-2 border-emerald-100">
							<ImagePlus className="h-16 w-16 text-emerald-600 animate-bounce" />
						</div>
						<h2 className="text-4xl font-black text-emerald-900 tracking-tighter mb-2 uppercase">
							¡SUELTA AQUÍ!
						</h2>
						<p className="text-emerald-700 font-black text-sm uppercase tracking-widest bg-white/80 px-6 py-2 rounded-[2px]">
							Sube tus fotos instantáneamente
						</p>
					</div>
				)}

				<DialogHeader className="p-6 sm:p-8 bg-[#FBFCFB] border-b border-[#E0E7E0] flex-none">
					<DialogTitle className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tighter uppercase flex items-center">
						<Images className="h-6 w-6 sm:h-8 sm:w-8 mr-4 text-emerald-600" />
						Galería: {bungalow.nombre}
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
					{/* Vista previa con Carrusel */}
					{activeImages.length > 0 && (
						<div className="bg-slate-50 p-4 sm:p-8 flex justify-center border-b border-[#E0E7E0]">
							<Carousel className="w-full max-w-md">
								<div className="relative group/modal-carousel">
									<CarouselContent>
										{activeImages.map((img, index) => (
											<CarouselItem key={img.dndId}>
												<div className="aspect-video relative rounded-[2px] overflow-hidden shadow-2xl border-[12px] border-white">
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
											<CarouselPrevious
												inside
												variant="ghost"
												className="bg-white/90 hover:bg-white text-emerald-900 border-none shadow-xl -left-4 rounded-none h-12 w-12"
											/>
											<CarouselNext
												inside
												variant="ghost"
												className="bg-white/90 hover:bg-white text-emerald-900 border-none shadow-xl -right-4 rounded-none h-12 w-12"
											/>
										</>
									)}
								</div>
								<CarouselDots className="mt-2" />
							</Carousel>
						</div>
					)}

					<div className="p-4 sm:p-8 space-y-6">
						<div className="flex items-center justify-between bg-[#F8FAF8] p-6 border border-[#E0E7E0]">
							<div>
								<h3 className="font-black text-[#111827] uppercase tracking-widest text-xs">
									Gestionar Imágenes
								</h3>
								<p className="text-[10px] text-[#8BA18B] font-medium uppercase tracking-tight mt-1">
									Arrastra para reordenar o suelta archivos aquí para subirlos.
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="rounded-none h-12 px-6 border-[#E0E7E0] text-[#111827] hover:bg-white hover:border-emerald-200 font-black uppercase tracking-widest text-[10px] transition-all shadow-sm"
								onClick={() => topInputRef.current?.click()}
							>
								<ImagePlus className="h-4 w-4 mr-2 text-emerald-600" />
								Añadir Fotos
								<input
									ref={topInputRef}
									type="file"
									multiple
									className="hidden"
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
									items={tempImages.map((img) => img.dndId)}
									strategy={rectSortingStrategy}
								>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-1 pb-12">
										{/* INPUT / DROPZONE PERMANENTE */}
										<div
											className="relative group aspect-square rounded-[2px] border border-dashed border-[#E0E7E0] hover:border-emerald-300 bg-[#F8FAF8] hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center cursor-pointer p-6 text-center"
											onClick={(e) => {
												e.stopPropagation();
												gridInputRef.current?.click();
											}}
										>
											<ImagePlus className="h-10 w-10 text-emerald-200 group-hover:text-emerald-500 mb-3 transition-transform group-hover:scale-110" />
											<span className="text-[9px] font-black text-[#8BA18B] uppercase tracking-[0.2em] leading-tight">
												Click o Arrastrar
											</span>
											<input
												ref={gridInputRef}
												type="file"
												multiple
												className="hidden"
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

				<DialogFooter className="p-6 sm:p-8 bg-[#FBFCFB] border-t border-[#E0E7E0] flex-none flex flex-row items-center justify-between gap-4">
					<div className="hidden sm:block">
						<p className="text-[10px] font-black uppercase text-[#8BA18B] tracking-widest">
							{tempImages.length} Imágenes en total
						</p>
					</div>
					<div className="flex items-center gap-3 w-full sm:w-auto">
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
							className="flex-1 sm:flex-none rounded-none h-12 sm:h-14 px-8 font-black uppercase tracking-widest text-[10px] text-[#8BA18B] hover:bg-white hover:text-[#111827]"
						>
							Cancelar
						</Button>
						<Button
							onClick={handleSaveGallery}
							className="flex-[2] sm:flex-none rounded-none h-12 sm:h-14 px-12 bg-[#111827] hover:bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50"
							disabled={batchMutation.isPending}
						>
							{batchMutation.isPending ? (
								<Loader2 className="h-5 w-5 animate-spin mr-3" />
							) : (
								<Save className="h-5 w-5 mr-3" />
							)}
							{tempImages.some((img) => img.deleted || !img.id)
								? "Sincronizar"
								: "Finalizar"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
