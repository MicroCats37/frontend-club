/**
 * Formats a number as Peruvian Soles (PEN) currency.
 */
export function formatCurrency(value: number | string): string {
	const amount = typeof value === "string" ? Number.parseFloat(value) : value;

	return new Intl.NumberFormat("es-PE", {
		style: "currency",
		currency: "PEN",
		minimumFractionDigits: 2,
	}).format(amount || 0);
}
