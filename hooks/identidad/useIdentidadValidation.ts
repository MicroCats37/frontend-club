import { useMutation, useQuery } from "@tanstack/react-query";
import { PersonaValidacion } from "@/schemas/identidad";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function useIdentidadValidation() {
	const bulkValidate = useMutation({
		mutationFn: async (dnis: string[]) => {
			const res = await fetch(`${API_URL}/control/identidad/bulk-validate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ dnis }),
			});
			if (!res.ok) throw new Error("Error en la validación masiva");
			return (await res.json()) as PersonaValidacion[];
		},
	});

	const validateSingle = useMutation({
		mutationFn: async (dni: string) => {
			const res = await fetch(`${API_URL}/control/identidad/validar/${dni}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (!res.ok) throw new Error("Error en la validación de identidad");
			return (await res.json()) as PersonaValidacion;
		},
	});

	return {
		bulkValidate,
		validateSingle,
	};
}
