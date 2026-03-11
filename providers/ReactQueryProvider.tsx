// app/providers.tsx
"use client";

import {
	type DehydratedState, // Importamos el tipo clave
	HydrationBoundary,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { type PropsWithChildren, useState } from "react";

// 1. Definición de la Interfaz (Props)
interface ProvidersProps extends PropsWithChildren {
	// El estado deshidratado que viene del Server Component
	dehydratedState: DehydratedState;
}

// 2. Aplicación de la Interfaz al Componente
export default function Providers({
	children,
	dehydratedState,
}: ProvidersProps) {
	// Inicializamos el QueryClient una sola vez
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Opcional: Configuración predeterminada, por ejemplo, mantener el dato fresco
						staleTime: 5 * 1000, // 5 segundos
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{/* HydrationBoundary necesita el estado deshidratado 
        para poblar el caché en el cliente.
      */}
			<HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
		</QueryClientProvider>
	);
}
