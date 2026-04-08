"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HalftoneDots } from "@paper-design/shaders-react";
import { AvatarShader } from "@/components/avatar-shader";

const LENS = 76;
// avatar.png: 1863 × 2565
const IMG_ASPECT = 1863 / 2565;

interface CanvasConfig {
	w: number;
	h: number;
	/** top-left offset of the canvas in card coordinates */
	x: number;
	y: number;
}

/**
 * Compute the halftone canvas dimensions and card-coordinate offset that
 * exactly matches how the avatar renders inside the card:
 *
 *   container: absolute inset-x-[10%] top-[15%] -bottom-[15%]
 *   image:     scale-[1.2] object-contain object-bottom
 */
function computeCanvas(cardW: number, cardH: number): CanvasConfig {
	// Image container: absolute inset-x-[2%] top-[1%] -bottom-[5%]
	const containerX = 0.02 * cardW;
	const containerY = 0.01 * cardH;
	const containerW = 0.96 * cardW;
	const containerH = cardH; // full card height (extends below, clipped by card)

	// object-contain: pick constraining axis
	const containerAspect = containerW / containerH;
	let bitmapW: number, bitmapH: number;
	if (IMG_ASPECT > containerAspect) {
		// width-constrained
		bitmapW = containerW;
		bitmapH = containerW / IMG_ASPECT;
	} else {
		// height-constrained
		bitmapH = containerH;
		bitmapW = containerH * IMG_ASPECT;
	}

	// object-bottom (vertical) + object-center (horizontal default)
	const bitmapXInEl = (containerW - bitmapW) / 2;
	const bitmapYInEl = containerH - bitmapH;

	// scale-[1.2] transforms the <img> element from its center (transform-origin: 50% 50%)
	const SCALE = 1.3;
	const elemCX = containerW / 2;
	const elemCY = containerH / 2;

	const canvasX = containerX + elemCX + SCALE * (bitmapXInEl - elemCX);
	const canvasY = containerY + elemCY + SCALE * (bitmapYInEl - elemCY);
	const canvasW = bitmapW * SCALE;
	const canvasH = bitmapH * SCALE;

	return { w: canvasW, h: canvasH, x: canvasX, y: canvasY };
}

export function AvatarCard() {
	const [canvasConfig, setCanvasConfig] = useState<CanvasConfig | null>(null);
	const canvasConfigRef = useRef<CanvasConfig | null>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const lensRef = useRef<HTMLDivElement>(null);
	const halftoneWrapRef = useRef<HTMLDivElement>(null);

	const handleMouseEnter = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const config = computeCanvas(rect.width, rect.height);
			canvasConfigRef.current = config;
			setCanvasConfig(config);
		},
		[],
	);

	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const lens = lensRef.current;
		const wrap = halftoneWrapRef.current;
		const cfg = canvasConfigRef.current;
		if (!lens || !wrap || !cfg) return;

		const rect = cardRef.current!.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Center the lens frame on the cursor
		lens.style.left = `${x - LENS / 2}px`;
		lens.style.top = `${y - LENS / 2}px`;

		// Shift the canvas so card-position (x, y) appears at lens center.
		// The canvas origin in card coords is (cfg.x, cfg.y).
		// In lens-local coords its origin is at (cfg.x − (x − LENS/2), cfg.y − (y − LENS/2)).
		wrap.style.transform = `translate(${cfg.x - x + LENS / 2}px, ${cfg.y - y + LENS / 2}px)`;
	}, []);

	const handleMouseLeave = useCallback(() => {
		setCanvasConfig(null);
		canvasConfigRef.current = null;
	}, []);

	return (
		<div className="relative w-full max-w-[250px] overflow-clip p-2">
			<AvatarShader />

			<div
				ref={cardRef}
				className="relative aspect-[4/5] overflow-hidden rounded-sm border border-black/8 bg-[#ecebe7] shadow-[0_24px_80px_rgba(15,15,15,0.12)] dark:border-white/8 dark:bg-[#1c1c1a] dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
				style={{ cursor: canvasConfig ? "none" : undefined }}
				onMouseEnter={handleMouseEnter}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
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

				<div className="absolute inset-x-[2%] top-[1%] -bottom-[5%]">
					<Image
						src="/avatar.png"
						alt="Portrait of Hieu Le"
						fill
						priority
						sizes="150px"
						className="scale-[1.3] object-contain object-bottom contrast-110"
					/>
				</div>
				<div className="absolute inset-x-[6%] bottom-[2%] h-[16%] rounded-full bg-black/18 blur-[30px] dark:bg-black/38" />
				<div className="absolute inset-x-[8%] bottom-[6%] h-[18%] rounded-full bg-black/28 blur-3xl dark:bg-black/50" />
				<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 via-black/5 to-transparent dark:from-black/28 dark:via-black/10" />

				<AnimatePresence>
					{canvasConfig && (
						<motion.div
							ref={lensRef}
							className="pointer-events-none absolute z-20 overflow-hidden rounded-full border border-black/20 shadow-[0_2px_16px_rgba(0,0,0,0.24)] dark:border-white/20"
							style={{ width: LENS, height: LENS, top: 0, left: 0 }}
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.6 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
						>
							{/* Canvas sized to match the exact rendered image region */}
							<div
								ref={halftoneWrapRef}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: canvasConfig.w,
									height: canvasConfig.h,
									willChange: "transform",
								}}
							>
								<HalftoneDots
									image="/avatar.png"
									style={{ width: "100%", height: "100%" }}
									fit="contain"
									colorBack="#141414"
									colorFront="#1247d9"
									originalColors={false}
									type="holes"
									grid="square"
									inverted={true}
									size={0.79}
									radius={1}
									contrast={1}
									grainMixer={0.19}
									grainOverlay={0.3}
									grainSize={0.5}
									speed={0}
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
