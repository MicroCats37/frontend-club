"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useConvertirAFamiliar,
	useSolicitarBeneficio,
} from "@/hooks/auth/useGrupoActions";
import { handleApiError } from "@/lib/api/error-handler";

const upgradeSchema = z.object({
	parentesco: z.string().optional(),
});

type UpgradeFormValues = z.infer<typeof upgradeSchema>;

export function UpgradeFamiliarModal({
	open,
	onOpenChange,
	vinculoId,
	contactoDni,
	contactoNombre,
	isAlreadyFamiliar = false,
	isRejected = false,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	vinculoId: string;
	contactoDni: string;
	contactoNombre: string;
	isAlreadyFamiliar?: boolean;
	isRejected?: boolean;
}) {
	const { mutate: upgrade, isPending: isPendingUpgrade } =
		useConvertirAFamiliar();
	const { mutate: solicitatBeneficio, isPending: isPendingSolicitud } =
		useSolicitarBeneficio();
	const isPending = isPendingUpgrade || isPendingSolicitud;

	const [fotoFrontal, setFotoFrontal] = useState<File | null>(null);
	const [fotoReverso, setFotoReverso] = useState<File | null>(null);

	const form = useForm<UpgradeFormValues>({
		resolver: zodResolver(upgradeSchema),
		defaultValues: {
			parentesco: "",
		},
	});

	function onSubmit(values: UpgradeFormValues) {
		if (isAlreadyFamiliar && !isRejected) {
			if (!fotoReverso) {
				toast.error("Debe subir la foto reversa del DNI");
				return;
			}
			solicitatBeneficio(
				{
					id: vinculoId,
					foto_reverso: fotoReverso,
				},
				{
					onSuccess: () => {
						toast.success("Solicitud de beneficios enviada con éxito.");
						onOpenChange(false);
						setFotoReverso(null);
					},
					onError: (err) => handleApiError(err),
				},
			);
		} else {
			if (!isAlreadyFamiliar && !values.parentesco) {
				toast.error("Debe seleccionar un parentesco");
				return;
			}
			if (!fotoFrontal || !fotoReverso) {
				toast.error("Debe subir ambas fotos del DNI (Frontal y Reverso)");
				return;
			}
			upgrade(
				{
					dni: contactoDni,
					parentesco: values.parentesco || "",
					foto_frontal: fotoFrontal,
					foto_reverso: fotoReverso,
				},
				{
					onSuccess: () => {
						toast.success(
							isRejected
								? "Solicitud corregida enviada al administrador."
								: "Solicitud de familiar enviada con éxito.",
						);
						onOpenChange(false);
						form.reset();
						setFotoFrontal(null);
						setFotoReverso(null);
					},
					onError: (err) => handleApiError(err),
				},
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
						<ShieldCheck className="h-6 w-6 text-blue-600" />
					</div>
					<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
						{isRejected
							? "Corregir Documentación"
							: isAlreadyFamiliar
								? "Obtener Beneficios"
								: "Ascender a Familiar"}
					</DialogTitle>
					<DialogDescription>
						{isRejected ? (
							<>
								Tu solicitud previa fue rechazada. Por favor, sube{" "}
								<span className="font-bold text-red-600">
									ambas fotos del DNI
								</span>{" "}
								de{" "}
								<span className="font-bold text-primary">{contactoNombre}</span>{" "}
								correctamente.
							</>
						) : isAlreadyFamiliar ? (
							<>
								Sube el reverso del DNI de{" "}
								<span className="font-bold text-primary">{contactoNombre}</span>{" "}
								para solicitar privilegios de beneficiario.
							</>
						) : (
							<>
								Convierte a{" "}
								<span className="font-bold text-primary">{contactoNombre}</span>{" "}
								en familiar para que pueda acceder como beneficiario.
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6 py-4"
					>
						{!isAlreadyFamiliar && (
							<FormField
								control={form.control}
								name="parentesco"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-[#4A5D4A] font-bold">
											Relación / Parentesco
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el vínculo" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="CONYUGE">Cónyuge</SelectItem>
												<SelectItem value="HIJO">Hijo/a</SelectItem>
												<SelectItem value="PADRE">Padre</SelectItem>
												<SelectItem value="MADRE">Madre</SelectItem>
												<SelectItem value="HERMANO">Hermano/a</SelectItem>
												<SelectItem value="OTRO">Otro</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<div className="space-y-4">
							<FormLabel className="text-[#4A5D4A] font-bold block">
								Documentación (DNI)
							</FormLabel>

							<div className="grid grid-cols-2 gap-4">
								{(!isAlreadyFamiliar || isRejected) && (
									<div className="space-y-2">
										<p className="text-[10px] font-bold uppercase text-muted-foreground">
											Foto Frontal
										</p>
										<div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer group">
											<input
												type="file"
												className="absolute inset-0 opacity-0 cursor-pointer"
												accept="image/*"
												onChange={(e) =>
													setFotoFrontal(e.target.files?.[0] || null)
												}
											/>
											{fotoFrontal ? (
												<div className="text-center">
													<div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
														<ShieldCheck className="h-5 w-5 text-green-600" />
													</div>
													<p className="text-[10px] truncate max-w-[120px]">
														{fotoFrontal.name}
													</p>
												</div>
											) : (
												<>
													<Upload className="h-6 w-6 text-slate-400 group-hover:text-primary mb-1" />
													<span className="text-[10px] font-medium text-slate-500">
														Subir Frontal
													</span>
												</>
											)}
										</div>
									</div>
								)}

								<div className="space-y-2">
									<p className="text-[10px] font-bold uppercase text-muted-foreground">
										Foto Reverso
									</p>
									<div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer group">
										<input
											type="file"
											className="absolute inset-0 opacity-0 cursor-pointer"
											accept="image/*"
											onChange={(e) =>
												setFotoReverso(e.target.files?.[0] || null)
											}
										/>
										{fotoReverso ? (
											<div className="text-center">
												<div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
													<ShieldCheck className="h-5 w-5 text-green-600" />
												</div>
												<p className="text-[10px] truncate max-w-[120px]">
													{fotoReverso.name}
												</p>
											</div>
										) : (
											<>
												<Upload className="h-6 w-6 text-slate-400 group-hover:text-primary mb-1" />
												<span className="text-[10px] font-medium text-slate-500">
													Subir Reverso
												</span>
											</>
										)}
									</div>
								</div>
							</div>
							<p className="text-[10px] text-muted-foreground italic">
								* Se requieren fotos nítidas del DNI para validar el parentesco.
							</p>
						</div>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								className="bg-blue-600 hover:bg-blue-700 text-white"
								disabled={
									isPending ||
									(!isAlreadyFamiliar && (!fotoFrontal || !fotoReverso)) ||
									(isAlreadyFamiliar && !fotoReverso)
								}
							>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isRejected
									? "ENVIAR CORRECCIÓN"
									: isAlreadyFamiliar
										? "SOLICITAR PRIVILEGIOS"
										: "ENVIAR SOLICITUD"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
