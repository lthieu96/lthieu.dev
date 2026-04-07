import { DividerSlash } from "@/components/divider-slash";
import { Section } from "@/components/section";

export default function Home() {
	return (
		<>
			<Section className="flex-1" minHeight="60vh">
				<div className="flex flex-1 flex-col justify-center px-6 sm:px-10 md:px-16 py-24">
					<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
						Hieu Le
					</h1>
					<p className="mt-4 text-lg text-[var(--foreground-muted)] sm:text-xl">
						Software Engineer
					</p>
				</div>
			</Section>
			<DividerSlash />
		</>
	);
}
