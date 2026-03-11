"use client";

import { ShieldCheck, TicketCheck, User } from "lucide-react";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import { Card, CardContent } from "@/components/ui/card";
// Hooks
import {
	useRegisterFinal,
	useValidateCIP,
	useValidateCode,
} from "@/hooks/auth/useRegister";
// Schemas & Types
import {
	type RegisterPasswordFormData,
	RegisterPasswordFormSchema,
	type ValidateCIPData,
	ValidateCIPSchema,
	type ValidateCodeFormData,
	ValidateCodeFormSchema,
} from "@/schemas/auth";
// Components
import { AuthShell } from "../_components/AuthShell";

type RegistrationStep = "CIP" | "CODE" | "PASSWORD";

export default function RegisterPage() {
	const [step, setStep] = useState<RegistrationStep>("CIP");
	const [userCip, setUserCip] = useState("");
	const [maskedContact, setMaskedContact] = useState("");

	// Mutations
	const { mutate: validateCip, isPending: isValidatingCip } = useValidateCIP();
	const { mutate: validateCode, isPending: isValidatingCode } =
		useValidateCode();
	const { mutate: register, isPending: isRegistering } = useRegisterFinal();

	// ==========================================
	// HANDLERS
	// ==========================================

	const handleCipSubmit: SubmitHandler<ValidateCIPData> = (data) => {
		validateCip(data, {
			onSuccess: (res) => {
				setUserCip(data.cip);
				setMaskedContact(res.masked_contact);
				setStep("CODE");
				toast.info(`Código enviado a ${res.masked_contact}`);
			},
		});
	};

	const handleCodeSubmit: SubmitHandler<ValidateCodeFormData> = (data) => {
		validateCode(
			{ cip: userCip, code: data.code },
			{
				onSuccess: () => {
					setStep("PASSWORD");
					toast.success("Código verificado exitosamente");
				},
			},
		);
	};

	const handlePasswordSubmit: SubmitHandler<RegisterPasswordFormData> = (
		data,
	) => {
		register({ ...data, cip: userCip });
	};

	// ==========================================
	// FORM SECTIONS
	// ==========================================

	const cipSections: FormSection[] = [
		{
			title: "",
			fields: [
				{
					name: "cip",
					label: "Número de CIP",
					type: "text",
					placeholder: "Ej: 123456",
					required: true,
					icon: User,
				},
			],
		},
	];

	const codeSections: FormSection[] = [
		{
			title: "",
			fields: [
				{
					name: "code",
					label: "Código de Verificación",
					type: "text",
					placeholder: "000000",
					required: true,
					icon: TicketCheck,
				},
			],
		},
	];

	const passwordSections: FormSection[] = [
		{
			title: "",
			fields: [
				{
					name: "password",
					label: "Nueva Contraseña",
					type: "password",
					placeholder: "••••••••",
					required: true,
					icon: ShieldCheck,
				},
				{
					name: "password_confirm",
					label: "Confirmar Contraseña",
					type: "password",
					placeholder: "••••••••",
					required: true,
					icon: ShieldCheck,
				},
			],
		},
	];

	return (
		<AuthShell
			title={
				step === "CIP"
					? "Registro"
					: step === "CODE"
						? "Verificación"
						: "Seguridad"
			}
			description={
				step === "CIP"
					? "Ingresa tu CIP para validar tu colegiatura"
					: step === "CODE"
						? `Hemos enviado un código a ${maskedContact}`
						: "Define una contraseña segura para tu cuenta"
			}
		>
			<Card className="border-[#E0E7E0] shadow-sm overflow-hidden">
				<CardContent className="pt-6">
					{/* Progress Indicator */}
					<div className="flex justify-between mb-8 px-4">
						{["CIP", "CODE", "PASSWORD"].map((s, idx) => (
							<div key={s} className="flex flex-col items-center">
								<div
									className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
										step === s
											? "bg-primary text-white"
											: idx < ["CIP", "CODE", "PASSWORD"].indexOf(step)
												? "bg-primary/20 text-primary"
												: "bg-gray-100 text-gray-400"
									}`}
								>
									{idx + 1}
								</div>
								<span className="text-[10px] mt-1 font-bold text-gray-400 uppercase tracking-tighter">
									{s}
								</span>
							</div>
						))}
					</div>

					{step === "CIP" && (
						<GenericForm<ValidateCIPData>
							schema={ValidateCIPSchema}
							initialData={{ cip: "" }}
							formSections={cipSections}
							onSubmit={handleCipSubmit}
							isLoading={isValidatingCip}
							submitButtonText="Validar Colegiatura"
						/>
					)}

					{step === "CODE" && (
						<GenericForm<ValidateCodeFormData>
							schema={ValidateCodeFormSchema}
							initialData={{ code: "" }}
							formSections={codeSections}
							onSubmit={handleCodeSubmit}
							isLoading={isValidatingCode}
							submitButtonText="Verificar Código"
						/>
					)}

					{step === "PASSWORD" && (
						<GenericForm<RegisterPasswordFormData>
							schema={RegisterPasswordFormSchema}
							initialData={{ password: "", password_confirm: "" }}
							formSections={passwordSections}
							onSubmit={handlePasswordSubmit}
							isLoading={isRegistering}
							submitButtonText="Completar Registro"
						/>
					)}

					<div className="mt-6 text-center text-sm">
						<span className="text-[#8BA18B]">¿Ya tienes cuenta? </span>
						<a
							href="/login"
							className="font-bold text-primary hover:text-primary/80 transition-colors"
						>
							Iniciar sesión
						</a>
					</div>
				</CardContent>
			</Card>
		</AuthShell>
	);
}
