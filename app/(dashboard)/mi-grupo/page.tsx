"use client";

import {
	AlertCircle,
	ArrowUpCircle,
	Clock,
	Heart,
	ShieldCheck,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type MiGrupoItem, useGetMiGrupo } from "@/hooks/auth/useGetMiGrupo";
import {
	useBajaFamiliar,
	useDeleteContacto,
} from "@/hooks/auth/useGrupoActions";
import { useAuthStore } from "@/store/useAuthStore";
import { AddFamiliarModal } from "./_components/AddFamiliarModal";
import { AddInvitadoModal } from "./_components/AddInvitadoModal";
import { UpgradeFamiliarModal } from "./_components/UpgradeFamiliarModal";

const GrupoMemberCard = ({
	member,
	onUpgrade,
	canManage,
	isAfiliado,
}: {
	member: MiGrupoItem;
	onUpgrade: (member: MiGrupoItem) => void;
	canManage: boolean;
	isAfiliado: boolean;
}) => {
	const isTitular = member.tipo === "TITULAR";
	const isFamiliar = member.tipo === "FAMILIAR";
	const isContacto = member.tipo === "CONTACTO";
	const hasPrivileges = member.tiene_privilegios;

	const { mutate: deleteContacto } = useDeleteContacto();
	const { mutate: bajaFamiliar } = useBajaFamiliar();

	return (
		<div className="bg-white rounded-[28px] border border-[#E0E7E0] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 sm:gap-6 relative group">
			<div
				className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center text-xl font-black border-2 border-white shadow-sm shrink-0 transition-transform group-hover:scale-105 duration-500 ${isTitular
					? "bg-[#2C3A2C] text-white"
					: isFamiliar
						? "bg-blue-500 text-white"
						: "bg-slate-100 text-slate-400"
					}`}
			>
				{member.persona.nombres[0]}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex flex-wrap items-center gap-2 mb-1">
					<h3 className="font-black text-[#2C3A2C] truncate text-base sm:text-lg">
						{member.persona.nombre_completo}
					</h3>
					{isTitular && (
						<Badge className="bg-[#2C3A2C] text-white border-none py-0.5 px-2 text-[9px] uppercase tracking-widest leading-none">
							Tú (Titular)
						</Badge>
					)}
					{isFamiliar && (
						<Badge className="bg-blue-50 text-blue-600 border-none py-0.5 px-2 text-[9px] uppercase tracking-widest leading-none">
							Familiar
						</Badge>
					)}
					{isContacto && (
						<Badge className="bg-slate-100 text-slate-500 border-none py-0.5 px-2 text-[9px] uppercase tracking-widest leading-none">
							Contacto
						</Badge>
					)}
					{hasPrivileges && !isTitular && (
						<Badge className="bg-emerald-500 text-white border-none py-0.5 px-2 text-[9px] uppercase tracking-widest leading-none">
							Beneficiario
						</Badge>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8BA18B] font-medium">
					<p>
						DNI: <span className="text-[#2C3A2C]">{member.persona.dni}</span>
					</p>
					<span className="text-[#E0E7E0] hidden sm:inline">•</span>
					<p>{member.persona.edad} años</p>
					{isFamiliar && member.vinculo && (
						<>
							<span className="text-[#E0E7E0] hidden sm:inline">•</span>
							<p className="flex items-center gap-1 text-blue-600">
								<Heart className="h-3 w-3" />
								{member.vinculo}
							</p>
						</>
					)}
				</div>
			</div>

			<div className="flex flex-col items-end gap-2">
				<Badge
					variant="outline"
					className={`${member.persona.estado_validacion === "RECHAZADA"
						? "bg-red-50 text-red-700 border-red-200"
						: member.persona.estado_validacion === "PENDIENTE"
							? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
							: member.persona.estado_validacion === "APROBADA"
								? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
								: "bg-slate-50 text-slate-500 border-slate-200"
						} gap-1.5 py-1 px-3 rounded-xl`}
				>
					{member.persona.estado_validacion === "APROBADA" ? (
						<ShieldCheck className="h-3 w-3" />
					) : member.persona.estado_validacion === "PENDIENTE" ? (
						<Clock className="h-3 w-3" />
					) : member.persona.estado_validacion === "RECHAZADA" ? (
						<XCircle className="h-3 w-3" />
					) : (
						<AlertCircle className="h-3 w-3" />
					)}
					<span className="text-[10px] font-black uppercase tracking-tight">
						{member.persona.nombre_estado_validacion}
					</span>
				</Badge>

				{/* Botón de Acción (Ascenso) */}
				{!hasPrivileges && isAfiliado && isFamiliar && (
					<Button
						variant="ghost"
						size="sm"
						className={`h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-tighter border border-transparent transition-all ${member.estado_vinculo === "RECHAZADO"
							? "text-red-600 hover:bg-red-50 hover:border-red-100"
							: member.estado_vinculo === "PENDIENTE"
								? "text-amber-600 hover:bg-amber-50 hover:border-amber-100"
								: "text-blue-600 hover:bg-blue-50 hover:border-blue-100"
							}`}
						onClick={() => onUpgrade(member)}
					>
						<ArrowUpCircle className="h-3 w-3 mr-1" />
						{member.persona.estado_validacion === "RECHAZADO"
							? "Reintentar Ascenso"
							: "Ascender a Beneficiario"}
					</Button>
				)}
			</div>
		</div>
	);
};

export default function MiGrupoPage() {
	const { data: response, isLoading } = useGetMiGrupo();
	const user = useAuthStore((state) => state.user);
	const _isAdmin = user?.user_type === "ADMIN";
	const isAfiliado = user?.categoria === "AFILIADO";
	const members = response?.grupo || [];

	const familia = members.filter(
		(m) => m.tipo === "TITULAR" || m.tipo === "FAMILIAR",
	);
	const contactos = members.filter((m) => m.tipo === "CONTACTO");

	const [familiarModalOpen, setFamiliarModalOpen] = useState(false);
	const [invitadoModalOpen, setInvitadoModalOpen] = useState(false);
	const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<MiGrupoItem | null>(
		null,
	);

	const handleOpenUpgrade = (member: MiGrupoItem) => {
		setSelectedMember(member);
		setUpgradeModalOpen(true);
	};

	return (
		<div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E0E7E0] pb-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-black text-[#2C3A2C] tracking-tighter">
						Mi Grupo Familiar
					</h1>
					<p className="text-[#8BA18B] font-medium text-sm">
						Gestiona a tus seres queridos y su acceso preferencial al club.
					</p>
				</div>
			</div>

			{/* Info Section: Beneficiarios & Stats */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
				<div className="lg:col-span-6 bg-white rounded-[32px] p-8 border border-[#E0E7E0] shadow-sm relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
					<div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
					<div className="relative z-10 flex items-start gap-6">
						<div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
							<ShieldCheck className="h-7 w-7" />
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-black text-[#2C3A2C] mb-1 tracking-tight">
								Gestión de Beneficiarios
							</h3>
							{isAfiliado && (
								<p className="text-[#8BA18B] text-xs font-medium leading-relaxed max-w-sm">
									Tus familiares nucleares disfrutan de{" "}
									<span className="text-emerald-600 font-bold uppercase tracking-tighter text-[10px]">
										ingreso libre (S/ 0.00)
									</span>{" "}
									en todas nuestras sedes.
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Stat Card 1: Beneficiarios */}
				<div className="lg:col-span-3 bg-blue-600 rounded-[32px] p-7 text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
					<div className="absolute -bottom-6 -right-6 opacity-10 transition-transform group-hover:scale-110 duration-700">
						<Users className="h-24 w-24" />
					</div>
					<div className="relative z-10">
						<div className="flex items-center gap-2 mb-2">
							<div className="h-1 w-4 bg-white/30 rounded-full" />
							<span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-100">
								Beneficiarios
							</span>
						</div>
						<h2 className="text-4xl font-black mb-0.5 tracking-tighter">
							{response?.beneficiarios_usados ?? 0} de{" "}
							{response?.beneficiarios_limite ?? 0}
						</h2>
						<p className="text-blue-100/60 font-medium text-[10px] uppercase tracking-wider">
							Cupos Totales
						</p>
					</div>
				</div>

				{/* Stat Card 2: Pases */}
				<div className="lg:col-span-3 bg-[#2C3A2C] rounded-[32px] p-7 text-white shadow-xl flex flex-col justify-center relative overflow-hidden group">
					<div className="absolute -bottom-6 -right-6 opacity-10 transition-transform group-hover:scale-110 duration-700">
						<ShieldCheck className="h-24 w-24" />
					</div>
					<div className="relative z-10">
						<div className="flex items-center gap-2 mb-2">
							<div className="h-1 w-4 bg-emerald-400 rounded-full animate-pulse" />
							<span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400">
								Pases Libres
							</span>
						</div>
						<h2 className="text-4xl font-black mb-0.5 tracking-tighter">
							{response?.cupos_disponibles ?? 0}
						</h2>
						<p className="text-emerald-100/60 font-medium text-[10px] uppercase tracking-wider">
							Disponibles este mes
						</p>
					</div>
				</div>
			</div>

			{/* Sección Mi Familia */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
							<Heart className="h-5 w-5 fill-current" />
						</div>
						<h2 className="text-xl font-black text-[#2C3A2C] uppercase tracking-tighter">
							Mi Familia
						</h2>
						<Badge className="bg-blue-50 text-blue-600 border-none font-black text-xs px-3">
							{familia.length}
						</Badge>
					</div>

					<Button
						size="sm"
						variant="outline"
						className="rounded-xl border-dashed border-2 hover:bg-blue-50 hover:border-blue-200 text-blue-600 font-black gap-2 h-10 px-5"
						onClick={() => setFamiliarModalOpen(true)}
					>
						<UserPlus className="h-4 w-4" />
						AGREGAR FAMILIAR
					</Button>
				</div>

				<div className="flex flex-col gap-4">
					{isLoading
						? Array(2)
							.fill(0)
							.map((_, i) => (
								<Skeleton key={i} className="h-24 w-full rounded-[28px]" />
							))
						: familia.map((member) => (
							<GrupoMemberCard
								key={member.persona.id}
								member={member}
								onUpgrade={handleOpenUpgrade}
								canManage={true}
								isAfiliado={isAfiliado}
							/>
						))}
				</div>
			</div>

			{/* Sección Mis Contactos */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
							<Users className="h-5 w-5" />
						</div>
						<h2 className="text-xl font-black text-[#2C3A2C] uppercase tracking-tighter">
							Invitados Frecuentes
						</h2>
						<Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-xs px-3">
							{contactos.length}
						</Badge>
					</div>
					<Button
						size="sm"
						variant="outline"
						className="rounded-xl border-dashed border-2 hover:bg-emerald-50 hover:border-emerald-200 text-emerald-600 font-black gap-2 h-10 px-5"
						onClick={() => setInvitadoModalOpen(true)}
					>
						<UserPlus className="h-4 w-4" />
						NUEVO CONTACTO
					</Button>
				</div>

				{contactos.length === 0 && !isLoading ? (
					<div className="bg-[#F8FAF8] border-2 border-dashed border-[#E0E7E0] rounded-[40px] p-12 text-center">
						<div className="bg-white p-6 rounded-[24px] w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#E0E7E0]">
							<Users className="h-10 w-10 text-[#8BA18B]" />
						</div>
						<h3 className="text-xl font-black text-[#2C3A2C] mb-2">
							No tienes contactos frecuentes
						</h3>
						<p className="text-sm text-[#8BA18B] mb-8 font-medium max-w-xs mx-auto leading-relaxed">
							Agrega amigos o personas que sueles traer al club para agilizar su
							ingreso en próximas visitas.
						</p>
						<Button
							className="bg-[#2C3A2C] hover:bg-black text-white font-black rounded-2xl h-12 px-8 shadow-xl shadow-[#2C3A2C]/10 active:scale-95 transition-all"
							onClick={() => setInvitadoModalOpen(true)}
						>
							REGISTRAR MI PRIMER INVITADO
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{isLoading
							? Array(3)
								.fill(0)
								.map((_, i) => (
									<Skeleton key={i} className="h-24 w-full rounded-[28px]" />
								))
							: contactos.map((member) => (
								<GrupoMemberCard
									key={member.persona.id}
									member={member}
									onUpgrade={handleOpenUpgrade}
									canManage={true}
									isAfiliado={isAfiliado}
								/>
							))}
					</div>
				)}
			</div>

			<AddFamiliarModal
				open={familiarModalOpen}
				onOpenChange={setFamiliarModalOpen}
			/>

			<AddInvitadoModal
				open={invitadoModalOpen}
				onOpenChange={setInvitadoModalOpen}
			/>

			{selectedMember && (
				<UpgradeFamiliarModal
					open={upgradeModalOpen}
					onOpenChange={setUpgradeModalOpen}
					vinculoId={selectedMember.id}
					contactoDni={selectedMember.persona.dni}
					contactoNombre={selectedMember.persona.nombre_completo}
					isAlreadyFamiliar={selectedMember.tipo === "FAMILIAR"}
					isRejected={selectedMember.estado_vinculo === "RECHAZADO"}
				/>
			)}
		</div>
	);
}
