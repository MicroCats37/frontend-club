"use client";

import {
	AlertCircle,
	ArrowLeftCircle,
	ArrowRightCircle,
	CheckCircle2,
	CreditCard,
	Loader2,
	Search,
	User,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	useMolineteActions,
	useMolineteSearch,
} from "@/hooks/visitas/useMolinete";

export default function PorteriaPage() {
	const [dni, setDni] = useState("");
	const { data: result, isLoading, isError } = useMolineteSearch(dni);
	const { checkIn, checkOut } = useMolineteActions();

	const handleCheckIn = () => {
		if (result) {
			checkIn.mutate({ persona_id: result.persona_id });
		}
	};

	const handleCheckOut = () => {
		if (result) {
			checkOut.mutate({ persona_id: result.persona_id });
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-black text-[#2C3A2C] tracking-tight">
					CONTROL DE ACCESO (PORTERÍA)
				</h1>
				<p className="text-[#8BA18B]">
					Verifica el ingreso y salida de socios e invitados mediante DNI.
				</p>
			</div>

			<div className="max-w-md">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					<Input
						placeholder="Buscar por DNI..."
						className="pl-10 h-12 text-lg border-2 focus-visible:ring-primary"
						value={dni}
						onChange={(e) => setDni(e.target.value)}
						maxLength={8}
					/>
				</div>
			</div>

			{isLoading && (
				<div className="flex items-center gap-2 text-primary font-medium p-4">
					<Loader2 className="h-5 w-5 animate-spin" />
					Buscando autorización...
				</div>
			)}

			{isError && (
				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="pt-6 flex items-center gap-3 text-destructive">
						<AlertCircle className="h-5 w-5" />
						<p>Error al conectar con el servidor de molinete.</p>
					</CardContent>
				</Card>
			)}

			{dni.length === 8 && !isLoading && !result && (
				<div className="p-8 text-center border-2 border-dashed rounded-xl border-[#E0E7E0] bg-white">
					<div className="bg-[#FBFCFB] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="h-8 w-8 text-[#8BA18B]" />
					</div>
					<h3 className="text-lg font-bold text-[#2C3A2C]">No autorizado</h3>
					<p className="text-[#8BA18B] max-w-xs mx-auto">
						No se encontró ningún registro de ingreso válido para hoy con el DNI{" "}
						{dni}.
					</p>
				</div>
			)}

			{result && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
					{/* Tarjeta de Identidad */}
					<Card className="md:col-span-2 shadow-sm border-[#E0E7E0]">
						<CardHeader className="bg-[#FBFCFB] border-b border-[#E0E7E0]">
							<CardTitle className="flex justify-between items-center text-lg font-bold text-[#2C3A2C]">
								<span>Datos del Visitante</span>
								<Badge
									variant={
										result.estado_actual === "EN_CLUB"
											? "secondary"
											: result.estado_actual === "RETIRADO"
												? "outline"
												: "default"
									}
									className="uppercase font-bold"
								>
									{result.estado_actual}
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6 space-y-6">
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 text-primary">
									<User size={32} />
								</div>
								<div className="space-y-1">
									<h2 className="text-2xl font-black text-[#2C3A2C] leading-none">
										{result.nombre_completo}
									</h2>
									<p className="text-lg font-medium text-[#8BA18B]">
										DNI: {result.dni}
									</p>
								</div>
							</div>

							<Separator className="bg-[#E0E7E0]" />

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<p className="text-xs font-bold text-[#8BA18B] uppercase tracking-wider">
										Tipo de Pase
									</p>
									<p className="text-lg font-semibold text-[#2C3A2C]">
										{result.tipo_entrada}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs font-bold text-[#8BA18B] uppercase tracking-wider">
										Estado Financiero
									</p>
									<div className="flex items-center gap-2">
										{result.saldo_pendiente > 0 ? (
											<>
												<CreditCard className="h-5 w-5 text-destructive" />
												<span className="text-lg font-black text-destructive">
													DEUDA: S/{result.saldo_pendiente}
												</span>
											</>
										) : (
											<>
												<CheckCircle2 className="h-5 w-5 text-[#2EB85C]" />
												<span className="text-lg font-black text-[#2EB85C]">
													PAGADO
												</span>
											</>
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Tarjeta de Acción */}
					<Card
						className={`shadow-xl border-none ${
							result.puede_ingresar
								? "bg-[#2C3A2C] text-white"
								: result.puede_salir
									? "bg-primary text-white"
									: "bg-white border-[#E0E7E0] border-2 text-[#2C3A2C]"
						}`}
					>
						<CardHeader>
							<CardTitle className="text-lg font-black uppercase tracking-tight">
								Acciones Disponibles
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{result.puede_ingresar && (
								<div className="space-y-4">
									<div className="p-4 bg-white/10 rounded-xl border border-white/20">
										<p className="text-sm font-medium mb-1 opacity-80">
											El sistema permite el ingreso
										</p>
										<p className="text-xs opacity-60 italic">
											Se registrará el BIP en la Puerta Principal.
										</p>
									</div>
									<Button
										className="w-full h-14 bg-[#2EB85C] hover:bg-[#2EB85C]/90 text-white font-black text-lg shadow-lg"
										onClick={handleCheckIn}
										disabled={checkIn.isPending}
									>
										{checkIn.isPending ? (
											<Loader2 className="animate-spin mr-2" />
										) : (
											<ArrowRightCircle className="mr-2" />
										)}
										CONFIRMAR INGRESO
									</Button>
								</div>
							)}

							{result.puede_salir && (
								<div className="space-y-4">
									<div className="p-4 bg-white/10 rounded-xl border border-white/20">
										<p className="text-sm font-medium mb-1 opacity-80">
											Check-out habilitado
										</p>
										<p className="text-xs opacity-60 italic">
											No se detectaron deudas pendientes en este expediente.
										</p>
									</div>
									<Button
										variant="secondary"
										className="w-full h-14 bg-white text-primary hover:bg-white/90 font-black text-lg shadow-lg"
										onClick={handleCheckOut}
										disabled={checkOut.isPending}
									>
										{checkOut.isPending ? (
											<Loader2 className="animate-spin mr-2" />
										) : (
											<ArrowLeftCircle className="mr-2" />
										)}
										REGISTRAR SALIDA
									</Button>
								</div>
							)}

							{!result.puede_ingresar && !result.puede_salir && (
								<div className="space-y-6 text-center py-4">
									<div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
										<AlertCircle className="h-8 w-8 text-destructive" />
									</div>
									<div className="space-y-2">
										<p className="text-xl font-black text-destructive">
											ACCESO DENEGADO
										</p>
										<p className="text-sm font-medium text-[#4A5D4A]">
											{result.mensaje_restriccion ||
												"El estado actual no permite realizar acciones de molinete."}
										</p>
									</div>
									{result.saldo_pendiente > 0 && (
										<p className="text-xs text-destructive/80 italic">
											El usuario debe regularizar su deuda en caja antes de
											continuar.
										</p>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
