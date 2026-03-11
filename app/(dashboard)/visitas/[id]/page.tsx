"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	Clock,
	CreditCard,
	History,
	Home,
	Info,
	MapPin,
	QrCode,
	Receipt,
	Ticket,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVisitaDetail } from "@/hooks/visitas/useGetVisitaDetail";

const StatusBadge = ({ estado }: { estado: string }) => {
	const config: Record<
		string,
		{ label: string; className: string; icon: any }
	> = {
		PENDIENTE: {
			label: "Pendiente",
			className: "bg-amber-50 text-amber-700 border-amber-200",
			icon: Clock,
		},
		CONFIRMADA: {
			label: "Confirmada",
			className: "bg-emerald-50 text-emerald-700 border-emerald-200",
			icon: CheckCircle2,
		},
		FINALIZADA: {
			label: "Finalizada",
			className: "bg-blue-50 text-blue-700 border-blue-200",
			icon: History,
		},
		CANCELADA: {
			label: "Anulada",
			className: "bg-rose-50 text-rose-700 border-rose-200",
			icon: XCircle,
		},
	};

	const item = config[estado] || config.PENDIENTE;
	const Icon = item.icon;

	return (
		<Badge
			variant="outline"
			className={`px-4 py-1.5 flex items-center gap-2 font-black uppercase text-[11px] tracking-wider rounded-2xl shadow-sm ${item.className}`}
		>
			<Icon className="h-4 w-4" />
			{item.label}
		</Badge>
	);
};

