"use client";

import { ArrowRight, CheckCircle2, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
	useVisitaRegistrationStore,
} from "@/hooks/visitas/useVisitaRegistrationStore";
import { useGetTiposPases } from "@/hooks/visitas/useGetTiposPases";

export function StepTipoVisita() {
	const { setTipoVisita, setPaso, setDefaultTipoPaseId, defaultTipoPaseId } = useVisitaRegistrationStore();
	
	const { data: tiposPases, isLoading } = useGetTiposPases();

	const handlePassSelect = (passId: string) => {
		setTipoVisita("PASE_DIARIO");
		setDefaultTipoPaseId(passId);
		setPaso(2);
	};

	const getDayNames = (days: number[]) => {
		const names = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
		return days.map(d => names[d - 1]).join(", ");
	};

	return (
		<div 
			className="flex flex-col items-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
			suppressHydrationWarning
		>
			<div className="text-center mb-12" suppressHydrationWarning>
				<h2 className="text-4xl font-black text-[#2C3A2C] mb-4 tracking-tighter">
					Personaliza tu Experiencia
				</h2>
				<p className="text-muted-foreground max-w-lg mx-auto font-medium">
					Selecciona el tipo de entrada principal para tu grupo. 
					Podrás agregar invitados en el siguiente paso.
				</p>
			</div>

			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-20">
					<Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
					<p className="font-bold text-primary/60 uppercase tracking-widest text-xs">Cargando opciones...</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4" suppressHydrationWarning>
					{tiposPases?.map((pase) => (
						<div
							key={pase.id}
							onClick={() => handlePassSelect(pase.id)}
							className={`group relative cursor-pointer p-1 rounded-[40px] transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] ${
								defaultTipoPaseId === pase.id
									? "bg-gradient-to-br from-primary to-primary/60 shadow-2xl shadow-primary/20"
									: "bg-gray-100/50 hover:bg-gray-200/50"
							}`}
						>
							<div className="bg-white rounded-[38px] p-10 h-full flex flex-col items-center text-center overflow-hidden relative">
								{/* Glassmorphism accent */}
								<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
								
								<div
									className={`h-24 w-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-500 ${
										defaultTipoPaseId === pase.id
											? "bg-primary text-white rotate-6"
											: "bg-primary/5 text-primary group-hover:rotate-6 group-hover:bg-primary/10"
									}`}
								>
									<Ticket className="h-12 w-12" />
								</div>

								<h3 className="text-2xl font-black text-[#2C3A2C] mb-3 tracking-tight">
									{pase.nombre}
								</h3>
								<p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
									{pase.descripcion || "Acceso completo a las instalaciones del club para un día inolvidable."}
								</p>

								<div className="space-y-4 w-full text-left bg-[#F8FAF8] p-6 rounded-[28px] border border-gray-100 mb-10 group-hover:bg-white transition-colors">
									<div className="flex items-center gap-3 text-sm text-[#2C3A2C] font-semibold">
										<div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm">
											<CheckCircle2 className="h-3.5 w-3.5 text-white" />
										</div>
										Piscinas y Áreas Verdes
									</div>
									<div className="flex items-center gap-3 text-sm text-[#2C3A2C] font-semibold">
										<div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm">
											<CheckCircle2 className="h-3.5 w-3.5 text-white" />
										</div>
										Zonas de Parrilla
									</div>
								</div>

								<Button
									className={`w-full h-14 rounded-2xl font-black text-lg transition-all shadow-xl group-active:scale-95 ${
										defaultTipoPaseId === pase.id
											? "bg-primary hover:bg-primary shadow-primary/20"
											: "bg-[#2C3A2C] hover:bg-black"
									}`}
								>
									Seleccionar <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
