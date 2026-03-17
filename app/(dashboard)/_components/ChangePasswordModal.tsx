"use client";

import { ShieldCheck, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormSection } from "@/components/generic/genericForm/GenericInput";
import {
	RegisterPasswordFormSchema,
	type RegisterPasswordFormData,
} from "@/schemas/auth/register";
import { useChangePassword } from "@/hooks/auth/useAuth";

interface ChangePasswordModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
	open,
	onOpenChange,
}: ChangePasswordModalProps) {
	const { mutate: changePassword, isPending } = useChangePassword();

	const formMethods = useForm<RegisterPasswordFormData>({
		resolver: zodResolver(RegisterPasswordFormSchema),
		defaultValues: {
			password: "",
			password_confirm: "",
		},
	});

	const onSubmit = (data: RegisterPasswordFormData) => {
		changePassword(data, {
			onSuccess: () => {
				onOpenChange(false);
				formMethods.reset();
			},
			onError: (error: any) => {
				toast.error(
					error.response?.data?.detail || "Error al cambiar la contraseña",
				);
			},
		});
	};

	const passwordSections: FormSection[] = [
		{
			title: "Nueva Contraseña",
			description: "Asegúrate de que sea una contraseña segura",
			icon: Lock,
			fields: [
				{
					name: "password",
					label: "Nueva Contraseña",
					type: "password",
					placeholder: "••••••••",
					required: true,
					icon: ShieldCheck,
					containerClassName: "col-span-12",
				},
				{
					name: "password_confirm",
					label: "Confirmar Contraseña",
					type: "password",
					placeholder: "••••••••",
					required: true,
					icon: ShieldCheck,
					containerClassName: "col-span-12",
				},
			],
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md w-[95vw] p-0 overflow-hidden border-none shadow-2xl">
				<div className="h-1.5 w-full bg-primary" />
				<div className="p-6">
					<DialogHeader className="mb-6">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
							<ShieldCheck className="h-6 w-6" />
						</div>
						<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
							Cambiar Contraseña
						</DialogTitle>
						<DialogDescription className="text-sm text-[#8BA18B]">
							Ingresa tu nueva contraseña para actualizar tu acceso.
						</DialogDescription>
					</DialogHeader>

					<GenericForm<RegisterPasswordFormData>
						formMethods={formMethods}
						schema={RegisterPasswordFormSchema}
						formSections={passwordSections}
						onSubmit={onSubmit}
						isLoading={isPending}
						submitButtonText={isPending ? "ACTUALIZANDO..." : "CAMBIAR CONTRASEÑA"}
						onCancel={() => onOpenChange(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
