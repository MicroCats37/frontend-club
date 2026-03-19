"use client";

import { Heart, ShieldCheck, Trees, Waves, Wind } from "lucide-react";

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
		<div className="h-screen w-full flex bg-white overflow-hidden">
			{/* Lado Visual (Branding/Brillo) - Solo visible en tablets/desktop */}
			<div className="hidden lg:flex flex-1 bg-[#2C3A2C] relative overflow-hidden items-center justify-center p-12">
				{/* Efectos de fondo premium */}
				<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full -mr-96 -mt-96 blur-[120px] animate-pulse duration-[10s]" />
				<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full -ml-48 -mb-48 blur-[100px] animate-pulse duration-[8s]" />

				{/* Composición de Iconos / Pattern */}
				<div className="relative z-10 grid grid-cols-2 gap-12 opacity-10">
					<Trees className="w-24 h-24 text-white stroke-[1] -rotate-12" />
					<div className="w-24 h-24 border-2 border-white/20 rounded-[2rem] flex items-center justify-center rotate-12">
						<ShieldCheck className="w-12 h-12 text-white" />
					</div>
					<div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center -rotate-6">
						<Waves className="w-12 h-12 text-white" />
					</div>
					<Heart className="w-24 h-24 text-white fill-current rotate-6" />
					<div className="w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full flex items-center justify-center">
						<Wind className="w-10 h-10 text-white" />
					</div>
				</div>

				<div className="absolute bottom-20 left-20 right-20 z-20">
					<div className="h-[1px] w-12 bg-emerald-400 mb-6" />
					<h2 className="text-5xl font-black text-white tracking-tighter leading-tight mb-4">
						Naturaleza, <br />
						Deporte y <br />
						<span className="text-emerald-400">Comunidad.</span>
					</h2>
					<p className="text-emerald-100/60 font-medium text-lg max-w-md">
						Un espacio diseñado para el bienestar de los ingenieros y sus
						familias.
					</p>
				</div>
			</div>

			{/* Lado Funcional (Formulario) */}
			<div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#FDFEFC]">
				{/* Elemento de brillo superior */}
				<div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

				<div className="w-full max-w-[420px] z-10 space-y-12">
					{/* Branding Mobile/Compact */}
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
						<div className="inline-flex items-center justify-center h-16 w-16 rounded-[2rem] bg-white border border-[#E0E7E0] shadow-sm mb-8 transition-transform hover:rotate-12 duration-500">
							<Trees className="h-8 w-8 text-primary" />
						</div>
						<h1 className="text-5xl font-black text-[#2C3A2C] tracking-tighter leading-none mb-3">
							{title}
						</h1>
						{description && (
							<p className="text-[#8BA18B] font-medium text-base leading-relaxed max-w-[320px]">
								{description}
							</p>
						)}
					</div>

					{/* Form Container (Flat, without card) */}
					<div className="animate-in fade-in zoom-in-95 duration-500 delay-150">
						{children}
					</div>

					{/* Footer (More subtle) */}
					<div className="flex items-center gap-4 pt-4 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
						<div className="h-px flex-1 bg-[#2C3A2C]" />
						<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2C3A2C]">
							CIP Sede Campestre
						</p>
						<div className="h-px flex-1 bg-[#2C3A2C]" />
					</div>
				</div>
			</div>
		</div>
	);
}
