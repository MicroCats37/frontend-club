"use client";

import {
	Calendar,
	Check,
	Edit,
	Plus,
	RefreshCw,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDeleteFeriado, useFeriados } from "@/hooks/useFeriados";
import type { Feriado } from "@/schemas/alojamiento/feriado";
import FeriadoFormModal from "./_components/FeriadoFormModal";

export default function FeriadosAdminPage() {
	const { data: feriados, isLoading, refetch } = useFeriados();
	const deleteMutation = useDeleteFeriado();
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedFeriado, setSelectedFeriado] = useState<Feriado | null>(null);

	const handleAdd = () => {
		setSelectedFeriado(null);
		setModalOpen(true);
	};

	const handleEdit = (feriado: Feriado) => {
		setSelectedFeriado(feriado);
		setModalOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (confirm("¿Estás seguro de eliminar este feriado?")) {
			try {
				await deleteMutation.mutateAsync(id);
				toast.success("Feriado eliminado exitosamente");
			} catch (_error) {
				// El hook ya maneja el error
			}
		}
	};

	const getMesNombre = (mes?: number | null) => {
		if (!mes) return "-";
		const meses = [
			"Enero",
			"Febrero",
			"Marzo",
			"Abril",
			"Mayo",
			"Junio",
			"Julio",
			"Agosto",
			"Septiembre",
			"Octubre",
			"Noviembre",
			"Diciembre",
		];
		return meses[mes - 1];
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#E0E7E0] shadow-sm">
				<div>
					<h1 className="text-3xl font-extrabold text-[#2C3A2C] tracking-tight flex items-center">
						<Calendar className="mr-3 h-8 w-8 text-primary" />
						Gestión de Feriados
					</h1>
					<p className="text-[#8BA18B] mt-1 font-medium">
						Configura los días feriados para el cálculo de tarifas especiales.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => refetch()}
						className="rounded-xl border-[#E0E7E0]"
						disabled={isLoading}
					>
						<RefreshCw
							className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</Button>
					<Button
						onClick={handleAdd}
						className="rounded-xl font-bold shadow-lg shadow-primary/20"
					>
						<Plus className="mr-2 h-4 w-4" />
						Agregar Feriado
					</Button>
				</div>
			</div>

			{/* List Section */}
			<div className="bg-white rounded-3xl border border-[#E0E7E0] shadow-sm overflow-hidden">
				<Table>
					<TableHeader className="bg-[#FBFCFB]">
						<TableRow className="hover:bg-transparent border-[#E0E7E0]">
							<TableHead className="font-bold text-[#4A5D4A] py-5">
								Nombre
							</TableHead>
							<TableHead className="font-bold text-[#4A5D4A]">Tipo</TableHead>
							<TableHead className="font-bold text-[#4A5D4A]">
								Fecha / Recurrencia
							</TableHead>
							<TableHead className="font-bold text-[#4A5D4A]">Estado</TableHead>
							<TableHead className="text-right font-bold text-[#4A5D4A] pr-8">
								Acciones
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-20 text-[#8BA18B]"
								>
									Cargando feriados...
								</TableCell>
							</TableRow>
						) : feriados?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-20 text-[#8BA18B]"
								>
									No hay feriados registrados.
								</TableCell>
							</TableRow>
						) : (
							feriados?.map((feriado) => (
								<TableRow
									key={feriado.id}
									className="hover:bg-[#F3F6F3]/50 transition-colors border-[#F0F4F0]"
								>
									<TableCell className="font-semibold text-[#2C3A2C] py-4">
										{feriado.nombre}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												feriado.tipo === "FIJO" ? "secondary" : "outline"
											}
											className="rounded-lg"
										>
											{feriado.tipo}
										</Badge>
									</TableCell>
									<TableCell className="text-[#4A5D4A]">
										{feriado.tipo === "FIJO" ? (
											<span className="flex items-center">
												<span className="text-xl font-bold mr-1">
													{feriado.dia}
												</span>
												de {getMesNombre(feriado.mes)}
											</span>
										) : (
											<span className="font-medium">{feriado.fecha}</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={feriado.activo ? "default" : "destructive"}
											className="rounded-lg"
										>
											{feriado.activo ? (
												<Check className="w-3 h-3 mr-1" />
											) : (
												<X className="w-3 h-3 mr-1" />
											)}
											{feriado.activo ? "Activo" : "Inactivo"}
										</Badge>
									</TableCell>
									<TableCell className="text-right pr-8">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEdit(feriado)}
												className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDelete(feriado.id)}
												className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<FeriadoFormModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				feriado={selectedFeriado}
			/>
		</div>
	);
}
