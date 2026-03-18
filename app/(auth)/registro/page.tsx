"use client";

import { AuthMultiStepFlow } from "../_components/AuthMultiStepFlow";

export default function RegisterPage() {
	return (
		<AuthMultiStepFlow
			titles={{
				CIP: "Activar Cuenta",
				CODE: "Verificación",
				PASSWORD: "Seguridad",
			}}
			descriptions={{
				CIP: "Valida tu CIP para configurar tu acceso",
				CODE: "Hemos enviado un código a {maskedContact}",
				PASSWORD: "Define tu contraseña para entrar al portal",
			}}
			submitButtons={{
				CIP: "Validar Colegiatura",
				CODE: "Verificar Código",
				PASSWORD: "Activar Acceso",
			}}
			successMessages={{
				final: "¡Cuenta activada exitosamente!",
			}}
		/>
	);
}
