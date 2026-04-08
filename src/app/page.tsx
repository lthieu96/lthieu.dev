import Image from "next/image";
import { AvatarShader } from "@/components/avatar-shader";
import { DividerSlash } from "@/components/divider-slash";
import { Section } from "@/components/section";
import { TextFlip } from "@/components/text-flip/text-flip";

export default function Home() {
	return (
		<>
			<Section>
				<div className="grid grid-cols-[150px_minmax(0,1fr)] content-start items-start gap-4">
					<div className="relative w-full max-w-[250px] overflow-clip p-2">
						<AvatarShader />

						<div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-black/8 bg-[#ecebe7] shadow-[0_24px_80px_rgba(15,15,15,0.12)] dark:border-white/8 dark:bg-[#1c1c1a] dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.92),rgba(255,255,255,0.52)_36%,transparent_74%)] dark:bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_36%,transparent_74%)]" />
							<div
								aria-hidden="true"
								className="absolute inset-0 bg-repeat opacity-[0.16] dark:opacity-[0.08]"
								style={{
									backgroundImage:
										"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
									backgroundSize: "300px 300px",
								}}
							/>

							<div className="absolute inset-x-[10%] -bottom-[15%] top-[15%]">
								<Image
									src="/avatar.png"
									alt="Portrait of Hieu Le"
									fill
									priority
									sizes="150px"
									className="scale-[1.2] object-contain object-bottom contrast-110"
								/>
							</div>
							<div className="absolute inset-x-[6%] bottom-[2%] h-[16%] rounded-full bg-black/18 blur-[30px] dark:bg-black/38" />
							<div className="absolute inset-x-[8%] bottom-[6%] h-[18%] rounded-full bg-black/28 blur-3xl dark:bg-black/50" />
							<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 via-black/5 to-transparent dark:from-black/28 dark:via-black/10" />
						</div>
					</div>

					<div className="default-border-text-color flex min-h-full w-full flex-col justify-end border-l border-current pl-3 pt-1">
						<h1 className="w-full text-[30px] leading-none font-semibold tracking-[-0.05em] text-foreground">
							Hieu Le
						</h1>
						<div className="mt-1 mb-2 h-6 w-full overflow-hidden">
							<TextFlip
								className="w-full text-sm leading-6 text-muted-foreground sm:text-base"
								interval={2.8}
							>
								<span>Fullstack Developer</span>
								<span>Building Web Applications</span>
								<span>Portfolio Systems at Scale</span>
								<span>Admin Tools &amp; Dashboards</span>
							</TextFlip>
						</div>
					</div>
				</div>
			</Section>
			<DividerSlash />
		</>
	);
}
