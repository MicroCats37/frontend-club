"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

// Clave publica RSA del comercio (debe coincidir con el portal de Izipay)
const IZIPAY_RSA_KEY =
	"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnbZQIF0Fys/1ib3M1XWUWRwuTQ5s/xlXG+a7BLGR3Wlt5j1/G2ppMWC3c0mSqXTCf2wyihtNm3hirr+edhpbKELcMOAZ/RdiJ9S6re9QYoxpoEDIfFBpd8lC0tzSE/XW1eoCa4YceH1fsm9R843wvzxHN51x71PLxkyt7nd+RjAY4gprwO3siyiZ+4RnX5KXO/UIeO2St4u0H4xsbigqwjoxOEJhCS+COfZFIMDihno2cXPUnQi5Ic3S6ZM5utPqWdBy0GF/FJ30h++0qsgA5VfxHnGtPKQVBOdgTT7HUR04KoSb5VNPgGtjNt4eqmewGfz4gGFPrkkqx9mwsnpcQIDAQAB";

const getCurrentTransactionTime = () => {
	const timestamp = Date.now() * 1000;
	return timestamp.toString();
};

const normalizeAmount = (value: unknown): string => {
	const numericAmount = Number(value);
	if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
		return "1.00";
	}
	return numericAmount.toFixed(2);
};

const sanitizeText = (value: unknown): string =>
	String(value ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();

const sanitizeNamePart = (value: unknown, fallback: string): string => {
	const raw = sanitizeText(value);
	const lettersOnly = raw.replace(/[^a-zA-Z\s]/g, " ").replace(/\s+/g, " ").trim();

	// Evita mandar titulos o placeholders como nombre real
	const lowered = lettersOnly.toLowerCase();
	const forbidden = ["ing", "dr", "dra", "sr", "sra", "test", "usuario"];
	if (!lettersOnly || forbidden.includes(lowered)) {
		return fallback;
	}

	return lettersOnly;
};

const sanitizePhone = (value: unknown): string => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits.length >= 7 ? digits.slice(0, 15) : "999999999";
};

const sanitizeDocument = (value: unknown): string => {
	const digits = String(value ?? "").replace(/\D/g, "");
	return digits.length >= 8 ? digits.slice(0, 12) : "12345678";
};

const sanitizeEmail = (value: unknown): string => {
	const email = String(value ?? "").trim();
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return email;
	}
	return "pagos@ciplima.pe";
};

const buildAddressData = (rawData: any) => ({
	...rawData,
	firstName: sanitizeNamePart(rawData?.firstName, "Juan"),
	lastName: sanitizeNamePart(rawData?.lastName, "Perez"),
	email: sanitizeEmail(rawData?.email),
	phoneNumber: sanitizePhone(rawData?.phoneNumber),
	street: "1295 Charleston Road",
	city: "Lima",
	state: "Lima",
	country: "PE",
	postalCode: "00001",
	documentType: sanitizeText(rawData?.documentType) || "DNI",
	document: sanitizeDocument(rawData?.document),
});

