"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api/config";

interface IzipayModalProps {
	isOpen: boolean;
	onClose: () => void;
	ordenId: string;
	onSuccess: () => void;
}

declare global {
	interface Window {
		Izipay?: any;
	}
}

// Clave pública RSA del comercio (debe coincidir con el pantallazo del portal)
const IZIPAY_RSA_KEY =
	"MIIBIjANBgkqhikiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnbZQIF0Fys/1ib3M1XWUWRwuTQ5s/xlXG+a7BLGR3Wlt5j1/G2ppMWC3c0mSqXTCf2wyihtNm3hirr+edhpbKELcMOAZ/RdiJ9S6re9QYoxpoEDIfFBpd8lC0tzSE/XW1eoCa4YceH1fsm9R843wvzxHN51x71PLxkyt7nd+RjAY4gprwO3siyiZ+4RnX5KXO/UIeO2St4u0H4xsbigqwjoxOEJhCS+COfZFIMDihno2cXPUnQi5Ic3S6ZM5utPqWdBy0GF/FJ30h++0qsgA5VfxHnGtPKQVBOdgTT7HUR04KoSb5VNPgGtjNt4eqmewGfz4gGFPrkkqx9mwsnpcQIDAQAB";

export function IzipayModal({
	isOpen,
	onClose,
	ordenId,
	onSuccess,
}: IzipayModalProps) {
	const [loading, setLoading] = useState(false);



	const handleLaunchIzipay = async () => {
		setLoading(true);
		try {
			// 1. Obtener token y configuración desde el backend
			const response = await api.get(
				`/api/finanzas/pagos/izipay/preparar/${ordenId}`,
			);
			const data = response.data;
			console.log("DEBUG: Datos recibidos del backend:", data);

			if (!data.success || !data.token) {
				toast.error(data.error || "No se pudo generar el token de pago.");
				onClose();
				return;
			}

			// 2. Verificar que el SDK esté cargado (con reintentos)
			let retries = 0;
			while (!window.Izipay && retries < 30) {
				await new Promise((resolve) => setTimeout(resolve, 100));
				retries++;
			}

			if (!window.Izipay) {
				toast.error("El SDK de Izipay no se ha cargado correctamente.");
				onClose();
				return;
			}

			// 3. Configurar el objeto iziConfig con mayor robustez
			const iziConfig = {
				action: "pay",
				merchantCode: data.merchantCode,
				transactionId: data.transactionId,
				order: {
					orderNumber: data.orderNumber,
					currency: "PEN",
					amount: Number(data.amount), // Debe ser número
					processType: "AT",
					merchantBuyerId: data.billing?.document || "00000000",
					dateTimeTransaction:
						data.order?.dateTimeTransaction || (Date.now() * 1000).toString(),
				},
				billing: data.billing,
				shipping: data.shipping,
				render: {
					typeForm: "pop-up",
					container: "#izipay-checkout",
					showButtonProcessForm: true,
				},
			};

			console.log("Configurando Izipay con:", iziConfig);

			// 4. Instanciar e iniciar el Checkout
			const checkout = new window.Izipay({ config: iziConfig });

			const callbackResponsePayment = async (response: any) => {
				console.log("Respuesta Izipay:", response);

				if (response.code === "00") {
					// 5. Confirmar el pago en el backend
					try {
						const confirmRes = await api.post(
							"/api/finanzas/pagos/izipay/confirmar",
							{
								orden_id: ordenId,
								kr_answer: response,
							},
						);

						if (confirmRes.data.success) {
							toast.success("¡Pago realizado con éxito!");
							onSuccess();
							onClose();
						} else {
							toast.error(
								confirmRes.data.error || "Error al confirmar el pago.",
							);
						}
					} catch (err: any) {
						console.error("Error de confirmación:", err);
						toast.error(
							"Error de comunicación. Si ya pagaste, recarga la página para ver el cambio.",
							{
								duration: 8000,
							},
						);
						// Intentamos cerrar de todas formas para no bloquear al usuario
						setTimeout(() => {
							onSuccess();
							onClose();
						}, 2000);
					}
				} else {
					toast.error(response.message || "El pago no pudo ser procesado.");
				}
			};

			checkout.LoadForm({
				authorization: data.token,
				keyRSA: IZIPAY_RSA_KEY, // Pasar la llave real, no el string "RSA"
				callbackResponse: callbackResponsePayment,
			});
		} catch (error: any) {
			console.error("Error al iniciar Izipay:", error);
			toast.error(
				`Error: ${error.message || "No se pudo conectar con la pasarela"}`,
			);
			onClose();
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		if (isOpen && ordenId) {
			handleLaunchIzipay();
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[400px] border-none shadow-none bg-transparent">
				<DialogHeader className="sr-only">
					<DialogTitle>Pasarela de Pago Izipay</DialogTitle>
				</DialogHeader>
				{loading && (
					<div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] shadow-2xl gap-4">
						<Loader2 className="h-12 w-12 text-primary animate-spin" />
						<p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
							Iniciando pasarela...
						</p>
					</div>
				)}
				<div id="izipay-checkout" className="w-full"></div>
			</DialogContent>
		</Dialog>
	);
}
