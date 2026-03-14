import { create } from "zustand";
import type { Bungalow } from "@/schemas/alojamiento/bungalow";
import type { TipoTarifa } from "@/schemas/alojamiento/tarifa";

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
	has_been_quoted: boolean;
}

interface VisitaRegistrationState {
	pasoActual: number;
	tipoVisita: VisitaTipo | null;
	fechas: { start: Date | null; end: Date | null };
	guestSelections: GuestSelection[];
	bungalowsSeleccionados: Bungalow[];
	tipoTarifaId: string | null;
	selectedTariff: TipoTarifa | null;
	totalEstimado: number;
	defaultTipoPaseId: string | null;
	hasQuoted: boolean;
	createdVisitId: string | null;
	ordenCobroId: string | null;

	// Actions
	setHasQuoted: (quoted: boolean) => void;
	setPaso: (paso: number) => void;
	setTipoVisita: (tipo: VisitaTipo) => void;
	setFechas: (start: Date | null, end: Date | null) => void;
	setTipoTarifaId: (id: string | null) => void;
	setSelectedTariff: (tariff: TipoTarifa | null) => void;
	addGuest: (guest: GuestSelection) => void;
	removeGuest: (personaId: string) => void;
	updateGuest: (personaId: string, delta: Partial<GuestSelection>) => void;
	bulkUpdateGuests: (delta: Partial<GuestSelection>) => void;
	setBungalows: (bungalows: Bungalow[]) => void;
	setTotalEstimado: (total: number) => void;
	setDefaultTipoPaseId: (id: string | null) => void;
	setCreatedVisitId: (id: string | null) => void;
	setOrdenCobroId: (id: string | null) => void;
	reset: () => void;
}

export const useVisitaRegistrationStore = create<VisitaRegistrationState>()(
	(set) => ({
		pasoActual: 1,
		tipoVisita: null,
		fechas: { start: null, end: null },
		guestSelections: [],
		bungalowsSeleccionados: [],
		tipoTarifaId: null,
		selectedTariff: null,
		totalEstimado: 0,
		defaultTipoPaseId: null,
		hasQuoted: false,
		createdVisitId: null,
		ordenCobroId: null,

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
						tipoTarifaId: null,
						selectedTariff: null,
						totalEstimado: 0,
						hasQuoted: false,
						createdVisitId: null,
						ordenCobroId: null,
					};
				}
				return { tipoVisita: tipo };
			}),
		setFechas: (start, end) => set({ fechas: { start, end } }),
		setTipoTarifaId: (id) =>
			set((state) => ({
				tipoTarifaId: id,
				bungalowsSeleccionados:
					state.tipoTarifaId !== id ? [] : state.bungalowsSeleccionados,
			})),
		setSelectedTariff: (tariff) =>
			set((state) => ({
				selectedTariff: tariff,
				tipoTarifaId: tariff?.id || null,
				bungalowsSeleccionados:
					state.tipoTarifaId !== tariff?.id ? [] : state.bungalowsSeleccionados,
				fechas: state.tipoTarifaId !== tariff?.id ? { start: null, end: null } : state.fechas,
			})),
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
		setDefaultTipoPaseId: (id) => set({ defaultTipoPaseId: id }),
		setHasQuoted: (quoted) => set({ hasQuoted: quoted }),
		setCreatedVisitId: (id) => set({ createdVisitId: id }),
		setOrdenCobroId: (id) => set({ ordenCobroId: id }),
		reset: () =>
			set({
				pasoActual: 1,
				tipoVisita: null,
				fechas: { start: null, end: null },
				guestSelections: [],
				bungalowsSeleccionados: [],
				tipoTarifaId: null,
				selectedTariff: null,
				totalEstimado: 0,
				defaultTipoPaseId: null,
				hasQuoted: false,
				createdVisitId: null,
				ordenCobroId: null,
			}),
	}),
);
