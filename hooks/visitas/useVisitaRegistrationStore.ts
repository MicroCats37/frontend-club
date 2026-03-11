import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";

export type VisitaTipo = "PASE_DIARIO" | "BUNGALOW";

export interface GuestSelection {
	persona_id: string;
	nombre_completo: string;
	tipo_entrada_id: string;
	con_cupon: boolean;
	precio_unitario: number;
	total_persona: number;
	usa_cupon: boolean;
	en_bungalow: boolean;
}

interface VisitaRegistrationState {
	pasoActual: number;
	tipoVisita: VisitaTipo | null;
	fechas: { start: Date | null; end: Date | null };
	guestSelections: GuestSelection[];
	bungalowsSeleccionados: Bungalow[];
	totalEstimado: number;

	// Actions
	setPaso: (paso: number) => void;
	setTipoVisita: (tipo: VisitaTipo) => void;
	setFechas: (start: Date | null, end: Date | null) => void;
	addGuest: (guest: GuestSelection) => void;
	removeGuest: (personaId: string) => void;
	updateGuest: (personaId: string, delta: Partial<GuestSelection>) => void;
	bulkUpdateGuests: (delta: Partial<GuestSelection>) => void;
	setBungalows: (bungalows: Bungalow[]) => void;
	setTotalEstimado: (total: number) => void;
	reset: () => void;
}

export const useVisitaRegistrationStore = create<VisitaRegistrationState>()(
	persist(
		(set) => ({
			pasoActual: 1,
			tipoVisita: null,
			fechas: { start: null, end: null },
			guestSelections: [],
			bungalowsSeleccionados: [],
			totalEstimado: 0,

			setPaso: (paso) => set({ pasoActual: paso }),
			setTipoVisita: (tipo) =>
				set((state) => {
					// Si cambia el tipo, reiniciamos el progreso pero mantenemos lo coherente
					if (state.tipoVisita !== tipo) {
						return {
							tipoVisita: tipo,
							pasoActual: 1,
							guestSelections: [],
							bungalowsSeleccionados: [],
							totalEstimado: 0,
						};
					}
					return { tipoVisita: tipo };
				}),
			setFechas: (start, end) => set({ fechas: { start, end } }),
			addGuest: (guest) =>
				set((state) => ({
					guestSelections: [
						...state.guestSelections.filter(
							(g) => g.persona_id !== guest.persona_id,
						),
						guest,
					],
				})),
			removeGuest: (personaId) =>
				set((state) => ({
					guestSelections: state.guestSelections.filter(
						(g) => g.persona_id !== personaId,
					),
				})),
			updateGuest: (personaId, delta) =>
				set((state) => ({
					guestSelections: state.guestSelections.map((g) =>
						g.persona_id === personaId ? { ...g, ...delta } : g,
					),
				})),
			bulkUpdateGuests: (delta) =>
				set((state) => ({
					guestSelections: state.guestSelections.map((g) => ({
						...g,
						...delta,
					})),
				})),
			setBungalows: (bungalows) => set({ bungalowsSeleccionados: bungalows }),
			setTotalEstimado: (total) => set({ totalEstimado: total }),
			reset: () =>
				set({
					pasoActual: 1,
					tipoVisita: null,
					fechas: { start: null, end: null },
					guestSelections: [],
					bungalowsSeleccionados: [],
					totalEstimado: 0,
				}),
		}),
		{
			name: "visita-registration-storage",
			onRehydrateStorage: () => (state) => {
				if (state) {
					if (state.fechas.start)
						state.fechas.start = new Date(state.fechas.start);
					if (state.fechas.end) state.fechas.end = new Date(state.fechas.end);
				}
			},
		},
	),
);
