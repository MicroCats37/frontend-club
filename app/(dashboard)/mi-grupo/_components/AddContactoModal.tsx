"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { useAddContacto } from "@/hooks/auth/useGrupoActions";

const contactSchema = z.object({
	persona: z.object({
		dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
		nombres: z.string().min(2, "Mínimo 2 caracteres"),
		apellidos: z.string().min(2, "Mínimo 2 caracteres"),
	}),
	etiqueta: z.string().min(1, "La etiqueta es obligatoria"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function AddContactoModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { mutate: addContacto, isPending } = useAddContacto();

	const form = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			persona: {
				dni: "",
				nombres: "",
				apellidos: "",
			},
			etiqueta: "Invitado",
		},
	});

	function onSubmit(values: ContactFormValues) {
		addContacto(values, {
			onSuccess: () => {
				onOpenChange(false);
				form.reset();
			},
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
						<UserPlus className="h-6 w-6 text-primary" />
					</div>
					<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
						Agregar Nuevo Contacto
					</DialogTitle>
					<DialogDescription>
						Registra a tus amigos o invitados frecuentes para agilizar tus
						próximas visitas.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 py-4"
					>
						<FormField
							control={form.control}
							name="persona.dni"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[#4A5D4A] font-bold">
										DNI
									</FormLabel>
									<FormControl>
										<Input placeholder="12345678" {...field} maxLength={8} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="persona.nombres"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-[#4A5D4A] font-bold">
											Nombres
										</FormLabel>
										<FormControl>
											<Input placeholder="Juan" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="persona.apellidos"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-[#4A5D4A] font-bold">
											Apellidos
										</FormLabel>
										<FormControl>
											<Input placeholder="Pérez" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="etiqueta"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[#4A5D4A] font-bold">
										Etiqueta (Opcional)
									</FormLabel>
									<FormControl>
										<Input placeholder="Amigo, Primo, etc." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
								className="bg-[#2C3A2C] hover:bg-[#1a2b1a] text-white"
								disabled={isPending}
							>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								GUARDAR CONTACTO
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
