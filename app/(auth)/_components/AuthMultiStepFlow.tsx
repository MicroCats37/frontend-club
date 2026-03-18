"use client";

import { ShieldCheck, TicketCheck, User } from "lucide-react";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "./AuthShell";
import Link from "next/link";
import {
	useRegisterFinal,
	useValidateCIP,
	useValidateCode,
} from "@/hooks/auth/useRegister";
import { useRouter } from "next/navigation";
import {
	type RegisterPasswordFormData,
	RegisterPasswordFormSchema,
	type ValidateCIPData,
	ValidateCIPSchema,
	type ValidateCodeFormData,
	ValidateCodeFormSchema,
} from "@/schemas/auth";
import { Button } from "@/components/ui/button";

type RegistrationStep = "CIP" | "CODE" | "PASSWORD";

interface AuthMultiStepFlowProps {
	titles: {
		CIP: string;
		CODE: string;
		PASSWORD: string;
	};
	descriptions: {
		CIP: string;
		CODE: string;
		PASSWORD: string;
	};
	submitButtons: {
		CIP: string;
		CODE: string;
		PASSWORD: string;
	};
	successMessages?: {
		final?: string;
	};
}

export function AuthMultiStepFlow({
	titles,
	descriptions,
	submitButtons,
	successMessages,
}: AuthMultiStepFlowProps) {
	const [step, setStep] = useState<RegistrationStep>("CIP");
	const [userCip, setUserCip] = useState("");
	const [maskedContact, setMaskedContact] = useState("");
	const router = useRouter();

	// Mutations
	const { mutate: validateCip, isPending: isValidatingCip } = useValidateCIP();
	const { mutate: validateCode, isPending: isValidatingCode } =
		useValidateCode();
	const { mutate: register, isPending: isRegistering } = useRegisterFinal();

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
		register({ ...data, cip: userCip }, {
			onSuccess: () => {
				if (successMessages?.final) {
					toast.success(successMessages.final);
				}
			}
		});
	};

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
			title={titles[step]}
			description={descriptions[step].replace("{maskedContact}", maskedContact)}
		>
			<Card className="border-[#E0E7E0] shadow-sm overflow-hidden">
				<CardContent className="pt-6">
					<div className="flex justify-between mb-8 px-4">
						{["CIP", "CODIGO", "ACCESO"].map((s, idx) => (
							<div key={s} className="flex flex-col items-center">
								<div
									className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step ===
											(s === "CODIGO" ? "CODE" : s === "ACCESO" ? "PASSWORD" : s)
											? "bg-primary text-white"
											: idx <
												["CIP", "CODIGO", "ACCESO"].indexOf(
													s === "CODIGO" && step === "CODE"
														? "CODIGO"
														: s === "ACCESO" && step === "PASSWORD"
															? "ACCESO"
															: step,
												)
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
							submitButtonText={submitButtons.CIP}
						/>
					)}

					{step === "CODE" && (
						<div className="space-y-4">
							<GenericForm<ValidateCodeFormData>
								schema={ValidateCodeFormSchema}
								initialData={{ code: "" }}
								formSections={codeSections}
								onSubmit={handleCodeSubmit}
								isLoading={isValidatingCode}
								submitButtonText={submitButtons.CODE}
							/>
							<Button
								variant="ghost"
								onClick={() => setStep("CIP")}
								className="w-full text-xs font-bold text-[#8BA18B] hover:text-primary transition-colors"
							>
								Volver a ingresar CIP
							</Button>
						</div>
					)}

					{step === "PASSWORD" && (
						<div className="space-y-4">
							<GenericForm<RegisterPasswordFormData>
								schema={RegisterPasswordFormSchema}
								initialData={{ password: "", password_confirm: "" }}
								formSections={passwordSections}
								onSubmit={handlePasswordSubmit}
								isLoading={isRegistering}
								submitButtonText={submitButtons.PASSWORD}
							/>
							<Button
								variant="ghost"
								onClick={() => setStep("CODE")}
								className="w-full text-xs font-bold text-[#8BA18B] hover:text-primary transition-colors"
							>
								Volver a validación de código
							</Button>
						</div>
					)}

					<div className="mt-6 flex flex-col items-center gap-4">
						<Link
							href="/login"
							className="text-sm font-bold text-[#8BA18B] hover:text-primary transition-colors flex items-center gap-2"
						>
							<div className="h-1px w-4 bg-[#E0E7E0] group-hover:bg-primary/30" />
							¿Ya tienes cuenta? Iniciar sesión
							<div className="h-1px w-4 bg-[#E0E7E0] group-hover:bg-primary/30" />
						</Link>
					</div>
				</CardContent>
			</Card>
		</AuthShell>
	);
}
