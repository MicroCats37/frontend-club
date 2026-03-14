"use client";

import { useBungalowPricingList } from "@/hooks/useBungalows";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Users, MapPin, Loader2, Info, Pencil, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/format/currency";
import { useState } from "react";
import { BungalowPricingModal } from "./BungalowPricingModal";
import { Button } from "@/components/ui/button";
// BungalowPricing list item type is usually derived from the hook response

const DIAS_LABELS: Record<number, string> = {
	1: "L",
	2: "M",
	3: "X",
	4: "J",
	5: "V",
	6: "S",
	7: "D",
};

export function BungalowPricingList() {
	const { data: bungalows, isLoading, isError } = useBungalowPricingList();
	const [editingBungalow, setEditingBungalow] = useState<any | null>(null);

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3].map((i) => (
					<Card key={i} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden h-[350px]">
						<Skeleton className="h-full w-full" />
					</Card>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="p-16 text-center bg-red-50/50 text-red-600 rounded-[3rem] border-2 border-dashed border-red-100 ring-8 ring-red-50/20">
				<Info className="h-12 w-12 mx-auto mb-4 opacity-40" />
				<h3 className="text-xl font-black mb-1">Error de sincronización</h3>
				<p className="text-sm font-medium opacity-70">No pudimos conectar con el servidor de precios.</p>
			</div>
		);
	}

	if (!bungalows || bungalows.length === 0) {
		return (
			<div className="p-16 text-center bg-gray-50/50 text-gray-400 rounded-[3rem] border-2 border-dashed border-gray-100 ring-8 ring-gray-50/10">
				<Home className="h-12 w-12 mx-auto mb-4 opacity-10" />
				<h3 className="text-xl font-black mb-1">Sin registros</h3>
				<p className="text-sm font-medium opacity-60">Parece que aún no hay bungalows registrados.</p>
			</div>
		);
	}

	return (
		<div className="space-y-10">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-8 px-2">
				<div>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-amber-100/50">
						<DollarSign className="w-3 h-3" /> Tarifario Individual
					</div>
					<h2 className="text-4xl font-black text-[#2C3A2C] tracking-tight">Precios por Unidad</h2>
					<p className="text-lg text-[#8BA18B] font-medium mt-1">Sincroniza y ajusta tarifas específicas para cada bungalow.</p>
				</div>
				<Badge variant="outline" className="bg-white border-gray-200 text-[#2C3A2C] px-5 py-2 rounded-2xl font-black text-sm shadow-sm ring-4 ring-gray-50">
					{bungalows.length} <span className="ml-1 text-[#8BA18B] font-bold uppercase text-[10px]">Unidades</span>
				</Badge>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{bungalows.map((bungalow) => (
					<Card key={bungalow.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group overflow-hidden bg-white flex flex-col ring-1 ring-gray-100/50">
						<div className="p-8 pb-4">
							<div className="flex justify-between items-start gap-4 mb-6">
								<div className="flex-1 min-w-0">
									<h3 className="text-2xl font-black text-[#2C3A2C] flex items-center gap-3">
										<div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
											<Home className="w-5 h-5 text-primary" />
										</div>
										<span className="truncate">#{bungalow.numero}</span>
									</h3>
									<p className="text-[#8BA18B] text-sm font-bold mt-1 uppercase tracking-tight truncate pl-1">
										{bungalow.nombre}
									</p>
								</div>
								<Button 
									onClick={() => setEditingBungalow(bungalow)}
									variant="ghost" 
									size="icon" 
									className="h-12 w-12 rounded-2xl bg-gray-50 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-gray-100"
								>
									<Pencil className="w-5 h-5" />
								</Button>
							</div>

							<div className="flex flex-wrap gap-2 mb-6">
								<Badge className="bg-gray-100 text-[#4A5D4A] border-none text-[10px] font-black rounded-xl px-3 py-1 uppercase tracking-wider">
									<MapPin className="w-3 h-3 mr-1 opacity-50" /> Zona {bungalow.zona || "A"}
								</Badge>
								<Badge className="bg-primary/5 text-primary border-primary/10 text-[10px] font-black rounded-xl px-3 py-1 uppercase tracking-wider">
									<Users className="w-3 h-3 mr-1 opacity-50" /> Cap. {bungalow.capacidad}
								</Badge>
							</div>
						</div>

						<CardContent className="px-8 pb-8 pt-0 flex-1">
							<div className="space-y-3">
								{bungalow.precios.map((precio) => (
									<div 
										key={precio.tipo_tarifa_id + "-" + precio.dias_tarifa_id} 
										className={`p-4 rounded-3xl border transition-all duration-300 ${!precio.activo 
											? "opacity-40 bg-gray-50 grayscale border-gray-100" 
											: "bg-gray-50/30 hover:bg-white hover:border-primary/20 hover:shadow-sm border-transparent"
										}`}
									>
										<div className="flex justify-between items-center mb-3">
											<div className="min-w-0 flex-1">
												<p className="font-black text-[#2C3A2C] text-xs truncate">
													{precio.tipo_tarifa_nombre}
												</p>
											</div>
											<div className="flex gap-0.5 ml-2">
												{[1, 2, 3, 4, 5, 6, 7].map((d) => (
													<span 
														key={d} 
														className={`text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-[3px] transition-colors ${precio.dias_semana.includes(d) ? "bg-primary text-white" : "bg-gray-200 text-gray-400 opacity-50"}`}
													>
														{DIAS_LABELS[d]}
													</span>
												))}
											</div>
										</div>

										<div className="flex gap-2 items-center">
											<div className="flex-1 bg-white/60 p-2.5 rounded-2xl border border-gray-100">
												<span className="text-[8px] uppercase font-black text-[#8BA18B] block mb-0.5 tracking-tighter">C/ Privilegio</span>
												<span className="font-black text-sm text-primary tracking-tight">
													{formatCurrency(precio.precio_con_privilegio)}
												</span>
											</div>
											<div className="flex-1 bg-white/60 p-2.5 rounded-2xl border border-gray-100">
												<span className="text-[8px] uppercase font-black text-[#8BA18B] block mb-0.5 tracking-tighter">S/ Privilegio</span>
												<span className="font-black text-sm text-[#2C3A2C] tracking-tight">
													{formatCurrency(precio.precio_sin_privilegio)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{editingBungalow && (
				<BungalowPricingModal
					bungalow={editingBungalow}
					open={!!editingBungalow}
					onOpenChange={(open) => !open && setEditingBungalow(null)}
				/>
			)}
		</div>
	);
}
