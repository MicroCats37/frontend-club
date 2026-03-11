import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	BungalowDisponible,
	VisitanteSeleccionado,
} from "@/schemas/visita";

interface VisitaState {
	pasoActual: number;
	tipoVisita: "SOLO_PASES" | "CON_BUNGALOW" | null;
	visitantes: VisitanteSeleccionado[];
	bungalows: BungalowDisponible[];
	total: number;
	fechas: { start: Date | null; end: Date | null };
	visitaId: string | null;
	tipoPaseId: string | null;

	// Actions
	setPaso: (paso: number) => void;
	setTipoVisita: (tipo: "SOLO_PASES" | "CON_BUNGALOW" | null) => void;
	setFechas: (fechas: { start: Date | null; end: Date | null }) => void;
	setVisitaId: (id: string | null) => void;
	setTipoPaseId: (id: string | null) => void;

	addVisitante: (persona: VisitanteSeleccionado) => void;
	removeVisitante: (id: string) => void;
	togglePrivilegio: (id: string) => void;
	toggleEnBungalow: (id: string) => void;

	addBungalow: (bungalow: BungalowDisponible) => void;
	removeBungalow: (id: number) => void;

	reset: () => void;
}

export const useVisitaStore = create<VisitaState>()(
	persist(
		(set, get) => ({
			pasoActual: 1,
			tipoVisita: null,
			visitantes: [],
			bungalows: [],
			total: 0,
			fechas: { start: null, end: null },
			visitaId: null,
			tipoPaseId: null,

			setPaso: (paso) => set({ pasoActual: paso }),
			setTipoVisita: (tipo) => set({ tipoVisita: tipo }),
			setVisitaId: (id) => set({ visitaId: id }),
			setTipoPaseId: (id) => set({ tipoPaseId: id }),

			setFechas: (fechas) => {
				const { visitantes } = get();
				set({
					fechas,
					bungalows: [],
					total: calcularTotal(visitantes, []),
				});
			},

			addVisitante: (persona) => {
				const { visitantes, bungalows, tipoVisita } = get();
				// Evitar duplicados
				if (visitantes.some((v) => String(v.id) === String(persona.id))) return;

				// En CON_BUNGALOW: el total de visitantes no puede superar la capacidad
				if (tipoVisita === "CON_BUNGALOW") {
					const capacidadTotal = bungalows.reduce(
						(acc, curr) => acc + curr.capacidad,
						0,
					);
					if (capacidadTotal > 0 && visitantes.length >= capacidadTotal) {
						return; // El modal ya muestra el toast
					}
				}

				const nuevosVisitantes = [...visitantes, persona];
				set({
					visitantes: nuevosVisitantes,
					total: calcularTotal(nuevosVisitantes, bungalows),
				});
			},

			removeVisitante: (id) => {
				const { visitantes, bungalows } = get();
				const filtrados = visitantes.filter((v) => v.id !== id);
				set({
					visitantes: filtrados,
					total: calcularTotal(filtrados, bungalows),
				});
			},

			togglePrivilegio: (id) => {
				const { visitantes, bungalows } = get();
				const actualizados = visitantes.map((v) => {
					if (v.id === id) {
						const nuevoEstado = !v.usar_privilegio;
						return {
							...v,
							usar_privilegio: nuevoEstado,
							precio_final: nuevoEstado ? 0 : Number(v.precio_calculado),
						};
					}
					return v;
				});

				set({
					visitantes: actualizados,
					total: calcularTotal(actualizados, bungalows),
				});
			},

			toggleEnBungalow: (id) => {
				const { visitantes, bungalows } = get();
				const v = visitantes.find((vis) => vis.id === id);
				if (!v) return;

				// Si va a activar el check, validar capacidad
				if (!v.en_bungalow) {
					const capacidadTotal = bungalows.reduce(
						(acc, curr) => acc + curr.capacidad,
						0,
					);
					const actualesEnBungalow = visitantes.filter(
						(vis) => vis.en_bungalow,
					).length;

					if (actualesEnBungalow >= capacidadTotal) {
						const { toast } = require("sonner");
						toast.error(
							`Capacidad máxima alcanzada (${capacidadTotal} personas).`,
						);
						return;
					}
				}

				const actualizados = visitantes.map((vis) => {
					if (vis.id === id) {
						return { ...vis, en_bungalow: !vis.en_bungalow };
					}
					return vis;
				});

				set({ visitantes: actualizados });
			},

			addBungalow: (bungalow) => {
				const { visitantes, bungalows } = get();
				// Evitar duplicados
				if (bungalows.some((b) => b.id === bungalow.id)) return;

				const nuevosBungalows = [...bungalows, bungalow];
				set({
					bungalows: nuevosBungalows,
					total: calcularTotal(visitantes, nuevosBungalows),
				});
			},

			removeBungalow: (id) => {
				const { visitantes, bungalows } = get();
				const filtrados = bungalows.filter((b) => b.id !== id);
				const nuevaCapacidad = filtrados.reduce(
					(acc, curr) => acc + curr.capacidad,
					0,
				);

				// Regla: En CON_BUNGALOW, total visitantes = capacidad bungalow.
				// Si la nueva capacidad es menor, eliminar visitantes sobrantes del final.
				let nuevosVisitantes = visitantes;
				if (visitantes.length > nuevaCapacidad) {
					nuevosVisitantes = visitantes.slice(0, nuevaCapacidad);
					const eliminados = visitantes.length - nuevaCapacidad;
					const { toast: t } = require("sonner");
					t.info(
						`Capacidad reducida: se eliminaron ${eliminados} persona(s) de la lista.`,
					);
				}

				set({
					bungalows: filtrados,
					visitantes: nuevosVisitantes,
					total: calcularTotal(nuevosVisitantes, filtrados),
				});
			},

			reset: () =>
				set({
					pasoActual: 1,
					tipoVisita: null,
					visitantes: [],
					bungalows: [],
					total: 0,
					fechas: { start: null, end: null },
					visitaId: null,
					tipoPaseId: null,
				}),
		}),
		{
			name: "visita-storage",
			partialize: (state) => ({
				pasoActual: state.pasoActual,
				tipoVisita: state.tipoVisita,
				visitantes: state.visitantes,
				bungalows: state.bungalows,
				fechas: state.fechas,
				total: state.total,
				visitaId: state.visitaId,
				tipoPaseId: state.tipoPaseId,
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					if (state.fechas.start) {
						state.fechas.start = new Date(state.fechas.start);
					}
					if (state.fechas.end) {
						state.fechas.end = new Date(state.fechas.end);
					}
				}
			},
		},
	),
);

function calcularTotal(
	visitantes: VisitanteSeleccionado[],
	bungalows: BungalowDisponible[],
): number {
	const totalVisitantes = visitantes.reduce(
		(acc, curr) => acc + curr.precio_final,
		0,
	);
	const totalBungalows = bungalows.reduce(
		(acc, curr) => acc + Number(curr.precio_total_estancia),
		0,
	);
	return totalVisitantes + totalBungalows;
}
