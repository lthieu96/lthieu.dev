import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared 5-column page layout used by Header, Section, and any other full-width rows.
 * Guarantees identical column widths across all consumers.
 *
 *  [left margin] [mid-left spacer (md+)] [content] [mid-right spacer (md+)] [right margin]
 */
export function PageFrame({
	as: Tag = "div",
	className,
	style,
	leftSlot,
	midLeftSlot,
	midRightSlot,
	rightSlot,
	leftClassName,
	midLeftClassName,
	contentClassName,
	midRightClassName,
	rightClassName,
	children,
}: {
	as?: ElementType;
	className?: string;
	style?: React.CSSProperties;
	/** Decorations rendered inside the left margin column */
	leftSlot?: ReactNode;
	/** Decorations rendered inside the mid-left spacer column */
	midLeftSlot?: ReactNode;
	/** Decorations rendered inside the mid-right spacer column */
	midRightSlot?: ReactNode;
	/** Decorations rendered inside the right margin column */
	rightSlot?: ReactNode;
	leftClassName?: string;
	midLeftClassName?: string;
	contentClassName?: string;
	midRightClassName?: string;
	rightClassName?: string;
	children?: ReactNode;
}) {
	return (
		<Tag className={cn("flex", className)} style={style}>
			{/* Left margin column */}
			<span
				className={cn(
					"relative w-4 sm:w-6 md:w-12 shrink-0",
					leftClassName,
				)}
			>
				{leftSlot}
			</span>

			{/* Mid-left spacer column (md+) */}
			<span
				className={cn(
					"relative hidden flex-1 md:block",
					midLeftClassName,
				)}
			>
				{midLeftSlot}
			</span>

			{/* Content column */}
			<div
				className={cn(
					"relative container-max-w max-md:min-w-0 flex-1",
					contentClassName,
				)}
			>
				{children}
			</div>

			{/* Mid-right spacer column (md+) */}
			<span
				className={cn(
					"relative hidden flex-1 md:block",
					midRightClassName,
				)}
			>
				{midRightSlot}
			</span>

			{/* Right margin column */}
			<span
				className={cn(
					"relative w-4 sm:w-6 md:w-12 shrink-0",
					rightClassName,
				)}
			>
				{rightSlot}
			</span>
		</Tag>
	);
}
