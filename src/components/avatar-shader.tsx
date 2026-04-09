"use client";

import { Dithering, PaperTexture } from "@paper-design/shaders-react";

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
			className="overflow-hidden bg-[#f7f8fc] dark:bg-[#12151d]"
		>
			<div className="absolute inset-0 dark:hidden">
				<Dithering
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
					}}
					colorBack="#f7f9ff"
					colorFront="#cfd8f3"
					shape="warp"
					type="4x4"
					speed={1.3}
					scale={0.3}
					size={0.7}
				/>

				<PaperTexture
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						opacity: 0.14,
					}}
					speed={0}
					scale={1}
					colorFront="#d7e1fb"
					colorBack="#ffffff"
					contrast={0.1}
					roughness={0.42}
					fiber={0.18}
					fiberSize={0.16}
					crumples={0.08}
					crumpleSize={0.22}
					folds={0.04}
					foldCount={3}
					drops={0}
					fade={0}
					seed={3.2}
				/>
			</div>

			<div className="absolute inset-0 hidden dark:block">
				<Dithering
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						opacity: 0.58,
					}}
					colorBack="#10131A"
					colorFront="#141C2F"
					shape="warp"
					type="4x4"
					speed={1.3}
					scale={0.3}
					size={0.7}
				/>
			</div>
		</div>
	);
}
