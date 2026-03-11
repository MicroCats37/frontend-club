"use client";

import {
	Calendar,
	Home,
	LogOut,
	Menu,
	Settings,
	Shield,
	Ticket,
	TreeDeciduous,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAuthCookies } from "@/lib/auth/actions";
import type { LoggedUser } from "@/schemas/auth";
import { useAuthStore } from "@/store/useAuthStore";

interface DashboardShellProps {
	user: LoggedUser;
	children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const logoutStore = useAuthStore((state) => state.logout);
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = async () => {
		await deleteAuthCookies(); // Borrar Cookies (Server)
		logoutStore(); // Limpiar Store (Client)
		router.push("/login");
	};

	const menuItems = (() => {
		const common = [{ icon: Home, label: "Inicio", href: "/inicio" }];

		switch (user.user_type) {
			case "ADMIN":
				return [
					...common,
					{ icon: Shield, label: "Panel General", href: "/admin" },
					{ icon: Calendar, label: "Gestión Visitas", href: "/admin/visitas" },
					{ icon: Home, label: "Bungalows", href: "/admin/bungalows" },
					{ icon: Ticket, label: "Tarifas / Pases", href: "/admin/entradas" },
					{ icon: Users, label: "Control Acceso", href: "/admin/acceso" },
					{ icon: Calendar, label: "Mis Visitas", href: "/visitas" },
					{ icon: Users, label: "Mi Grupo", href: "/mi-grupo" },
				];
			case "PORTERO":
				return [
					...common,
					{ icon: Users, label: "Control Acceso", href: "/admin/acceso" },
					{ icon: Calendar, label: "Visitas Hoy", href: "/admin/visitas" },
				];
			case "INGENIERO":
				return [
					...common,
					{ icon: Calendar, label: "Mis Visitas", href: "/visitas" },
					{ icon: Users, label: "Mi Grupo", href: "/mi-grupo" },
				];
			default:
				return [
					...common,
					{ icon: Calendar, label: "Mis Visitas", href: "/visitas" },
				];
		}
	})();

	const userTypeLabel =
		{
			ADMIN: "Administrador",
			PORTERO: "Personal de Puerta",
			INGENIERO: "Portal del Colegiado",
			CLIENTE: "Portal del Cliente",
		}[user.user_type] || "Portal";

	return (
		<div className="flex h-screen bg-[#F8FAF8]">
			{" "}
			{/* Blanco verdoso suave */}
			{/* SIDEBAR - MOBILE OVERLAY */}
			{isSidebarOpen && (
				<button
					type="button"
					aria-label="Cerrar menú"
					className="fixed inset-0 z-40 bg-black/50 lg:hidden w-full h-full border-none cursor-default"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
			{/* SIDEBAR */}
			<aside
				className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E0E7E0] transform transition-transform duration-200 ease-in-out
                lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
			>
				<div className="flex flex-col h-full">
					{/* LOGO AREA */}
					<div className="flex items-center h-20 px-6 border-b border-[#E0E7E0] bg-primary/5">
						<TreeDeciduous className="h-8 w-8 text-primary mr-3" />
						<span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
							CE CIP Lima
						</span>
					</div>

					{/* NAV LINKS */}
					<nav className="flex-1 px-4 py-6 space-y-1">
						{menuItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.label}
									href={item.href}
									className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
										isActive
											? "bg-primary/20 text-primary border-r-4 border-primary"
											: "text-[#4A5D4A] hover:bg-primary/10 hover:text-primary"
									}`}
								>
									<item.icon
										className={`mr-3 h-5 w-5 transition-colors ${
											isActive
												? "text-primary"
												: "text-[#8BA18B] group-hover:text-primary"
										}`}
									/>
									{item.label}
								</Link>
							);
						})}
					</nav>

					{/* USER PROFILE INFO */}
					<div className="p-4 border-t border-[#E0E7E0] bg-[#FBFCFB]">
						<div className="flex items-center mb-4 px-2">
							<div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
								{user.nombres[0]}
							</div>
							<div className="ml-3 overflow-hidden">
								<p className="text-sm font-semibold text-[#2C3A2C] truncate">
									{user.nombres} {user.apellidos}
								</p>
								<p className="text-xs text-[#8BA18B] truncate">
									{user.cip ? `CIP: ${user.cip}` : "Personal Staff"}
								</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							type="button"
							className="flex items-center w-full px-4 py-2 text-sm font-medium text-destructive bg-destructive/5 rounded-lg hover:bg-destructive hover:text-white transition-all group"
						>
							<LogOut className="mr-3 h-4 w-4" />
							Cerrar Sesión
						</button>
					</div>
				</div>
			</aside>
			{/* MAIN CONTENT AREA */}
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* TOP NAVBAR (MOBILE ONLY) */}
				<header className="flex items-center justify-between h-16 px-6 bg-white border-b border-[#E0E7E0] lg:hidden">
					<TreeDeciduous className="h-8 w-8 text-primary" />
					<button
						onClick={() => setIsSidebarOpen(true)}
						type="button"
						className="p-2 text-[#4A5D4A] hover:bg-gray-100 rounded-lg"
					>
						<Menu className="h-6 w-6" />
					</button>
				</header>

				{/* PAGE CONTENT */}
				<main className="flex-1 overflow-y-auto p-6 lg:p-8">
					<div className="max-w-7xl mx-auto uppercase tracking-wider text-[10px] font-bold text-primary/50 mb-2">
						{userTypeLabel}
					</div>
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
}
