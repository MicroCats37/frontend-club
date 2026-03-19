"use client";

import {
	CreditCard,
	Eye,
	EyeOff,
	Hash,
	KeyRound,
	Loader2,
	User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Hook & Types
import { useLogin } from "@/hooks/auth/useAuth";
import { cn } from "@/lib/utils";
import { type LoginFormData, LoginFormSchema } from "@/schemas/auth";
// Components
import { AuthShell } from "../_components/AuthShell";

/**
 * Página de Inicio de Sesión Rediseñada
 * Permite alternar entre ingreso por DNI y CIP con campos específicos.
 */
export default function LoginPage() {
	const { mutate: login } = useLogin();
	const [mode, setMode] = useState<"DNI" | "CIP">("CIP");
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = (data: LoginFormData) => {
		login(data);
	};

	return (
		<AuthShell
			title="Portal CIP"
			description="Accede a tu cuenta para gestionar tus visitas, bungalows y beneficios exclusivos."
		>
			<div className="space-y-10">
				<GenericForm<LoginFormData>
					schema={LoginFormSchema}
					onSubmit={onSubmit}
					initialData={{ type: "CIP", cip: "", password: "" } as LoginFormData}
				>
					{(formProps) => {
						const {
							methods,
							isSubmitting,
							onSubmit: handleFormSubmit,
							submissionMessage,
						} = formProps;
						const {
							register,
							formState: { errors },
						} = methods;

						const syncModeChange = (newMode: "DNI" | "CIP") => {
							setMode(newMode);
							methods.setValue("type", newMode);
							if (newMode === "DNI") methods.setValue("cip", "" as any);
							else methods.setValue("dni", "" as any);
						};

						return (
							<div className="space-y-10">
								{/* Selector de Modo - Estilo Squircle */}
								<div className="flex p-2 bg-[#F4F7F4] rounded-[2rem] border border-[#E0E7E0]/40 relative">
									<button
										type="button"
										onClick={() => syncModeChange("CIP")}
										className={cn(
											"flex-1 flex items-center justify-center gap-3 py-4 text-sm font-black rounded-[1.8rem] transition-all duration-500 z-10",
											mode === "CIP"
												? "bg-white text-[#2C3A2C] shadow-sm scale-[1.02]"
												: "text-[#8BA18B] hover:text-[#2C3A2C]",
										)}
									>
										<Hash
											className={cn(
												"w-4 h-4",
												mode === "CIP" ? "text-primary" : "text-[#8BA18B]",
											)}
										/>
										INGRESO CIP
									</button>
									<button
										type="button"
										onClick={() => syncModeChange("DNI")}
										className={cn(
											"flex-1 flex items-center justify-center gap-3 py-4 text-sm font-black rounded-[1.8rem] transition-all duration-500 z-10",
											mode === "DNI"
												? "bg-white text-[#2C3A2C] shadow-sm scale-[1.02]"
												: "text-[#8BA18B] hover:text-[#2C3A2C]",
										)}
									>
										<CreditCard
											className={cn(
												"w-4 h-4",
												mode === "DNI" ? "text-primary" : "text-[#8BA18B]",
											)}
										/>
										INGRESO DNI
									</button>
								</div>

								<div className="space-y-8">
									{submissionMessage?.type === "error" && (
										<div className="p-4 rounded-[1.5rem] bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 text-center">
											{submissionMessage.message}
										</div>
									)}

									{/* Campo dinámico */}
									<div className="space-y-3">
										<Label className="text-[10px] font-black text-[#2C3A2C] uppercase tracking-[0.2em] ml-5">
											{mode === "DNI"
												? "Documento Nacional de Identidad"
												: "Número de Colegiatura (CIP)"}
										</Label>
										<div className="relative group">
											<User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8BA18B] group-focus-within:text-primary transition-colors duration-300" />
											<Input
												id={mode === "DNI" ? "dni" : "cip"}
												type="text"
												inputMode="numeric"
												placeholder={
													mode === "DNI" ? "Ej: 12345678" : "Ej: 123456"
												}
												maxLength={mode === "DNI" ? 8 : 9}
												className={cn(
													"pl-14 h-16 rounded-[2rem] border-[#E0E7E0] bg-white focus:ring-[6px] focus:ring-primary/5 focus:border-primary transition-all text-base font-bold",
													(errors as any)[mode.toLowerCase()] &&
														"border-red-300 focus:ring-red-100 focus:border-red-400",
												)}
												{...register((mode === "DNI" ? "dni" : "cip") as any, {
													onChange: (e) => {
														e.target.value = e.target.value.replace(/\D/g, "");
													},
												})}
											/>
										</div>
										{(errors as any)[mode.toLowerCase()] && (
											<p className="text-[11px] font-black text-red-500 uppercase tracking-tighter px-6 animate-in fade-in slide-in-from-top-1">
												{(errors as any)[mode.toLowerCase()].message}
											</p>
										)}
									</div>

									{/* Contraseña */}
									<div className="space-y-3">
										<div className="flex items-center justify-between px-5">
											<Label className="text-[10px] font-black text-[#2C3A2C] uppercase tracking-[0.2em]">
												Contraseña
											</Label>
											<Link
												href="/recuperar"
												className="text-[10px] font-black text-primary hover:text-emerald-700 uppercase tracking-tighter decoration-primary/20 decoration-2 underline underline-offset-4 transition-all"
											>
												¿LA OLVIDASTE?
											</Link>
										</div>
										<div className="relative group">
											<KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8BA18B] group-focus-within:text-primary transition-colors duration-300" />
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="••••••••••••"
												className={cn(
													"pl-14 pr-16 h-16 rounded-[2rem] border-[#E0E7E0] bg-white focus:ring-[6px] focus:ring-primary/5 focus:border-primary transition-all text-base font-bold",
													errors.password &&
														"border-red-300 focus:ring-red-100 focus:border-red-400",
												)}
												{...register("password")}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-6 top-1/2 -translate-y-1/2 text-[#8BA18B] hover:text-primary transition-colors p-2"
											>
												{showPassword ? (
													<EyeOff className="h-5 w-5" />
												) : (
													<Eye className="h-5 w-5" />
												)}
											</button>
										</div>
										{errors.password && (
											<p className="text-[11px] font-black text-red-500 uppercase tracking-tighter px-6 animate-in fade-in slide-in-from-top-1">
												{errors.password.message}
											</p>
										)}
									</div>

									<Button
										type="button"
										onClick={handleFormSubmit}
										disabled={isSubmitting}
										className="w-full h-16 rounded-[2rem] bg-[#2C3A2C] hover:bg-black text-white font-black text-base uppercase tracking-[0.1em] shadow-2xl shadow-[#2C3A2C]/10 active:scale-[0.98] transition-all disabled:opacity-70 group"
									>
										{isSubmitting ? (
											<div className="flex items-center gap-4">
												<Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
												<span>VERIFICANDO...</span>
											</div>
										) : (
											"ENTRAR AL PORTAL"
										)}
									</Button>
								</div>

								<div className="text-center">
									<p className="text-sm text-[#8BA18B] font-medium">
										¿No tienes una cuenta?{" "}
										<Link
											href="/registro"
											className="font-black text-primary hover:text-emerald-700 decoration-primary/20 decoration-2 underline underline-offset-4 transition-all"
										>
											REGÍSTRATE AQUÍ
										</Link>
									</p>
								</div>
							</div>
						);
					}}
				</GenericForm>
			</div>
		</AuthShell>
	);
}
