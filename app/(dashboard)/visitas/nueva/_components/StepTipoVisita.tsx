"use client";

import { ArrowRight, CheckCircle2, Home, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	useVisitaRegistrationStore,
	type VisitaTipo,
} from "@/hooks/visitas/useVisitaRegistrationStore";

export function StepTipoVisita() {
	const { tipoVisita, setTipoVisita, setPaso } = useVisitaRegistrationStore();

	const handleSelect = (tipo: VisitaTipo) => {
		setTipoVisita(tipo);
		// Avanzamos automáticamente al siguiente paso al elegir tipo
		setPaso(2);
	};

	return (
		<div className="flex flex-col items-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="text-center mb-12">
				<h2 className="text-3xl font-black text-[#2C3A2C] mb-4">
					¿Qué tipo de visita deseas realizar?
				</h2>
				<p className="text-muted-foreground max-w-lg mx-auto">
					Elige la modalidad que mejor se adapte a tus planes. Recuerda que los
					beneficios de tu CIP se aplican automáticamente.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl px-4">
				{/* PASE DIARIO */}
				<div
					onClick={() => handleSelect("PASE_DIARIO")}
					className={`group relative cursor-pointer p-1 rounded-[32px] transition-all duration-300 hover:scale-[1.02] ${
						tipoVisita === "PASE_DIARIO"
							? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl"
							: "bg-gray-100"
					}`}
				>
					<div className="bg-white rounded-[31px] p-8 h-full flex flex-col items-center text-center">
						<div
							className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-6 transition-colors ${
								tipoVisita === "PASE_DIARIO"
									? "bg-amber-100 text-amber-600"
									: "bg-amber-50 text-amber-500 group-hover:bg-amber-100"
							}`}
						>
							<TreeDeciduous className="h-10 w-10" />
						</div>

						<h3 className="text-2xl font-black text-[#2C3A2C] mb-3">
							Pase Diario
						</h3>
						<p className="text-sm text-muted-foreground mb-8 leading-relaxed">
							Disfruta de un día campestre con acceso a piscinas, áreas verdes y
							canchas deportivas.
							<span className="block mt-1 font-bold text-amber-600">
								Sin hospedaje incluido.
							</span>
						</p>

						<div className="space-y-3 w-full text-left bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 mb-8">
							<div className="flex items-center gap-3 text-sm text-[#2C3A2C]">
								<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
									<CheckCircle2 className="h-3 w-3 text-white" />
								</div>
								Full Day: 9:00 AM - 6:00 PM
							</div>
							<div className="flex items-center gap-3 text-sm text-[#2C3A2C]">
								<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
									<CheckCircle2 className="h-3 w-3 text-white" />
								</div>
								Acceso a Parrillas y Picnic
							</div>
							<div className="flex items-center gap-3 text-sm text-[#2C3A2C]">
								<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
									<CheckCircle2 className="h-3 w-3 text-white" />
								</div>
								Uso de Piscinas y Canchas
							</div>
						</div>

						<Button
							className={`w-full h-12 rounded-xl font-bold transition-all ${
								tipoVisita === "PASE_DIARIO"
									? "bg-amber-500 hover:bg-amber-600 border-none"
									: "bg-[#2C3A2C] hover:bg-[#1a2b1a]"
							}`}
						>
							Seleccionar <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
					{tipoVisita === "PASE_DIARIO" && (
						<div className="absolute -top-3 -right-3 h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
							<CheckCircle2 className="h-4 w-4 text-white" />
						</div>
					)}
				</div>

				{/* BUNGALOW */}
				<div
					onClick={() => handleSelect("BUNGALOW")}
					className={`group relative cursor-pointer p-1 rounded-[32px] transition-all duration-300 hover:scale-[1.02] ${
						tipoVisita === "BUNGALOW"
							? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl"
							: "bg-gray-100"
					}`}
				>
					<div className="bg-white rounded-[31px] p-8 h-full flex flex-col items-center text-center">
						<div
							className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-6 transition-colors ${
								tipoVisita === "BUNGALOW"
									? "bg-blue-100 text-blue-600"
									: "bg-blue-50 text-blue-500 group-hover:bg-blue-100"
							}`}
						>
							<Home className="h-10 w-10" />
						</div>

						<h3 className="text-2xl font-black text-[#2C3A2C] mb-3">
							Estadía Bungalow
						</h3>
						<p className="text-sm text-muted-foreground mb-8 leading-relaxed">
							Vive la experiencia completa con una estancia relajante.
							<span className="block mt-1 font-bold text-blue-600">
								Alojamiento y entradas incluidas.
							</span>
						</p>

						<div className="space-y-3 w-full text-left bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 mb-8">
							<div className="flex items-center gap-3 text-sm text-[#2C3A2C]">
								<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
									<CheckCircle2 className="h-3 w-3 text-white" />
								</div>
								Check-in 11:00 AM / Check-out 10:00 AM
							</div>
							<div className="flex items-center gap-3 text-sm text-[#2C3A2C]">
								<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
									<CheckCircle2 className="h-3 w-3 text-white" />
								</div>
								Bungalows equipados y cómodos
							</div>
							<div className="flex items-center gap-3 text-sm text-[#2C3A2C]">
								<div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
									<CheckCircle2 className="h-3 w-3 text-white" />
								</div>
								Todos los beneficios del Club
							</div>
						</div>

						<Button
							className={`w-full h-12 rounded-xl font-bold transition-all ${
								tipoVisita === "BUNGALOW"
									? "bg-blue-500 hover:bg-blue-600 border-none"
									: "bg-[#2C3A2C] hover:bg-[#1a2b1a]"
							}`}
						>
							Seleccionar <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
					{tipoVisita === "BUNGALOW" && (
						<div className="absolute -top-3 -right-3 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
							<CheckCircle2 className="h-4 w-4 text-white" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
