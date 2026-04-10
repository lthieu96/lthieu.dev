import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Header } from "@/components/header";
import { Noise } from "@/components/noise";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const lora = Lora({
	variable: "--font-lora",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Hieu Le",
	description: "Personal portfolio",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="relative min-h-full flex flex-col">
				<ThemeProvider attribute="class" defaultTheme="light">
					<Noise className="fixed" />
					<Header />
					<div className="flex flex-1 flex-col">{children}</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
