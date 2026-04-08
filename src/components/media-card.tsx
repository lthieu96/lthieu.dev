"use client";

import { Maximize2 } from "lucide-react";
import { Swirl } from "@paper-design/shaders-react";

interface MediaCardProps {
	src: string;
	poster?: string;
	label?: string;
	className?: string;
}

export function MediaCard({ src, poster, label = "Play Video", className = "" }: MediaCardProps) {
	return (
		<div className={`group relative h-fit overflow-clip ${className}`}>
			{/* Shader background — identical to zed.dev */}
			<div
				style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
				className="opacity-15 dark:opacity-8"
			>
				<Swirl
					style={{ width: "100%", height: "100%" }}
					colors={["#dde0f0", "#eceaf4", "#f0eff8", "#e4e8f5"]}
					speed={0.18}
				/>
			</div>

			{/* Media card */}
			<div className="group/media relative overflow-clip rounded-sm border border-border hover:!border-blue-300 dark:hover:!border-blue-400/50 hover:![box-shadow:_6px_6px_0_hsla(219,_100%,_40%,_0.06),-6px_-6px_0_hsla(219,_100%,_40%,_0.06)] transition-[border-color,box-shadow] duration-150">
				{/* Poster image — hides on hover */}
				{poster && (
					<img
						alt=""
						loading="lazy"
						src={poster}
						className="aspect-video w-full select-none object-cover object-bottom group-hover/media:hidden bg-muted"
					/>
				)}

				{/* Video — shows on hover */}
				<video
					poster={poster}
					muted
					loop
					playsInline
					preload="auto"
					src={src}
					className="hidden opacity-0 aspect-video w-full object-cover object-bottom group-hover/media:block group-hover/media:opacity-100 transition-opacity bg-muted"
					onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
					onMouseLeave={(e) => {
						const v = e.currentTarget as HTMLVideoElement;
						v.pause();
						v.currentTime = 0;
					}}
				/>

				{/* Info bar — slides up on hover */}
				<div className="absolute right-0 bottom-0 left-0 z-10 flex items-center border-t border-border group-hover/media:border-blue-300 dark:group-hover/media:border-blue-400/50 text-blue-600 dark:text-blue-100 text-xs [box-shadow:hsl(218,_13%,_50%,_0.05)_0_-2px_0_0_inset] dark:[box-shadow:hsl(218,_13%,_40%,_0.05)_0_-2px_0_0_inset] translate-y-full group-hover/media:translate-y-0 transition-transform duration-100">
					<button
						type="button"
						className="flex items-center gap-2 px-3 py-1.5 w-full text-left text-xs cursor-pointer"
					>
						<span>{label}</span>
						<Maximize2 size={10} className="ml-auto" />
					</button>
				</div>
			</div>
		</div>
	);
}
