export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs text-accent-brand">({index})</span>
      <span className="font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
        {title}
      </span>
      <div className="h-px flex-1 bg-[color:var(--layout-line)]" />
    </div>
  )
}
