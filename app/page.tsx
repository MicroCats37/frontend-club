"use client";

import { ArrowRight, LogIn, TreeDeciduous, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="min-h-screen bg-[#F8FAF8] flex flex-col">
			{/* Header / Navbar simple */}
			<header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b border-[#E0E7E0] bg-white">
				<div className="flex items-center gap-2">
					<TreeDeciduous className="h-8 w-8 text-[#2C3A2C]" />
					<span className="text-xl font-bold text-[#2C3A2C] tracking-tight">
						CE CIP Lima
					</span>
				</div>
				<div className="flex items-center gap-4">
					<Link href="/login">
						<Button
							variant="ghost"
							className="text-[#4A5D4A] hover:text-[#2C3A2C] hover:bg-primary/10 rounded-xl"
						>
							Iniciar Sesión
						</Button>
					</Link>
					<Link href="/registro">
						<Button className="bg-[#2C3A2C] hover:bg-[#1a2b1a] rounded-xl px-6">
							Registrarse
						</Button>
					</Link>
				</div>
			</header>

			{/* Hero Section Beta */}
			<main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
				<div className="space-y-4">
					<div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
						Versión Beta
					</div>
					<h1 className="text-5xl lg:text-7xl font-black text-[#2C3A2C] leading-tight">
						Tu espacio de descanso <br />
						<span className="text-primary italic">a un clic de distancia.</span>
					</h1>
					<p className="text-lg text-[#4A5D4A] max-w-2xl mx-auto leading-relaxed">
						Bienvenido al nuevo sistema de visitas del Centro de Esparcimiento.
						Gestiona tus Full Days, Bungalows y servicios adicionales de forma
						rápida y segura.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
					<Link href="/login" className="flex-1">
						<Button
							size="lg"
							className="w-full sm:w-64 h-16 text-lg font-bold bg-[#2C3A2C] hover:bg-[#1a2b1a] shadow-xl rounded-2xl group transition-all"
						>
							<LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
							INGRESAR AL PORTAL
						</Button>
					</Link>
					<Link href="/registro" className="flex-1">
						<Button
							size="lg"
							variant="outline"
							className="w-full sm:w-64 h-16 text-lg font-bold border-2 border-[#2C3A2C] text-[#2C3A2C] hover:bg-[#2C3A2C] hover:text-white shadow-lg rounded-2xl group transition-all"
						>
							<UserPlus className="mr-2 h-5 w-5" />
							CREAR CUENTA
						</Button>
					</Link>
				</div>

				<div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
					<div className="p-6 bg-white rounded-2xl border border-[#E0E7E0] shadow-sm">
						<div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
							<TreeDeciduous className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-[#2C3A2C] mb-1">Entorno Natural</h3>
						<p className="text-xs text-[#8BA18B]">
							Disfruta de nuestras amplias zonas verdes.
						</p>
					</div>
					<div className="p-6 bg-white rounded-2xl border border-[#E0E7E0] shadow-sm">
						<div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
							<ArrowRight className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-[#2C3A2C] mb-1">Visita Ágil</h3>
						<p className="text-xs text-[#8BA18B]">
							Proceso optimizado en menos de 2 minutos.
						</p>
					</div>
					<div className="p-6 bg-white rounded-2xl border border-[#E0E7E0] shadow-sm">
						<div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
							<LogIn className="h-6 w-6" />
						</div>
						<h3 className="font-bold text-[#2C3A2C] mb-1">Acceso Seguro</h3>
						<p className="text-xs text-[#8BA18B]">
							Tus datos protegidos con los mejores estándares.
						</p>
					</div>
				</div>
			</main>

			{/* Footer Beta */}
			<footer className="py-8 border-t border-[#E0E7E0] text-center text-[#8BA18B] bg-white">
				<p className="text-sm">
					© {new Date().getFullYear()} Centro de Esparcimiento - CIP Junín.
					Todos los derechos reservados.
				</p>
			</footer>
		</div>
	);
}
