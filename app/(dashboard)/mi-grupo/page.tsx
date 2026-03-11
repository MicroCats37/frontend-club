"use client";

import {
	Heart,
	MoreHorizontal,
	Search,
	ShieldCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { type MiGrupoItem, useGetMiGrupo } from "@/hooks/auth/useGetMiGrupo";
import {
	useBajaFamiliar,
	useDeleteContacto,
} from "@/hooks/auth/useGrupoActions";
import { AddContactoModal } from "./_components/AddContactoModal";
import { UpgradeFamiliarModal } from "./_components/UpgradeFamiliarModal";

const GrupoMemberCard = ({
	member,
	onUpgrade,
}: {
	member: MiGrupoItem;
	onUpgrade: (member: MiGrupoItem) => void;
}) => {
	const isTitular = member.tipo === "TITULAR";
	const isFamiliar = member.tipo === "FAMILIAR";
	const _isContacto = member.tipo === "CONTACTO";
	const hasPrivileges = member.tiene_privilegios;

	const { mutate: deleteContacto } = useDeleteContacto();
	const { mutate: bajaFamiliar } = useBajaFamiliar();

	return (
		<div className="bg-white rounded-2xl border border-[#E0E7E0] p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
			{isTitular && (
				<div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-tighter">
					Tú (Titular)
				</div>
			)}

			<div className="flex items-center gap-4 mb-4">
				<div
					className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm ${
						isTitular
							? "bg-primary/20 text-primary"
							: isFamiliar
								? "bg-blue-100 text-blue-600"
								: "bg-slate-100 text-slate-500"
					}`}
				>
					{member.persona.nombres[0]}
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-bold text-[#2C3A2C] truncate">
						{member.persona.nombre_completo}
					</h3>
					<div className="flex items-center gap-2">
						<p className="text-xs text-[#8BA18B]">DNI: {member.persona.dni}</p>
						<span className="text-[#E0E7E0]">•</span>
						<p className="text-xs text-[#8BA18B]">{member.persona.edad} años</p>
					</div>
				</div>

				{!isTitular && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full"
							>
								<MoreHorizontal className="h-4 w-4 text-[#8BA18B]" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem className="text-sm">
								Ver Perfil
							</DropdownMenuItem>
							{isFamiliar ? (
								<DropdownMenuItem
									className="text-sm text-destructive font-medium"
									onClick={() => {
										if (
											confirm("¿Estás seguro de dar de baja a este familiar?")
										) {
											bajaFamiliar(member.persona.id);
										}
									}}
								>
									Solicitar Baja
								</DropdownMenuItem>
							) : (
								<>
									<DropdownMenuItem
										className="text-sm font-semibold text-primary"
										onClick={() => onUpgrade(member)}
									>
										Ascender a Familiar
									</DropdownMenuItem>
									<DropdownMenuItem
										className="text-sm text-destructive"
										onClick={() => {
											if (confirm("¿Estás seguro de eliminar este contacto?")) {
												deleteContacto(member.persona.id);
											}
										}}
									>
										Eliminar Contacto
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<div className="flex flex-wrap gap-2 mt-auto">
				{isFamiliar && member.vinculo && (
					<Badge
						variant="secondary"
						className="bg-blue-50 text-blue-700 border-blue-100 gap-1"
					>
						<Heart className="h-3 w-3" />
						{member.vinculo}
					</Badge>
				)}

				{member.etiqueta && (
					<Badge variant="outline" className="text-slate-500 border-slate-200">
						{member.etiqueta}
					</Badge>
				)}

				{hasPrivileges ? (
					<Badge
						variant="outline"
						className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1"
					>
						<ShieldCheck className="h-3 w-3" />
						Beneficiario
					</Badge>
				) : (
					<Badge
						variant="outline"
						className="text-slate-400 border-slate-100 border-dashed"
					>
						Invitado
					</Badge>
				)}
			</div>
		</div>
	);
};

export default function MiGrupoPage() {
	const { data: response, isLoading } = useGetMiGrupo();
	const members = response?.grupo || [];

	const [addModalOpen, setAddModalOpen] = useState(false);
	const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<MiGrupoItem | null>(
		null,
	);

	const handleOpenUpgrade = (member: MiGrupoItem) => {
		setSelectedMember(member);
		setUpgradeModalOpen(true);
	};

	return (
		<div className="space-y-8 pb-10">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-black text-[#2C3A2C] tracking-tight">
						Mi Grupo Familiar
					</h1>
					<p className="text-[#8BA18B]">
						Personas que pueden acompañarte y sus beneficios de acceso.
					</p>
				</div>

				<div className="flex gap-3">
					<Button
						variant="outline"
						className="rounded-xl border-[#E0E7E0] text-[#4A5D4A] font-bold"
					>
						<Search className="h-4 w-4 mr-2" />
						BUSCAR
					</Button>
					<Button
						className="bg-[#2C3A2C] text-white rounded-xl font-bold shadow-lg shadow-[#2C3A2C]/10 transition-all hover:scale-[1.02]"
						onClick={() => setAddModalOpen(true)}
					>
						<UserPlus className="h-4 w-4 mr-2" />
						AGREGAR CONTACTO
					</Button>
				</div>
			</div>

			{/* Banner de Cupos */}
			<div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 flex items-center justify-between relative overflow-hidden group">
				<div className="absolute top-0 right-0 opacity-10 transform translate-x-10 translate-y--5 group-hover:scale-110 transition-transform">
					<Users className="h-40 w-40" />
				</div>
				<div className="relative z-10">
					<div className="flex items-center gap-2 mb-1">
						<ShieldCheck className="h-5 w-5 text-secondary" />
						<span className="text-sm font-bold uppercase tracking-widest text-secondary/90">
							Beneficios Activos
						</span>
					</div>
					<h2 className="text-4xl font-black">
						{response?.cupos_disponibles ?? 0}
					</h2>
					<p className="text-primary-foreground/80 font-medium">
						Cupos de invitados gratuitos este mes
					</p>
				</div>
				<div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 hidden sm:block">
					<p className="text-xs font-bold uppercase text-white/90 mb-1">
						Tu Categoría
					</p>
					<p className="font-black text-secondary">INGENIERO HABILITADO</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{isLoading
					? Array(3)
							.fill(0)
							.map((_, i) => (
								<Skeleton key={i} className="h-44 w-full rounded-2xl" />
							))
					: members.map((member) => (
							<GrupoMemberCard
								key={member.persona.id}
								member={member}
								onUpgrade={handleOpenUpgrade}
							/>
						))}
			</div>

			<AddContactoModal open={addModalOpen} onOpenChange={setAddModalOpen} />

			{selectedMember && (
				<UpgradeFamiliarModal
					open={upgradeModalOpen}
					onOpenChange={setUpgradeModalOpen}
					contactoId={selectedMember.persona.id}
					contactoNombre={selectedMember.persona.nombre_completo}
				/>
			)}
		</div>
	);
}
