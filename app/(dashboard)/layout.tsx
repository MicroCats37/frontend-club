// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import AuthInitializer from "@/components/auth/AuthInitializer";
import { getUserSession } from "@/lib/auth/cookies";
import { DashboardShell } from "./_components/DashboardShell";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// 1. Obtener la sesión desde la cookie (Server Side)
	const user = await getUserSession();

	// 2. Si no hay usuario en sesión, redirigir al login
	if (!user) {
		// Importante: No podemos usar redirect() aquí si el middleware nos va a mandar de vuelta.
		// En este caso, el usuario debe re-autenticarse para regenerar la cookie 'user-session'
		redirect("/login?error=session_expired");
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Sincronizar el store de Zustand con el usuario del servidor */}
			<AuthInitializer user={user} />

			{/* Contenedor principal de cliente con navegación y estilos */}
			<DashboardShell user={user}>{children}</DashboardShell>
		</div>
	);
}
