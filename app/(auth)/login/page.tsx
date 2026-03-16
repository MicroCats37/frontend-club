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
import { useState } from "react";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
			description="Ingresa tus credenciales reservar tus visitas"
		>
			<Card className="border-[#E0E7E0] shadow-2xl overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-md border-opacity-50">
				<CardHeader className="text-center pb-2 pt-8">
					<CardTitle className="text-2xl font-black text-[#2C3A2C] tracking-tight">
						Iniciar Sesión
					</CardTitle>
					<CardDescription className="text-[#8BA18B] font-medium">
						Elige tu método de identificación
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6 pt-4 pb-10 px-8">
					<GenericForm<LoginFormData>
						schema={LoginFormSchema}
						onSubmit={onSubmit}
						initialData={
							{ type: "CIP", cip: "", password: "" } as LoginFormData
						}
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
								<div className="space-y-6">
									{/* Selector de Modo (Dentro del scope del form) */}
									<div className="flex p-1.5 bg-[#F4F7F4] rounded-2xl border border-[#E0E7E0]/60 relative">
										<button
											type="button"
											onClick={() => syncModeChange("CIP")}
											className={cn(
												"flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-500 z-10",
												mode === "CIP"
													? "bg-white text-primary shadow-md shadow-primary/5 scale-[1.02]"
													: "text-[#8BA18B] hover:text-[#2C3A2C]",
											)}
										>
											<Hash
												className={cn(
													"w-4 h-4 transition-colors",
													mode === "CIP" ? "text-primary" : "text-[#8BA18B]",
												)}
											/>
											Ingreso con CIP
										</button>
										<button
											type="button"
											onClick={() => syncModeChange("DNI")}
											className={cn(
												"flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-500 z-10",
												mode === "DNI"
													? "bg-white text-primary shadow-md shadow-primary/5 scale-[1.02]"
													: "text-[#8BA18B] hover:text-[#2C3A2C]",
											)}
										>
											<CreditCard
												className={cn(
													"w-4 h-4 transition-colors",
													mode === "DNI" ? "text-primary" : "text-[#8BA18B]",
												)}
											/>
											Ingreso con DNI
										</button>
									</div>

									<div className="space-y-5">
										{submissionMessage?.type === "error" && (
											<div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-in fade-in slide-in-from-top-2">
												{submissionMessage.message}
											</div>
										)}

										{/* Campo dinámico según modo */}
										<div className="space-y-2.5">
											<Label
												htmlFor="identifier"
												className="text-xs font-bold text-[#2C3A2C] uppercase tracking-wider ml-1"
											>
												{mode === "DNI" ? "Número de DNI" : "Número de CIP"}
											</Label>
											<div className="relative group">
												<User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8BA18B] group-focus-within:text-primary transition-colors" />
												{mode === "DNI" ? (
													<Input
														id="dni"
														type="text"
														inputMode="numeric"
														placeholder="Ej: 12345678"
														maxLength={8}
														className={cn(
															"pl-12 h-14 rounded-2xl border-[#E0E7E0] bg-[#FDFEFC] focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-base font-medium",
															(errors as any).dni &&
																"border-destructive focus:ring-destructive/5 focus:border-destructive",
														)}
														{...register("dni" as never, {
															onChange: (e) => {
																e.target.value = e.target.value.replace(
																	/\D/g,
																	"",
																);
															},
														})}
													/>
												) : (
													<Input
														id="cip"
														type="text"
														inputMode="numeric"
														placeholder="Ej: 123456"
														maxLength={9}
														className={cn(
															"pl-12 h-14 rounded-2xl border-[#E0E7E0] bg-[#FDFEFC] focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-base font-medium",
															(errors as any).cip &&
																"border-destructive focus:ring-destructive/5 focus:border-destructive",
														)}
														{...register("cip" as never, {
															onChange: (e) => {
																e.target.value = e.target.value.replace(
																	/\D/g,
																	"",
																);
															},
														})}
													/>
												)}
											</div>
											{mode === "DNI" && (errors as any).dni && (
												<p className="text-xs font-semibold text-destructive ml-2 animate-in fade-in slide-in-from-top-1">
													{(errors as any).dni.message}
												</p>
											)}
											{mode === "CIP" && (errors as any).cip && (
												<p className="text-xs font-semibold text-destructive ml-2 animate-in fade-in slide-in-from-top-1">
													{(errors as any).cip.message}
												</p>
											)}
										</div>

										{/* Campo de Contraseña */}
										<div className="space-y-2.5">
											<div className="flex items-center justify-between px-1">
												<Label
													htmlFor="password"
													className="text-xs font-bold text-[#2C3A2C] uppercase tracking-wider"
												>
													Contraseña
												</Label>
											</div>
											<div className="relative group">
												<KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8BA18B] group-focus-within:text-primary transition-colors" />
												<Input
													id="password"
													type={showPassword ? "text" : "password"}
													placeholder="••••••••••••"
													className={cn(
														"pl-12 pr-12 h-14 rounded-2xl border-[#E0E7E0] bg-[#FDFEFC] focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-base font-medium",
														errors.password &&
															"border-destructive focus:ring-destructive/5 focus:border-destructive",
													)}
													{...register("password")}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8BA18B] hover:text-primary transition-colors focus:outline-none"
												>
													{showPassword ? (
														<EyeOff className="h-5 w-5" />
													) : (
														<Eye className="h-5 w-5" />
													)}
												</button>
											</div>
											{errors.password && (
												<p className="text-xs font-semibold text-destructive ml-2 animate-in fade-in slide-in-from-top-1">
													{errors.password.message}
												</p>
											)}
										</div>

										<Button
											type="button"
											onClick={handleFormSubmit}
											disabled={isSubmitting}
											className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 mt-4 group"
										>
											{isSubmitting ? (
												<div className="flex items-center gap-3">
													<Loader2 className="w-5 h-5 animate-spin" />
													<span>Verificando credenciales...</span>
												</div>
											) : (
												"Entrar al Portal"
											)}
										</Button>
									</div>
								</div>
							);
						}}
					</GenericForm>

					{/* Registro Link */}
					<div className="text-center pt-4">
						<p className="text-sm text-[#8BA18B] font-medium">
							¿Aún no tienes cuenta?{" "}
							<a
								href="/registro"
								className="font-extrabold text-primary hover:text-primary/80 transition-all border-b-2 border-primary/20 hover:border-primary"
							>
								Crea tu cuenta aquí
							</a>
						</p>
					</div>
				</CardContent>
			</Card>
		</AuthShell>
	);
}
