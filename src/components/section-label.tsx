export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="border border-accent-brand/50 px-2 py-1 font-mono text-[10px] leading-none tracking-[0.14em] text-accent-brand uppercase">
        DWG {index}
      </span>
      <span className="font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
        {title}
      </span>
      <div className="h-px flex-1 border-t border-dashed border-[color:var(--layout-line)]" />
      <span aria-hidden="true" className="font-mono text-xs text-foreground/35 select-none">
        +
      </span>
    </div>
  )
}