export default function VisitaDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const { data: visita, isLoading, isError } = useGetVisitaDetail(id);

	if (isLoading) {
		return (
			<div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
				<Skeleton className="h-20 w-full rounded-3xl" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<Skeleton className="h-64 w-full rounded-[40px]" />
						<Skeleton className="h-96 w-full rounded-[40px]" />
					</div>
					<Skeleton className="h-[600px] w-full rounded-[40px]" />
				</div>
			</div>
		);
	}

	if (isError || !visita) {
		return (
			<div className="max-w-md mx-auto py-20 text-center">
				<div className="bg-rose-50 p-6 rounded-[32px] mb-6 inline-block">
					<XCircle className="h-12 w-12 text-rose-500" />
				</div>
				<h2 className="text-2xl font-black text-[#2C3A2C]">
					Error al cargar la visita
				</h2>
				<p className="text-gray-500 mt-2">
					No pudimos encontrar la información solicitada o no tienes permisos
					suficientes.
				</p>
				<Button
					variant="outline"
					className="mt-8 rounded-2xl px-8"
					onClick={() => router.back()}
				>
					Volver atrás
				</Button>
			</div>
		);
	}

	const isBungalow = !!visita.reserva_asociada;
	const ingresantes = visita.lista_ingresantes?.ingresantes || [];
	const reservaBungalow = visita.reserva_asociada;

	return (
		<div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
			{/* Header / Nav */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden relative">
				<div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none" />

				<div className="flex items-center gap-6">
					<Button
						variant="outline"
						size="icon"
						className="rounded-2xl h-12 w-12 border-gray-100 hover:bg-gray-50 text-gray-500"
						onClick={() => router.back()}
					>
						<ChevronLeft className="h-6 w-6" />
					</Button>
					<div>
						<div className="flex items-center gap-3 mb-1">
							<h1 className="text-4xl font-black text-[#2C3A2C] tracking-tighter">
								{isBungalow ? "Detalle de Estadía" : "Visita de Día"}
							</h1>
							<StatusBadge estado={visita.estado} />
						</div>
						<p className="text-gray-400 font-bold flex items-center gap-2 text-sm">
							<QrCode className="h-4 w-4 text-amber-500" />
							ID de Registro:{" "}
							<span className="text-[#4A5D4A] uppercase bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 font-black">
								{visita.id.split("-")[0]}
							</span>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						className="rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest border-gray-100"
					>
						<Receipt className="mr-2 h-4 w-4" /> Descargar Boleta
					</Button>
					<Link href={`/visitas/nueva`}>
						<Button className="rounded-2xl h-12 px-6 bg-[#2C3A2C] hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200">
							Nueva Visita <Plus className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			<div className="space-y-8">
				{/* 1. SECCION ALOJAMIENTO (Sólo si es bungalow) */}
				{isBungalow && (
					<Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
						<div className="grid grid-cols-1 lg:grid-cols-3">
							<div className="lg:col-span-2 p-8 border-r border-gray-50">
								<div className="flex items-center gap-4 mb-8">
									<div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
										<Home className="h-6 w-6" />
									</div>
									<div>
										<h3 className="text-2xl font-black text-[#2C3A2C] tracking-tight">
											Detalle de Alojamiento
										</h3>
										<p className="text-gray-400 font-bold text-sm">
											Reserva de bungalows y estadía
										</p>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
									<div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100/50">
										<label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-4">
											Periodo de Estancia
										</label>
										<div className="space-y-4">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm">
													<Calendar className="h-5 w-5" />
												</div>
												<div className="flex flex-col">
													<span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
														Check-in
													</span>
													<span className="font-black text-[#2C3A2C]">

														{reservaBungalow?.fecha_inicio
															? format(
																new Date(reservaBungalow.fecha_inicio),
																"PPP",
																{ locale: es },
															)
															: "---"}
													</span>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm">
													<Clock className="h-5 w-5" />
												</div>
												<div className="flex flex-col">
													<span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
														Check-out
													</span>
													<span className="font-black text-[#2C3A2C]">
														{reservaBungalow?.fecha_fin
															? format(
																new Date(reservaBungalow.fecha_fin),
																"PPP",
																{ locale: es },
															)
															: "---"}
													</span>
												</div>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<label className="text-[10px] uppercase font-black text-gray-400 tracking-widest block pl-2">
											Bungalows Seleccionados
										</label>

										<div className="space-y-3">
											{!reservaBungalow || reservaBungalow.bungalows_alquilados.length === 0 ? (
												<p className="text-gray-500 text-sm">
													No hay bungalows seleccionados.
												</p>
											) : (
												reservaBungalow.bungalows_alquilados.map((item) => (
													<div
														key={item.id}
														className="p-4 rounded-[24px] bg-white border border-gray-100 shadow-sm flex items-center justify-between"
													>
														<div className="flex items-center gap-3">

															<div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center">
																<div className="h-8 w-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-black">
																	#{item.bungalow.numero}
																</div>
															</div>

															<span className="font-black text-[#2C3A2C] text-sm">
																{item.bungalow.nombre}
															</span>

															<Badge
																variant="secondary"
																className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase px-2 py-0"
															>
																Activo
															</Badge>

														</div>
													</div>
												))
											)}
										</div>
									</div>
								</div>
							</div>

							<div className="bg-[#2C3A2C] text-white p-8 flex flex-col justify-between">
								<div>
									<h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
										<CreditCard className="h-3 w-3" /> Orden de Alojamiento
									</h4>

									<div className="space-y-4">
										{!reservaBungalow || reservaBungalow.bungalows_alquilados.length === 0 ? (
											<p className="text-gray-500 text-sm">
												No hay bungalows seleccionados.
											</p>
										) : (
											reservaBungalow.bungalows_alquilados.map((item) => (
												<div
													key={item.id}
													className="flex justify-between items-center text-sm"
												>
													<span className="font-bold text-white/50">
														{item.bungalow.nombre}
													</span>

													<span className="font-black">
														S/ {Number(item.precio_subtotal).toFixed(2)}
													</span>
												</div>
											))
										)}
									</div>
								</div>

								<div className="mt-12 pt-8 border-t border-white/10">
									<div className="flex items-baseline justify-between gap-4 mb-4">
										<span className="text-3xl font-black">
											S/{" "}
											{Number(
												visita.reserva_asociada?.precio_total || 0,
											).toFixed(2)}
										</span>
										<Badge
											className={`${visita.reserva_asociada?.esta_pagada ? "bg-emerald-500" : "bg-amber-500"} text-white font-black px-3 py-1 rounded-lg border-none`}
										>
											{visita.reserva_asociada?.esta_pagada
												? "PAGADO"
												: "PENDIENTE"}
										</Badge>
									</div>
									<p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter leading-tight">
										El pago de alojamiento es independiente de los derechos de
										ingreso al club.
									</p>
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* 2. SECCION INGRESANTES / LISTA */}
				<Card className="border-none shadow-sm bg-white rounded-[40px] overflow-hidden">
					<div className="grid grid-cols-1 lg:grid-cols-3">
						<div className="lg:col-span-2 p-8 border-r border-gray-50">
							<div className="flex items-center gap-4 mb-8">
								<div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
									<Users className="h-6 w-6" />
								</div>
								<div>
									<h3 className="text-2xl font-black text-[#2C3A2C] tracking-tight">
										Lista de Invitados
									</h3>
									<p className="text-gray-400 font-bold text-sm">
										{ingresantes.length} personas registradas para ingreso
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{ingresantes.map((ing) => (
									<div
										key={ing.id}
										className="p-4 rounded-[28px] border-2 border-gray-50 flex items-center justify-between hover:border-amber-100 transition-all group"
									>
										<div className="flex items-center gap-4">
											<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#4A5D4A] font-black text-[10px]">
												{ing.persona.nombres[0]}
											</div>
											<div>
												<h4 className="font-black text-[#2C3A2C] text-sm group-hover:text-amber-600 transition-colors uppercase tracking-tight">
													{ing.persona.nombre_completo}
												</h4>
												<Badge
													variant="secondary"
													className="text-[8px] font-black uppercase text-gray-400 bg-gray-50 border-gray-100 px-2 py-0 tracking-widest leading-normal"
												>
													{ing.tipo_entrada?.nombre || "Invitado"}
												</Badge>
											</div>
										</div>
										<div className="text-right">
											<span
												className={`text-xs font-black ${Number(ing.precio_entrada) === 0 ? "text-emerald-600" : "text-[#2C3A2C]"}`}
											>
												{Number(ing.precio_entrada) === 0
													? "LIBRE"
													: `S/ ${Number(ing.precio_entrada).toFixed(2)}`}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="bg-gray-50/50 p-8 flex flex-col justify-between border-l border-gray-100">
							<div>
								<h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
									<Receipt className="h-3 w-3" /> Orden de Ingreso
								</h4>

								<div className="space-y-4">
									<div className="flex justify-between items-center text-sm">
										<span className="font-bold text-gray-400">
											Total Personas
										</span>
										<span className="font-black text-[#2C3A2C]">
											{ingresantes.length}
										</span>
									</div>
									<div className="flex justify-between items-center text-sm">
										<span className="font-bold text-gray-400">
											Base Imponible
										</span>
										<span className="font-black text-[#2C3A2C]">
											S/{" "}
											{Number(
												visita.lista_ingresantes?.monto_total || 0,
											).toFixed(2)}
										</span>
									</div>
									{isBungalow && (
										<div className="bg-white p-3 rounded-2xl border border-amber-100 text-[10px] text-amber-700 font-bold leading-tight">
											Para bungalows, el pago de entradas se gestiona en counter
											al llegar.
										</div>
									)}
								</div>
							</div>

							<div className="mt-12 pt-8 border-t border-gray-100">
								<div className="flex items-baseline justify-between gap-4">
									<div className="flex flex-col">
										<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											A pagar ahora
										</span>
										<span className="text-3xl font-black text-[#2C3A2C]">
											S/{" "}
											{Number(
												visita.lista_ingresantes?.monto_total || 0,
											).toFixed(2)}
										</span>
									</div>
									<Badge
										className={`${visita.lista_ingresantes?.esta_pagada ? "bg-emerald-500" : "bg-amber-500"} text-white font-black px-3 py-1 rounded-lg border-none`}
									>
										{visita.lista_ingresantes?.esta_pagada
											? "PAGADO"
											: "PENDIENTE"}
									</Badge>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Grand Total Bar */}
				<div className="bg-[#2C3A2C] p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-black/20 overflow-hidden relative">
					<div className="absolute top-0 right-0 h-full w-64 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

					<div>
						<h4 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
							Monto Consolidado de Visita
						</h4>
						<div className="flex items-baseline gap-3">
							<span className="text-white text-5xl font-black tracking-tighter">
								S/ {Number(visita.monto_total || 0).toFixed(2)}
							</span>
							<span className="text-white/40 font-bold mb-1">Total Final</span>
						</div>
					</div>

					<div className="flex items-center gap-4 w-full md:w-auto">
						<Button className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-white text-[#2C3A2C] hover:bg-white/90 font-black uppercase tracking-widest text-xs">
							Gestionar Pagos
						</Button>
						<Button
							variant="outline"
							className="h-14 w-14 rounded-2xl border-white/10 text-white hover:bg-white/5"
						>
							<Ticket className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function Plus(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
}
