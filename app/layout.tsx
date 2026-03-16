import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/auth/AuthInitializer";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
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
			<head>
				<Script
					src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"
					strategy="beforeInteractive"
				/>
			</head>
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
