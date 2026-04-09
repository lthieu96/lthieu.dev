"use client";

import { Dithering } from "@paper-design/shaders-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ShaderBackgroundProps {
  shape?: string;
  type?: string;
  speed?: number;
  scale?: number;
  size?: number;
  lightColorBack?: string;
  lightColorFront?: string;
  darkColorBack?: string;
  darkColorFront?: string;
  darkOpacity?: number;
  bgLight?: string;
  bgDark?: string;
}

export function ShaderBackground({
  shape = "warp",
  type = "4x4",
  speed = 1.3,
  scale = 0.3,
  size = 0.7,
  lightColorBack = "#f7f9ff",
  lightColorFront = "#cfd8f3",
  darkColorBack = "#10131A",
  darkColorFront = "#141C2F",
  darkOpacity = 0.58,
  bgLight = "#f7f8fc",
  bgDark = "#12151d",
}: ShaderBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-mount: default light to avoid flash, no transition yet
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      className="overflow-hidden"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      {/* Light mode — fades out when going dark */}
      <div
        className="absolute inset-0"
        style={{
          background: bgLight,
          opacity: isDark ? 0 : 1,
          transition: mounted ? "opacity 0.3s ease-in-out" : "none",
        }}
      >
        <Dithering
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          colorBack={lightColorBack}
          colorFront={lightColorFront}
          shape={shape as any}
          type={type as any}
          speed={speed}
          scale={scale}
          size={size}
        />
      </div>

      {/* Dark mode — fades in when going dark */}
      <div
        className="absolute inset-0"
        style={{
          background: bgDark,
          opacity: isDark ? 1 : 0,
          transition: mounted ? "opacity 0.3s ease-in-out" : "none",
        }}
      >
        <Dithering
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: darkOpacity }}
          colorBack={darkColorBack}
          colorFront={darkColorFront}
          shape={shape as any}
          type={type as any}
          speed={speed}
          scale={scale}
          size={size}
        />
      </div>
    </div>
  );
}