export function IzipayModal({
	isOpen,
	onClose,
	ordenId,
	onSuccess,
}: IzipayModalProps) {
	const [loading, setLoading] = useState(false);

	const handleLaunchIzipay = useCallback(async () => {
		setLoading(true);
		try {
			const response = await api.get(
				`/api/finanzas/pagos/izipay/preparar/${ordenId}`,
			);
			const data = response.data;

			if (!data.success || !data.token) {
				toast.error(data.error || "No se pudo generar el token de pago.");
				onClose();
				return;
			}

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

			// Si backend devuelve config completo, lo respetamos para no romper la firma del token.
			const baseConfig = data.config && typeof data.config === "object" ? data.config : data;
			const orderFromBackend = baseConfig.order || {};
			const billingFromBackend = baseConfig.billing || data.billing || {};
			const shippingFromBackend = baseConfig.shipping || data.shipping || billingFromBackend;

			const finalConfig = {
				action: baseConfig.action || "pay",
				merchantCode: String(baseConfig.merchantCode ?? data.merchantCode ?? ""),
				transactionId: String(baseConfig.transactionId ?? data.transactionId ?? ""),
				order: {
					...orderFromBackend,
					orderNumber: String(orderFromBackend.orderNumber ?? data.orderNumber ?? ""),
					currency: orderFromBackend.currency || "PEN",
					amount: normalizeAmount(orderFromBackend.amount ?? data.amount),
					processType: orderFromBackend.processType || "AT",
					payMethod: "CARD,QR,YAPE_CODE,PAGO_PUSH",
					merchantBuyerId:
						orderFromBackend.merchantBuyerId || billingFromBackend.document || "00000000",
					dateTimeTransaction: getCurrentTransactionTime(),
				},
				billing: buildAddressData(billingFromBackend),
				shipping: buildAddressData(shippingFromBackend),
				render: {
					...(baseConfig.render || {}),
					typeForm: "pop-up",
					container: "#izipay-checkout",
					showButtonProcessForm:
						baseConfig.render?.showButtonProcessForm ?? true,
				},
				language: baseConfig.language,
				urlRedirect: baseConfig.urlRedirect,
				appearance: baseConfig.appearance,
				originEntry: baseConfig.originEntry,
				customFields: Array.isArray(baseConfig.customFields)
					? baseConfig.customFields
					: [],
			};

			console.log("Izipay finalConfig:", finalConfig);

			let checkout: any;
			try {
				checkout = new window.Izipay({ config: finalConfig });
			} catch (sdkInitError: any) {
				console.error("Izipay init error detail:", sdkInitError);
				if (sdkInitError?.Errors) {
					console.error("Izipay init validation errors:", sdkInitError.Errors);
					try {
						console.error(
							"Izipay init validation errors JSON:",
							JSON.stringify(sdkInitError.Errors, null, 2),
						);
					} catch { }
				}
				const firstValidationError =
					sdkInitError?.Errors?.[0]?.message ||
					sdkInitError?.Errors?.[0]?.Message ||
					sdkInitError?.message;

				toast.error(
					firstValidationError
						? `Izipay rechazo la configuracion: ${firstValidationError}`
						: "Izipay rechazo la configuracion inicial del checkout.",
				);
				onClose();
				return;
			}

			const callbackResponsePayment = async (izipayResponse: any) => {
				console.log("Izipay Full Response:", izipayResponse);
				// El campo paymentMethod o brand suele indicar el método usado
				const methodUsed = izipayResponse.paymentMethod || izipayResponse.brand || "Izipay";

				if (izipayResponse.code === "00") {
					try {
						const confirmRes = await api.post(
							"/api/finanzas/pagos/izipay/confirmar",
							{
								orden_id: ordenId,
								kr_answer: izipayResponse,
							},
						);

						if (confirmRes.data.success) {
							toast.success(`Pago con ${methodUsed} realizado con éxito.`);
							onSuccess();
							onClose();
						} else {
							toast.error(confirmRes.data.error || "Error al confirmar el pago.");
						}
					} catch {
						toast.error(
							`Pago con ${methodUsed} detectado, pero hubo error de comunicación. Recarga la página.`,
							{ duration: 8000 },
						);
						setTimeout(() => {
							onSuccess();
							onClose();
						}, 2000);
					}
				} else {
					toast.error(izipayResponse.message || "El pago no pudo ser procesado.");
				}
			};

			try {
				checkout.LoadForm({
					authorization:
						baseConfig.authorization || data.token || data.authorization,
					keyRSA: 'RSA',
					callbackResponse: callbackResponsePayment,
				});
			} catch (sdkLoadError: any) {
				console.error("Izipay LoadForm error detail:", sdkLoadError);
				toast.error("Izipay no pudo abrir el formulario de pago.");
				onClose();
			}
		} catch (error: any) {
			const detail =
				error?.response?.data?.detail ||
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				error?.message ||
				"No se pudo conectar con la pasarela";
			toast.error(`Error: ${detail}`);
			onClose();
		} finally {
			setLoading(false);
		}
	}, [ordenId, onClose, onSuccess]);

	useEffect(() => {
		if (isOpen && ordenId) {
			handleLaunchIzipay();
		}
	}, [isOpen, handleLaunchIzipay, ordenId]);

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
