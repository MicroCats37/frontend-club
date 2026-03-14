"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GenericForm } from "@/components/generic/genericForm/GenericForm";
import type { FormField } from "@/components/generic/genericForm/GenericInput";
import { usePagoActions } from "@/hooks/finanzas/usePagoActions";
import { Wallet, Loader2, Check, AlertTriangle } from "lucide-react";
import * as z from "zod";
import { Button } from "@/components/ui/button";

const paymentSchema = z.object({
	monto: z.coerce.number().min(0.01, "El monto debe ser mayor a cero"),
	metodo: z.enum(["EFECTIVO", "TRANSFERENCIA", "YAPE", "PLIN", "OTRO"]),
	referencia: z.string().min(3, "La referencia es obligatoria (Ej: Nro Operación)"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface ManualPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	ordenId: string;
	montoSugerido: number;
	titulo?: string;
}

export function ManualPaymentModal({
	isOpen,
	onClose,
	ordenId,
	montoSugerido,
	titulo = "Registrar Pago Manual",
}: ManualPaymentModalProps) {
	const { registrarPagoManual } = usePagoActions();
	const [pendingValues, setPendingValues] = useState<PaymentFormValues | null>(null);
	const [isConfirming, setIsConfirming] = useState(false);

	const fields: FormField[] = [
		{
			name: "monto",
			label: "Monto a Pagar (S/)",
			type: "number",
			placeholder: "0.00",
			required: true,
			containerClassName: "col-span-12",
			className: "h-12 rounded-xl bg-gray-50/50 border-gray-100 font-black text-lg",
		},
		{
			name: "metodo",
			label: "Método de Pago",
			type: "select",
			required: true,
			containerClassName: "col-span-12",
			options: [
				{ label: "Efectivo (Caja)", value: "EFECTIVO" },
				{ label: "Yape", value: "YAPE" },
				{ label: "Plin", value: "PLIN" },
				{ label: "Transferencia", value: "TRANSFERENCIA" },
				{ label: "Otro", value: "OTRO" },
			],
		},
		{
			name: "referencia",
			label: "Referencia / Nro Operación",
			type: "text",
			placeholder: "Ej: 12345678",
			required: true,
			containerClassName: "col-span-12",
		},
	];

	// Primero validamos el formulario
	const onFormSubmit = (values: PaymentFormValues) => {
		setPendingValues(values);
		setIsConfirming(true);
	};

	// Luego confirmamos el pago real
	const handleFinalConfirm = async () => {
		if (!pendingValues) return;
		try {
			await registrarPagoManual.mutateAsync({
				orden_id: ordenId,
				...pendingValues,
			});
			setIsConfirming(false);
			setPendingValues(null);
			onClose();
		} catch (error) {
			setIsConfirming(false);
		}
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
					<div className="bg-primary/5 p-8 pb-4">
						<div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
							<Wallet className="h-6 w-6" />
						</div>
						<DialogHeader>
							<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
								{titulo}
							</DialogTitle>
							<DialogDescription className="text-gray-500 font-medium">
								Ingrese los detalles del pago recibido en ventanilla o vía transferencia.
							</DialogDescription>
						</DialogHeader>
					</div>

					<div className="p-8 pt-4">
						<GenericForm
							schema={paymentSchema}
							onSubmit={onFormSubmit}
							fields={fields}
							initialData={{
								monto: montoSugerido,
								metodo: "EFECTIVO",
								referencia: "",
							}}
							submitButtonText="Verificar Pago"
							cancelButtonText="Cancelar"
							onCancel={onClose}
							renderFooter={({ isSubmitting, onCancel, onSubmit }) => (
								<div className="pt-4 flex sm:justify-between gap-3 w-full">
									<Button
										type="button"
										variant="ghost"
										onClick={onCancel}
										className="rounded-xl font-bold text-gray-500"
									>
										Cancelar
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
										onClick={onSubmit}
										className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black px-8 shadow-lg shadow-primary/20"
									>
										{isSubmitting ? (
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
										) : (
											<>
												<Check className="h-4 w-4 mr-2" />
												Siguiente
											</>
										)}
									</Button>
								</div>
							)}
						/>
					</div>
				</DialogContent>
			</Dialog>

			{/* Modal de Confirmación Final */}
			<Dialog open={isConfirming} onOpenChange={setIsConfirming}>
				<DialogContent className="sm:max-w-[400px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
					<div className="bg-amber-50 p-8 pb-4 flex flex-col items-center text-center">
						<div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
							<AlertTriangle className="h-8 w-8" />
						</div>
						<DialogHeader>
							<DialogTitle className="text-2xl font-black text-[#2C3A2C]">
								¿Confirmar Registro?
							</DialogTitle>
							<DialogDescription className="text-amber-800/70 font-bold mt-2">
								Se registrará un pago de <span className="text-amber-900 text-lg">S/ {pendingValues?.monto.toFixed(2)}</span> vía <span className="uppercase">{pendingValues?.metodo}</span>.
							</DialogDescription>
						</DialogHeader>
					</div>
					
					<div className="p-8 pt-6">
						<div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
							<p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Referencia</p>
							<p className="font-bold text-[#2C3A2C]">{pendingValues?.referencia}</p>
						</div>

						<div className="flex flex-col gap-3">
							<Button
								onClick={handleFinalConfirm}
								disabled={registrarPagoManual.isPending}
								className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20"
							>
								{registrarPagoManual.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									"SÍ, REGISTRAR PAGO AHORA"
								)}
							</Button>
							<Button
								variant="ghost"
								onClick={() => setIsConfirming(false)}
								className="rounded-xl font-bold text-gray-400"
							>
								Volver y corregir
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
