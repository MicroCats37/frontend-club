"use client";

import {
	LayoutDashboard,
	LogIn,
	LogOut,
	TreeDeciduous,
	UserPlus,
	KeyRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

/**
 * Landing Page Principal - CE CIP Lima
 * Rediseñada para una mejor UX y visualización condicional de sesión.
 */
export default function Home() {
	const { isAuthenticated, user, logout } = useAuthStore();
	const [mounted, setMounted] = useState(false);

	// Evitar errores de hidratación con persistencia
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="min-h-screen bg-[#F8FAF8]" />;
	}

	const portalHref =
		user?.user_type === "ADMIN" || user?.user_type === "PORTERO"
			? "/admin"
			: "/inicio";

	return (
		<div className="min-h-screen bg-[#F8FAF8] flex flex-col selection:bg-primary/20">
			{/* Navigation Header */}
			<header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b border-[#E0E7E0]/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
				<div className="flex items-center gap-3 group cursor-pointer">
					<div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
						<TreeDeciduous className="h-6 w-6 text-primary" />
					</div>
					<span className="text-xl font-black text-[#2C3A2C] tracking-tight">
						CE CIP <span className="text-primary">LIMA</span>
					</span>
				</div>

				<nav className="flex items-center gap-3">
					{!isAuthenticated ? (
						<>
							<Link href="/login">
								<Button
									variant="ghost"
									className="text-[#4A5D4A] hover:text-primary hover:bg-primary/5 font-bold rounded-xl hidden sm:flex px-6 h-11"
								>
									Iniciar Sesión
								</Button>
							</Link>
							<Link href="/registro">
								<Button className="bg-[#2C3A2C] hover:bg-primary text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-[#2C3A2C]/10 transition-all hover:scale-[1.02] active:scale-95">
									Activar Cuenta
								</Button>
							</Link>
						</>
					) : (
						<div className="flex items-center gap-4">
							<span className="text-sm font-bold text-[#4A5D4A] hidden md:block">
								Hola,{" "}
								<span className="text-[#2C3A2C]">
									{user?.nombres?.split(" ")[0]}
								</span>
							</span>
							<Link href={portalHref}>
								<Button className="bg-primary hover:bg-primary/90 text-white font-extrabold rounded-xl px-6 h-11 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
									<LayoutDashboard className="h-4 w-4" />
									MI PORTAL
								</Button>
							</Link>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => logout()}
								title="Cerrar sesión"
								className="rounded-xl text-[#8BA18B] hover:text-destructive hover:bg-destructive/5"
							>
								<LogOut className="h-5 w-5" />
							</Button>
						</div>
					)}
				</nav>
			</header>

			{/* Hero Section */}
			<main className="flex-1 overflow-hidden">
				<div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24 flex flex-col items-center">
					{/* Background Decoration */}
					<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10" />

					<div className={cn(
						"space-y-6 text-center max-w-4xl transition-all duration-1000",
						mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
					)}>
						<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E0E7E0] shadow-sm rounded-full">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
							</span>
							<span className="text-[10px] font-black tracking-[0.2em] text-[#8BA18B] uppercase">
								Portal Sede Campestre Chosica
							</span>
						</div>

						<h1 className="text-5xl lg:text-8xl font-black text-[#2C3A2C] leading-[0.9] tracking-tighter">
							Tu oasis de paz <br />
							<span className="text-primary italic font-serif">
								a un solo clic.
							</span>
						</h1>

						<p className="text-lg lg:text-xl text-[#4A5D4A] max-w-2xl mx-auto leading-relaxed font-medium opacity-80">
							Bienvenido a la nueva experiencia digital del CE CIP Lima.
							Gestiona tus visitas, bungalows y servicios con la agilidad que
							mereces como colegiado.
						</p>
					</div>

					{/* CTA Grid */}
					<div className={cn(
						"mt-12 w-full max-w-2xl transition-all duration-1000 delay-300",
						mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
					)}>
						{!isAuthenticated ? (
							<div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Link href="/login" className="w-full">
										<Button
											size="lg"
											className="w-full h-20 text-xl font-black bg-[#2C3A2C] hover:bg-primary text-white shadow-2xl shadow-[#2C3A2C]/20 rounded-3xl group transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 px-8"
										>
											<LogIn className="h-8 w-8 group-hover:translate-x-1 transition-transform" />
											ENTRAR AL PORTAL
										</Button>
									</Link>
									<Link href="/registro" className="w-full">
										<Button
											size="lg"
											variant="outline"
											className="w-full h-20 text-xl font-black border-2 border-[#E0E7E0] text-[#2C3A2C] bg-white hover:bg-[#F4F7F4] hover:border-primary/30 rounded-3xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 px-8"
										>
											<UserPlus className="h-8 w-8" />
											ACTIVAR CUENTA
										</Button>
									</Link>
								</div>
								
								<div className="flex justify-center">
									<Link href="/recuperar">
										<Button
											variant="ghost"
											className="h-14 px-8 rounded-2xl text-[#8BA18B] hover:text-primary hover:bg-primary/5 font-bold transition-all flex items-center gap-3 border border-transparent hover:border-primary/20"
										>
											<KeyRound className="h-5 w-5" />
											OLVIDÉ MI CONTRASEÑA
										</Button>
									</Link>
								</div>
							</div>
						) : (
							<div className="flex justify-center">
								<Link href={portalHref} className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-80 h-20 text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 rounded-[2rem] group transition-all hover:scale-[1.05] active:scale-95 flex flex-col items-center justify-center leading-none"
									>
										<div className="flex items-center gap-3 mb-1">
											<LayoutDashboard className="h-6 w-6 group-hover:rotate-6 transition-transform" />
											<span>IR A MI PORTAL</span>
										</div>
										<span className="text-[10px] font-bold opacity-70 tracking-widest uppercase">
											Hola, {user?.nombres?.split(" ")[0]}
										</span>
									</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Benefits Grid */}
					<div className={cn(
						"mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full transition-all duration-1000 delay-500",
						mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
					)}>
						{[
							{
								icon: TreeDeciduous,
								title: "Entorno Natural",
								desc: "Amplias áreas verdes y clima perfecto todo el año.",
							},
							{
								icon: ShieldCheck,
								title: "Control de Acceso",
								desc: "Validación biométrica e identidad integrada por CIP.",
							},
							{
								icon: LayoutDashboard,
								title: "Gestión Online",
								desc: "Reservas de bungalows y pases en segundos.",
							},
						].map((benefit, _i) => (
							<div
								key={benefit.title}
								className="group p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#E0E7E0]/40 hover:border-primary/20 hover:bg-white transition-all hover:shadow-xl hover:shadow-primary/5 text-center sm:text-left"
							>
								<div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 font-bold">
									<benefit.icon className="h-6 w-6" />
								</div>
								<h3 className="text-lg font-black text-[#2C3A2C] mb-2">
									{benefit.title}
								</h3>
								<p className="text-sm text-[#4A5D4A] leading-relaxed font-medium opacity-70">
									{benefit.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="py-12 border-t border-[#E0E7E0]/50 bg-white px-6">
				<div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex items-center gap-2 grayscale brightness-50 opacity-50">
						<TreeDeciduous className="h-5 w-5" />
						<span className="text-sm font-black tracking-tighter uppercase">
							CE CIP LIMA
						</span>
					</div>
					<p className="text-xs font-bold text-[#8BA18B] text-center">
						© {new Date().getFullYear()} Centro de Esparcimiento - CIP Lima.
						Desarrollado para el bienestar de nuestros colegiados.
					</p>
					<div className="flex gap-4 text-xs font-bold text-primary italic border-b border-primary/20">
						Sede Campestre Chosica
					</div>
				</div>
			</footer>
		</div>
	);
}

// Icono faltante en importación original pero usado en el loop
function ShieldCheck({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
			<path d="m9 12 2 2 4-4" />
		</svg>
	);
}
