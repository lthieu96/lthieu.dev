"use client";

import { GrainGradient, PaperTexture, Warp } from "@paper-design/shaders-react";

export function AvatarShader() {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
			}}
			className="overflow-hidden bg-[#f7f8fc] dark:border-white/8 dark:bg-[#12151d]"
		>
			<div className="absolute inset-0 dark:hidden">
				<Warp
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
					}}
					// colors={["#f8fbff", "#eef2ff", "#f8fbff", "#eef2ff"]}
					colors={["#f8fbff", "#dbe4ff", "#eef2ff", "#cfd8f3"]}
					proportion={0.2}
					softness={0.5}
					distortion={0.01}
					swirl={0.6}
					swirlIterations={6}
					shapeScale={0.6}
					speed={13}
					scale={0.3}
				/>

				<GrainGradient
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						opacity: 0.25,
					}}
					speed={0}
					scale={10}
					colorBack="#f7f9ff"
					colors={["#f8fbff"]}
					softness={0.4}
					intensity={1}
					noise={1}
					shape="wave"
				/>
			</div>

			<div className="absolute inset-0 hidden dark:block">
				<Warp
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						opacity: 0.5,
					}}
					colors={["#0f1320", "#18284f", "#101623", "#1a2441"]}
					proportion={0.2}
					softness={0.5}
					distortion={0.01}
					swirl={0.6}
					swirlIterations={6}
					shapeScale={0.6}
					speed={13}
					scale={0.3}
				/>

				<GrainGradient
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						opacity: 0.13,
					}}
					speed={0}
					scale={0.76}
					colorBack="#0f1219"
					colors={["#24386b", "#1b2b53", "#2b437f"]}
					softness={0.55}
					intensity={0.62}
					noise={1}
					shape="wave"
				/>
			</div>
		</div>
	);
}
