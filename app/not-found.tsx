"use client";

import { Ghost, Home, MoveLeft, Trees } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-[#FDFEFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Elementos decorativos de fondo (Sutiles círculos verdes) */}
			<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
			<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50" />

			<div className="w-full max-w-[500px] z-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
				{/* Logo / Icon */}
				<div className="relative inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-white border border-[#E0E7E0] shadow-xl group transition-transform hover:scale-105">
					<Trees className="h-12 w-12 text-primary" />
					<div className="absolute -top-2 -right-2 bg-destructive text-white p-1.5 rounded-full animate-bounce">
						<Ghost className="h-5 w-5" />
					</div>
				</div>

				{/* Mensaje de Error */}
				<div className="space-y-4">
					<h1 className="text-8xl font-black text-[#2C3A2C] tracking-tighter opacity-10">
						404
					</h1>
					<h2 className="text-3xl font-bold text-[#2C3A2C] mt-[-3rem]">
						Página no encontrada
					</h2>
					<p className="text-[#8BA18B] max-w-[320px] mx-auto font-medium leading-relaxed">
						Parece que te has adentrado demasiado en el bosque. El camino que
						buscas no existe o ha sido movido.
					</p>
				</div>

				{/* Acciones */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
					<Button
						asChild
						variant="ghost"
						className="rounded-2xl h-14 px-8 text-[#4A5D4A] hover:bg-primary/10 hover:text-primary transition-all font-bold group"
					>
						<Link href="javascript:history.back()">
							<MoveLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
							Regresar
						</Link>
					</Button>

					<Button
						asChild
						className="rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
					>
						<Link href="/inicio">
							<Home className="mr-2 h-5 w-5" />
							Ir al Inicio
						</Link>
					</Button>
				</div>

				{/* Footer */}
				<p className="pt-8 text-sm text-[#8BA18B]">
					© {new Date().getFullYear()} Centro de Esparcimiento CIP.
					<br />
					<span className="font-semibold text-primary/60">Sede Campestre</span>
				</p>
			</div>
		</div>
	);
}
