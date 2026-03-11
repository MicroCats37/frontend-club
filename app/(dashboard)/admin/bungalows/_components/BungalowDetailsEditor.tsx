"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	Camera,
	CheckCircle2,
	Loader2,
	RefreshCcw,
	Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useUpdateBungalow,
	useUpdateBungalowEstado,
} from "@/hooks/useBungalows";
import {
	type Bungalow,
	type BungalowUpdate,
	BungalowUpdateSchema,
} from "@/schemas/alojamiento/bungalow";

interface BungalowDetailsEditorProps {
	bungalow: Bungalow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function BungalowDetailsEditor({
	bungalow,
	open,
	onOpenChange,
}: BungalowDetailsEditorProps) {
	if (!bungalow) return null;

	const [mainImagePreview, setMainImagePreview] = useState<string | null>(
		bungalow?.image_main || null,
	);

	const updateMutation = useUpdateBungalow();
	const statusMutation = useUpdateBungalowEstado();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<BungalowUpdate>({
		resolver: zodResolver(BungalowUpdateSchema),
		defaultValues: {
			nombre: bungalow.nombre,
			zona: bungalow.zona,
			capacidad: bungalow.capacidad,
			descripcion: bungalow.descripcion,
			piso: bungalow.piso,
		},
	});

	useEffect(() => {
		if (open && bungalow) {
			reset({
				nombre: bungalow.nombre,
				zona: bungalow.zona,
				capacidad: bungalow.capacidad,
				descripcion: bungalow.descripcion,
				piso: bungalow.piso || 1,
			});
			setMainImagePreview(bungalow.image_main);
		}
	}, [bungalow, open, reset]);

	const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setMainImagePreview(URL.createObjectURL(file));
		setValue("image_main", file);
	};

	const onSubmit: SubmitHandler<BungalowUpdate> = async (data) => {
		try {
			await updateMutation.mutateAsync({ id: bungalow.id, data });
			toast.success("Detalles actualizados");
			onOpenChange(false);
		} catch (_error) {}
	};

	const handleCambiarEstado = async (nuevoEstado: string) => {
		try {
			await statusMutation.mutateAsync({
				id: bungalow.id,
				data: { estado: nuevoEstado },
			});
			toast.success(`Estado cambiado a ${nuevoEstado}`);
		} catch (_error) {}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader className="p-6 bg-[#FBFCFB] border-b border-[#E0E7E0]">
						<DialogTitle className="text-2xl font-bold text-[#2C3A2C]">
							Editar Detalles: {bungalow.nombre}
						</DialogTitle>
					</DialogHeader>

					<div className="p-8 space-y-6">
						{/* Imagen Principal y Datos Base */}
						<div className="flex flex-col sm:flex-row gap-6">
							<div className="w-full sm:w-1/3 space-y-3">
								<Label className="text-sm font-bold text-[#4A5D4A]">
									Imagen Principal
								</Label>
								<div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-[#E0E7E0] group">
									{mainImagePreview ? (
										<img
											src={mainImagePreview}
											alt="Principal"
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="flex flex-col items-center justify-center h-full text-[#8BA18B]">
											<Camera className="h-8 w-8 mb-2" />
											<span className="text-xs text-center">Sin imagen</span>
										</div>
									)}
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<Button
											type="button"
											variant="secondary"
											size="sm"
											className="rounded-xl relative"
										>
											Cambiar
											<input
												type="file"
												className="absolute inset-0 opacity-0 cursor-pointer"
												onChange={handleMainImageChange}
												accept="image/*"
											/>
										</Button>
									</div>
								</div>
							</div>

							<div className="flex-1 space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="nombre"
										className="text-sm font-bold text-[#4A5D4A]"
									>
										Nombre
									</Label>
									<Input
										id="nombre"
										{...register("nombre")}
										className="rounded-xl"
									/>
									{errors.nombre && (
										<p className="text-xs text-destructive">
											{errors.nombre.message}
										</p>
									)}
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="capacidad"
											className="text-sm font-bold text-[#4A5D4A]"
										>
											Capacidad
										</Label>
										<Input
											id="capacidad"
											type="number"
											{...register("capacidad", { valueAsNumber: true })}
											className="rounded-xl"
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="zona"
											className="text-sm font-bold text-[#4A5D4A]"
										>
											Zona
										</Label>
										<Input
											id="zona"
											{...register("zona")}
											className="rounded-xl"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="piso"
										className="text-sm font-bold text-[#4A5D4A]"
									>
										Piso
									</Label>
									<Input
										id="piso"
										type="number"
										{...register("piso", { valueAsNumber: true })}
										className="rounded-xl"
									/>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="descripcion"
								className="text-sm font-bold text-[#4A5D4A]"
							>
								Descripción
							</Label>
							<Textarea
								id="descripcion"
								{...register("descripcion")}
								className="rounded-xl min-h-[80px]"
							/>
						</div>

						{/* Panel de Estado */}
						<div className="p-4 rounded-2xl bg-[#FBFCFB] border border-[#E0E7E0] space-y-3">
							<Label className="text-xs font-bold text-[#8BA18B] uppercase block">
								Estado Operativo
							</Label>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={`rounded-xl px-4 ${bungalow.estado === "DISPONIBLE" ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-100" : ""}`}
									onClick={() => handleCambiarEstado("DISPONIBLE")}
									disabled={statusMutation.isPending}
								>
									<CheckCircle2 className="h-4 w-4 mr-2" /> Disponible
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={`rounded-xl px-4 ${bungalow.estado === "MANTENIMIENTO" ? "bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-100" : ""}`}
									onClick={() => handleCambiarEstado("MANTENIMIENTO")}
									disabled={statusMutation.isPending}
								>
									<RefreshCcw className="h-4 w-4 mr-2" /> Mantenimiento
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={`rounded-xl px-4 ${bungalow.estado === "BLOQUEADO" ? "bg-red-100 border-red-500 text-red-700 hover:bg-red-100" : ""}`}
									onClick={() => handleCambiarEstado("BLOQUEADO")}
									disabled={statusMutation.isPending}
								>
									<AlertCircle className="h-4 w-4 mr-2" /> Bloqueado
								</Button>
							</div>
						</div>
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
							type="submit"
							className="rounded-xl px-10 shadow-lg"
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Guardar Detalles
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
