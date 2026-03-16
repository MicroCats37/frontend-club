"use client";

import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	useVisitaRegistrationStore,
	type VisitaTipo,
} from "@/hooks/visitas/useVisitaRegistrationStore";
import { StepBungalowGuestSelection } from "./_components/StepBungalowGuestSelection";
import { StepBungalowSelection } from "./_components/StepBungalowSelection";
import { StepDateSelection } from "./_components/StepDateSelection";
import { StepReviewAndConfirm } from "./_components/StepReviewAndConfirm";
import { StepSuccess } from "./_components/StepSuccess";
import { StepTipoVisita } from "./_components/StepTipoVisita";
import { StepVisitorSelection } from "./_components/StepVisitorSelection";

function NuevaVisitaContent() {
	const searchParams = useSearchParams();
	const {
		pasoActual,
		setPaso,
		reset,
		tipoVisita,
		setTipoVisita,
		setDefaultTipoPaseId,
		setTipoTarifaId,
	} = useVisitaRegistrationStore();

	// Limpiar el estado al entrar a la página o inicializar desde parámetros
	// biome-ignore lint/correctness/useExhaustiveDependencies: Solo queremos resetear/inicializar al montar
	useEffect(() => {
		const type = searchParams.get("type");
		const paseId = searchParams.get("paseId");
		const tarifaId = searchParams.get("tarifaId");

		// Primero reseteamos para limpiar cualquier estado previo colgado
		reset();

		if (type) {
			// Si viene tipo, el store automáticamente pone Paso 2
			setTipoVisita(type as VisitaTipo);
			if (paseId) setDefaultTipoPaseId(paseId);
			if (tarifaId) setTipoTarifaId(tarifaId);
		}
	}, []);

	const handleBack = () => {
		if (pasoActual === 1) {
			reset();
		} else {
			setPaso(pasoActual - 1);
		}
	};

	// Definición de pasos dinámica
	const orderedSteps =
		tipoVisita === "BUNGALOW"
			? [
					{ id: 1, label: "Experiencia" },
					{ id: 2, label: "Fechas" },
					{ id: 3, label: "Bungalows" },
					{ id: 4, label: "Huéspedes" },
					{ id: 5, label: "Finalizar" },
					{ id: 6, label: "Éxito" },
				]
			: [
					{ id: 1, label: "Experiencia" },
					{ id: 2, label: "Fechas" },
					{ id: 3, label: "Invitados" },
					{ id: 4, label: "Finalizar" },
					{ id: 5, label: "Éxito" },
				];

	const totalSteps = orderedSteps.length;

	return (
		<div className="min-h-screen bg-[#FDFDFD] flex flex-col">
			<div className="container mx-auto px-4 sm:px-[5vw] py-6 sm:py-10 flex-1">
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
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2C3A2C] tracking-tight">
								Programar Visita
							</h1>
							<p className="text-muted-foreground mt-2 text-sm sm:text-base font-medium">
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

					{/* Lógica Condicional por Tipo de Visita */}
					{tipoVisita === "BUNGALOW" ? (
						<>
							{pasoActual === 3 && <StepBungalowSelection />}
							{pasoActual === 4 && <StepBungalowGuestSelection />}
							{pasoActual === 5 && <StepReviewAndConfirm />}
							{pasoActual === 6 && <StepSuccess />}
						</>
					) : (
						<>
							{pasoActual === 3 && <StepVisitorSelection />}
							{pasoActual === 4 && <StepReviewAndConfirm />}
							{pasoActual === 5 && <StepSuccess />}
						</>
					)}
				</div>

				{/* Navegación Inferior - Adaptada para Mobile Sticky */}
				{pasoActual > 1 && pasoActual < totalSteps && (
					<div className="sticky bottom-4 left-0 right-0 z-50 px-4 sm:px-0 mt-12">
						<div className="max-w-5xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
							<Button
								variant="ghost"
								onClick={handleBack}
								className="rounded-2xl px-6 sm:px-8 h-12 font-black text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />{" "}
								<span className="hidden sm:inline">Volver</span>
							</Button>

							<div className="flex items-center gap-4">
								<div className="hidden sm:block text-right">
									<p className="text-[10px] uppercase font-black text-gray-400">
										Progreso
									</p>
									<p className="text-xs font-bold text-[#2C3A2C]">
										Paso {pasoActual} de {totalSteps}
									</p>
								</div>
								<div className="hidden sm:block h-10 w-[2px] bg-gray-100" />

								<div className="sm:hidden text-center mr-2">
									<span className="text-[10px] font-black text-amber-600">
										{pasoActual}/{totalSteps}
									</span>
								</div>

								<div className="w-20 sm:w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
									<div
										className="h-full bg-amber-500 transition-all duration-500"
										style={{ width: `${(pasoActual / totalSteps) * 100}%` }}
									/>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function NuevaVisitaPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
				</div>
			}
		>
			<NuevaVisitaContent />
		</Suspense>
	);
}
