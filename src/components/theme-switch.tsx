"use client";

import { Moon01, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeSwitch() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="size-8" />;
	}

	const isDark = resolvedTheme === "dark";

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="text-foreground/60"
		>
			{isDark ? <Sun size={16} /> : <Moon01 size={16} />}
		</Button>
	);
}
