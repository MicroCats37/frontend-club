import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "CE CIP Lima | Sede Campestre",
	description: "Portal de gestión - Centro de Esparcimiento CIP Lima",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<ReactQueryProvider>
					<AuthInitializer />
					{children}
					<Toaster position="top-right" richColors closeButton />
				</ReactQueryProvider>
			</body>
		</html>
	);
}
