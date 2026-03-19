"use client";

import {
	Calendar,
	ChevronDown,
	ChevronRight,
	Home,
	LogOut,
	Menu,
	ShieldCheck,
	Ticket,
	TreeDeciduous,
	UserCircle,
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
		const common = [
			{ icon: Home, label: "Inicio", href: "/inicio" },
			{ icon: UserCircle, label: "Mi Perfil", href: "/perfil" },
		];

		switch (user.user_type) {
			case "ADMIN":
				return [
					...common,
					{
						icon: ShieldCheck,
						label: "Validación Identidad",
						href: "/admin/identidad/validar",
					},
					{ icon: Calendar, label: "Gestión Visitas", href: "/admin/visitas" },
					{ icon: Ticket, label: "Entradas", href: "/admin/entradas" },
					{
						icon: Home,
						label: "Bungalows",
						subItems: [
							{ label: "Administración", href: "/admin/bungalows" },
							{ label: "Precios", href: "/admin/bungalows-precios" },
							{ label: "Feriados", href: "/admin/feriados" },
						],
					},
					{
						icon: Calendar,
						label: "Calendario Estadía",
						href: "/admin/bungalows-estadia",
					},

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
					{ icon: Calendar, label: "Mis Visitas", href: "/visitas" },
					{ icon: Users, label: "Mi Grupo", href: "/mi-grupo" },
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
		<div className="flex h-screen bg-[#F8FAF8]" suppressHydrationWarning>
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
					<nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
						{menuItems.map((item) => (
							<SidebarItem key={item.label} item={item} pathname={pathname} />
						))}
					</nav>

					{/* USER PROFILE INFO */}
					<div className="p-4 border-t border-[#E0E7E0] bg-[#FBFCFB]">
						<div className="flex items-center mb-4 px-2">
							<div className="relative">
								<div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm overflow-hidden">
									{user.nombres[0]}
								</div>
								{user.privilegios && (
									<div className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
										<ShieldCheck className="h-2 w-2 text-white" />
									</div>
								)}
							</div>
							<div className="ml-3 overflow-hidden">
								<p className="text-sm font-semibold text-[#2C3A2C] truncate">
									{user.nombres} {user.apellidos}
								</p>
								<div className="flex items-center gap-1.5">
									<p className="text-[10px] font-bold text-primary uppercase tracking-tight">
										{user.categoria ||
											(user.cip ? "Colegiado" : "Personal Staff")}
									</p>
									{user.cip && (
										<span className="text-[10px] text-[#8BA18B]">
											• CIP: {user.cip}
										</span>
									)}
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<button
								onClick={handleLogout}
								type="button"
								className="flex items-center w-full px-4 py-2 text-xs font-semibold text-destructive bg-destructive/5 rounded-lg hover:bg-destructive hover:text-white transition-all group"
							>
								<LogOut className="mr-3 h-3.5 w-3.5" />
								Cerrar Sesión
							</button>
						</div>
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

function SidebarItem({ item, pathname }: { item: any; pathname: string }) {
	const [isOpen, setIsOpen] = useState(() => {
		if (item.subItems) {
			return item.subItems.some((sub: any) => pathname === sub.href);
		}
		return false;
	});

	const hasSubItems = item.subItems && item.subItems.length > 0;
	const isActive = item.href
		? pathname === item.href
		: item.subItems?.some((sub: any) => pathname === sub.href);

	if (!hasSubItems) {
		return (
			<Link
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
	}

	return (
		<div className="space-y-1">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
					isActive
						? "bg-primary/10 text-primary"
						: "text-[#4A5D4A] hover:bg-primary/10 hover:text-primary"
				}`}
			>
				<div className="flex items-center">
					<item.icon
						className={`mr-3 h-5 w-5 transition-colors ${
							isActive
								? "text-primary"
								: "text-[#8BA18B] group-hover:text-primary"
						}`}
					/>
					{item.label}
				</div>
				{isOpen ? (
					<ChevronDown className="h-4 w-4 text-[#8BA18B]" />
				) : (
					<ChevronRight className="h-4 w-4 text-[#8BA18B]" />
				)}
			</button>

			{isOpen && (
				<div className="pl-12 space-y-1 animate-in slide-in-from-top-1 duration-200">
					{item.subItems.map((sub: any) => {
						const isSubActive = pathname === sub.href;
						return (
							<Link
								key={sub.label}
								href={sub.href}
								className={`flex items-center py-2 text-sm font-medium transition-colors ${
									isSubActive
										? "text-primary font-bold"
										: "text-[#8BA18B] hover:text-primary"
								}`}
							>
								{sub.label}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
