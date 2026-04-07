export function GridLines({ columns = 12 }: { columns?: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
      style={{
        backgroundImage: `repeating-linear-gradient(
          to right,
          var(--grid-line) 0px,
          var(--grid-line) 1px,
          transparent 1px,
          transparent calc(100% / ${columns})
        )`,
      }}
    />
  );
}
