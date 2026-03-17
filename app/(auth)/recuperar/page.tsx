"use client";

import { AuthMultiStepFlow } from "../_components/AuthMultiStepFlow";

export default function RecoverPage() {
	return (
		<AuthMultiStepFlow
			titles={{
				CIP: "Recuperar Acceso",
				CODE: "Verificación de Identidad",
				PASSWORD: "Restablecer Contraseña",
			}}
			descriptions={{
				CIP: "Ingresa tu CIP para validar tu identidad e iniciar el proceso de recuperación",
				CODE: "Por seguridad, hemos enviado un código a {maskedContact}",
				PASSWORD: "Define tu nueva contraseña de acceso",
			}}
			submitButtons={{
				CIP: "Iniciar Recuperación",
				CODE: "Validar Identidad",
				PASSWORD: "Restablecer Contraseña",
			}}
			successMessages={{
				final: "¡Contraseña restablecida exitosamente!",
			}}
		/>
	);
}
