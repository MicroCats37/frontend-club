// app/layout.tsx - CONVERTIR A SERVIDOR
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Script from "next/script";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = new QueryClient();
	const dehydratedState = dehydrate(queryClient);
	return (
		<html lang="en" suppressHydrationWarning>
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
				<Toaster></Toaster>
				<ReactQueryProvider dehydratedState={dehydratedState}>
					{children}
				</ReactQueryProvider>
			</body>
		</html>
	);
}
