"use client";

import { Trees } from "lucide-react";

interface AuthShellProps {
	children: React.ReactNode;
	title: string;
	description?: string;
}

/**
 * Shell para las páginas de autenticación (Login, Registro, etc.)
 * Proporciona el fondo degradado y el contenedor centrado.
 */
export function AuthShell({ children, title, description }: AuthShellProps) {
	return (
		<div className="min-h-screen bg-[#FDFEFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Elementos decorativos de fondo (Sutiles círculos verdes) */}
			<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
			<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

			<div className="w-full max-w-[400px] z-10">
				{/* Branding */}
				<div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
					<div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white border border-[#E0E7E0] shadow-sm mb-4">
						<Trees className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-[#2C3A2C] tracking-tight">
						{title}
					</h1>
					{description && (
						<p className="text-[#8BA18B] mt-2 font-medium">{description}</p>
					)}
				</div>

				{/* Form Container */}
				<div className="animate-in fade-in zoom-in-95 duration-500 delay-150">
					{children}
				</div>

				{/* Footer */}
				<p className="mt-8 text-center text-sm text-[#8BA18B]">
					© {new Date().getFullYear()} Centro de Esparcimiento CIP.
					<br />
					<span className="font-semibold text-primary/60">Sede Campestre</span>
				</p>
			</div>
		</div>
	);
}
