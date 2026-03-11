"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVisitaRegistrationStore } from "@/hooks/visitas/useVisitaRegistrationStore";
import { StepBungalowSelection } from "./_components/StepBungalowSelection";
import { StepDateSelection } from "./_components/StepDateSelection";
import { StepPricingAndCoupons } from "./_components/StepPricingAndCoupons";
import { StepReviewAndConfirm } from "./_components/StepReviewAndConfirm";
import { StepTipoVisita } from "./_components/StepTipoVisita";
import { StepVisitorSelection } from "./_components/StepVisitorSelection";

export default function NuevaVisitaPage() {
	const { pasoActual, setPaso, reset, tipoVisita } =
		useVisitaRegistrationStore();

	const handleBack = () => {
		if (pasoActual === 1) {
			reset();
		} else {
			setPaso(pasoActual - 1);
		}
	};

	// Definición dinámica de pasos según la modalidad
	const orderedSteps = [
		{ id: 1, label: "Modalidad" },
		{ id: 2, label: "Fechas" },
		...(tipoVisita === "BUNGALOW" ? [{ id: 3, label: "Alojamiento" }] : []),
		{ id: tipoVisita === "BUNGALOW" ? 4 : 3, label: "Invitados" },
		{ id: tipoVisita === "BUNGALOW" ? 5 : 4, label: "Precios" },
		{ id: tipoVisita === "BUNGALOW" ? 6 : 5, label: "Finalizar" },
	];

	const totalSteps = orderedSteps.length;

	return (
		<div className="container mx-auto py-8">
			{/* Header con Barra de Progreso */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 pb-6 border-b">
				<div className="flex items-center gap-4">
					<Link href="/visitas">
						<Button
							variant="outline"
							size="icon"
							className="rounded-2xl border-gray-200"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="text-4xl font-black text-[#2C3A2C]">
							Programar Visita
						</h1>
						<p className="text-muted-foreground mt-1">
							{tipoVisita
								? `Modalidad: ${tipoVisita === "PASE_DIARIO" ? "Full Day" : "Bungalow"}`
								: "Sigue los pasos para tu próxima visita."}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 bg-white p-3 md:p-4 rounded-[24px] border border-gray-100 shadow-sm overflow-x-auto max-w-full">
					{orderedSteps.map((step, index) => (
						<div key={step.id} className="flex items-center shrink-0">
							<div className="flex flex-col items-center gap-1.5 ">
								<div
									className={`
                                        h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                        ${pasoActual >= step.id ? "bg-amber-500 text-white shadow-md" : "bg-gray-50 text-gray-400 border border-gray-100"}
                                        ${pasoActual === step.id ? "ring-4 ring-amber-100 scale-105" : ""}
                                    `}
								>
									{pasoActual > step.id ? (
										<CheckCircle2 className="h-5 w-5" />
									) : (
										index + 1
									)}
								</div>
								<span
									className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${pasoActual >= step.id ? "text-amber-600" : "text-gray-400"}`}
								>
									{step.label}
								</span>
							</div>
							{index < totalSteps - 1 && (
								<div
									className={`h-[1.5px] w-4 md:w-8 mx-1 transition-colors duration-500 rounded-full ${pasoActual > step.id ? "bg-amber-500" : "bg-gray-100"}`}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Wizard Contenido */}
			<div className="min-h-[500px]">
				{pasoActual === 1 && <StepTipoVisita />}
				{pasoActual === 2 && <StepDateSelection />}
				{pasoActual === 3 && tipoVisita === "BUNGALOW" && (
					<StepBungalowSelection />
				)}
				{pasoActual === (tipoVisita === "BUNGALOW" ? 4 : 3) && (
					<StepVisitorSelection />
				)}
				{pasoActual === (tipoVisita === "BUNGALOW" ? 5 : 4) && (
					<StepPricingAndCoupons />
				)}
				{pasoActual === (tipoVisita === "BUNGALOW" ? 6 : 5) && (
					<StepReviewAndConfirm />
				)}
			</div>

			{/* Navegación Inferior */}
			{pasoActual > 1 && (
				<div className="mt-12 flex justify-between items-center bg-white p-6 rounded-[32px] border shadow-sm border-gray-100">
					<Button
						variant="ghost"
						onClick={handleBack}
						className="rounded-2xl px-8 h-12 font-bold text-gray-500 hover:bg-gray-50"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Volver
					</Button>

					<div className="hidden md:flex items-center gap-4">
						<div className="text-right">
							<p className="text-[10px] uppercase font-black text-gray-400">
								Progreso
							</p>
							<p className="text-xs font-bold text-[#2C3A2C]">
								Paso {pasoActual} de {totalSteps}
							</p>
						</div>
						<div className="h-10 w-[2px] bg-gray-100" />
						<div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
							<div
								className="h-full bg-amber-500 transition-all duration-500"
								style={{ width: `${(pasoActual / totalSteps) * 100}%` }}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
