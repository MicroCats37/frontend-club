"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { 
	User, 
	IdCard, 
	Briefcase, 
	Hash, 
	Lock,
	ShieldCheck,
	Fingerprint
} from "lucide-react";
import { useState } from "react";
import { ChangePasswordModal } from "../_components/ChangePasswordModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PerfilPage() {
	const user = useAuthStore((state) => state.user);
	const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

	if (!user) return null;

	const userDetails = [
		{
			label: "Nombres",
			value: user.nombres,
			icon: User,
		},
		{
			label: "Apellidos",
			value: user.apellidos,
			icon: User,
		},
		{
			label: "DNI",
			value: user.dni,
			icon: Fingerprint,
		},
		{
			label: "Categoría",
			value: user.categoria || "N/A",
			icon: Briefcase,
		},
		{
			label: "CIP",
			value: user.cip || "N/A",
			icon: Hash,
		},
		{
			label: "Tipo de Usuario",
			value: user.user_type,
			icon: IdCard,
		},
	];

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div>
				<h1 className="text-3xl font-black text-[#2C3A2C] tracking-tight">Mi Perfil</h1>
				<p className="text-[#8BA18B]">Gestiona tu información personal y configuración de seguridad.</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Información Personal */}
				<Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
					<div className="h-1.5 w-full bg-primary/20" />
					<CardHeader className="pb-4">
						<CardTitle className="text-xl font-bold text-[#2C3A2C] flex items-center gap-2">
							<User className="h-5 w-5 text-primary" />
							Información Personal
						</CardTitle>
						<CardDescription>Datos básicos registrados en tu cuenta.</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{userDetails.map((detail) => (
								<div key={detail.label} className="flex items-start gap-4 p-4 rounded-xl bg-[#F8FAF8] border border-[#E0E7E0]/50">
									<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-[#E0E7E0] shadow-sm text-primary">
										<detail.icon className="h-5 w-5" />
									</div>
									<div>
										<p className="text-[10px] font-bold text-[#8BA18B] uppercase tracking-wider">{detail.label}</p>
										<p className="font-semibold text-[#2C3A2C]">{detail.value}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Seguridad */}
				<Card className="border-none shadow-sm bg-white overflow-hidden">
					<div className="h-1.5 w-full bg-primary" />
					<CardHeader>
						<CardTitle className="text-xl font-bold text-[#2C3A2C] flex items-center gap-2">
							<ShieldCheck className="h-5 w-5 text-primary" />
							Seguridad
						</CardTitle>
						<CardDescription>Protege tu acceso actualizando tu contraseña.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-[#4A5D4A]">
							<p>Mantener tu contraseña actualizada mejora significativamente la seguridad de tu cuenta.</p>
						</div>

						<Button 
							onClick={() => setIsChangePasswordOpen(true)}
							className="w-full h-12 font-bold shadow-md hover:shadow-lg transition-all"
						>
							<Lock className="mr-2 h-4 w-4" />
							CAMBIAR CONTRASEÑA
						</Button>
					</CardContent>
				</Card>
			</div>

			<ChangePasswordModal 
				open={isChangePasswordOpen}
				onOpenChange={setIsChangePasswordOpen}
			/>
		</div>
	);
}
