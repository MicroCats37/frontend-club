"use client";

import {
	ImagePlus,
	Images,
	Loader2,
	RefreshCcw,
	Save,
	Trash2,
	X,
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
import { Label } from "@/components/ui/label";
import { useBatchGallery } from "@/hooks/useBungalows";
import type {
	BatchGaleriaItem,
	Bungalow,
} from "@/schemas/alojamiento/bungalow";

interface BungalowGalleryEditorProps {
	bungalow: Bungalow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function BungalowGalleryEditor({
	bungalow,
	open,
	onOpenChange,
}: BungalowGalleryEditorProps) {
	if (!bungalow) return null;

	const [tempImages, setTempImages] = useState<
		{ id?: number; preview: string; file?: File; deleted?: boolean }[]
	>([]);
	const [batchOps, setBatchOps] = useState<BatchGaleriaItem[]>([]);

	const batchMutation = useBatchGallery(bungalow.id);

	useEffect(() => {
		if (open && bungalow) {
			if (bungalow?.imagenes) {
				setTempImages(
					bungalow.imagenes.map((img) => ({ id: img.id, preview: img.imagen })),
				);
			} else {
				setTempImages([]);
			}
			setBatchOps([]);
		}
	}, [bungalow, open]);

	const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newImages = Array.from(files).map((file) => ({
			preview: URL.createObjectURL(file),
			file,
		}));

		setTempImages((prev) => [...prev, ...newImages]);

		const newOps: BatchGaleriaItem[] = Array.from(files).map((file) => ({
			operacion: "CREATE",
			file,
		}));
		setBatchOps((prev) => [...prev, ...newOps]);
	};

	const handleRemoveImage = (index: number) => {
		const img = tempImages[index];
		if (img.id) {
			setBatchOps((prev) => [...prev, { operacion: "DELETE", id: img.id }]);
			setTempImages((prev) =>
				prev.map((item, i) =>
					i === index ? { ...item, deleted: true } : item,
				),
			);
		} else {
			setTempImages((prev) => prev.filter((_, i) => i !== index));
			setBatchOps((prev) => prev.filter((op) => op.file !== img.file));
		}
	};

	const handleSaveGallery = async () => {
		if (batchOps.length === 0) {
			toast.info("No hay cambios pendientes en la galería");
			return;
		}

		try {
			await batchMutation.mutateAsync(batchOps as any);
			toast.success("Galería actualizada correctamente");
			onOpenChange(false);
		} catch (_error) {}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
				<DialogHeader className="p-6 bg-[#FBFCFB] border-b border-[#E0E7E0]">
					<DialogTitle className="text-2xl font-bold text-[#2C3A2C] flex items-center">
						<Images className="h-6 w-6 mr-2 text-primary" />
						Gestionar Galería: {bungalow.nombre}
					</DialogTitle>
				</DialogHeader>

				<div className="p-8 space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-bold text-[#4A5D4A]">
								Imágenes de la Galería
							</h3>
							<p className="text-sm text-[#8BA18B]">
								Añade o elimina fotos del bungalow.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="rounded-xl relative h-10 border-primary/20 text-primary hover:bg-primary/5"
						>
							<ImagePlus className="h-4 w-4 mr-2" />
							Añadir Fotos
							<input
								type="file"
								multiple
								className="absolute inset-0 opacity-0 cursor-pointer"
								onChange={handleAddImage}
								accept="image/*"
							/>
						</Button>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
						{tempImages.length === 0 ? (
							<div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-[#E0E7E0] rounded-2xl text-[#8BA18B]">
								<Images className="h-12 w-12 mb-2 opacity-20" />
								<p>No hay imágenes en la galería</p>
							</div>
						) : (
							tempImages.map((img, index) => (
								<div
									key={index}
									className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${img.deleted ? "border-destructive opacity-50 grayscale" : "border-slate-100 shadow-sm hover:shadow-md"}`}
								>
									<img
										src={img.preview}
										alt="Galería"
										className="w-full h-full object-cover"
									/>
									<button
										type="button"
										onClick={() => handleRemoveImage(index)}
										className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${img.deleted ? "bg-primary text-white" : "bg-white/90 text-destructive hover:bg-white"}`}
									>
										{img.deleted ? (
											<RefreshCcw className="h-4 w-4" />
										) : (
											<X className="h-4 w-4" />
										)}
									</button>
									{img.deleted && (
										<div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
											<Trash2 className="h-8 w-8 text-destructive" />
										</div>
									)}
								</div>
							))
						)}
					</div>

					{batchOps.length > 0 && (
						<div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
							<p className="text-xs font-bold text-primary uppercase mb-1">
								Cambios pendientes
							</p>
							<p className="text-sm text-[#4A5D4A]">
								Se aplicarán {batchOps.length} operaciones (Nuevas fotos o
								eliminaciones). Haz clic en guardar para aplicar los cambios.
							</p>
						</div>
					)}
				</div>

				<DialogFooter className="p-6 bg-[#FBFCFB] border-t border-[#E0E7E0]">
					<Button
						type="button"
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="rounded-xl"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleSaveGallery}
						className="rounded-xl px-10 shadow-lg"
						disabled={batchMutation.isPending || batchOps.length === 0}
					>
						{batchMutation.isPending ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						Guardar Galería
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
