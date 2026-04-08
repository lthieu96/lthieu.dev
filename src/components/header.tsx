import { PageFrame } from "./page-frame";
import { ThemeSwitch } from "./theme-switch";

export function Header() {
	return (
		<PageFrame
			as="header"
			className="border-b border-border"
			leftClassName="border-r border-border"
			midLeftClassName="border-r border-border"
			contentClassName="flex items-center justify-between px-4 sm:px-6 h-14"
			midRightClassName="border-l border-border"
			rightClassName="border-l border-border"
			>
				<span className="font-mono text-sm font-medium tracking-tight text-foreground">
					lthieu.dev
				</span>
				<ThemeSwitch />
			</PageFrame>
	);
}
