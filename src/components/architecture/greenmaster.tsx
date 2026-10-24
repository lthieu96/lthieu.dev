import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  ArchFigure,
  clamp,
  curve,
  Detail,
  Dot,
  NARROW,
  type PartInfo,
  Swap,
  Track,
  useFigureClock,
  useSelection,
  watchLayout,
} from './shared'

// Variant A (field map) from design/portfolio.pen, research in design/architecture/research-greenmaster.md.
// The old paper report on the left, the tables it became on the right, each field linked to its
// column. Sample data only: the site, people and numbers are made up.

type Who = 'me' | 'team'
type Table = { id: string; who: Who; note: string; cols: [string, string][] }

// Two columns of cards: the report's own tables, then the ones they point at.
const TABLES: Table[][] = [
  [
    {
      id: 'service_reports',
      who: 'me',
      note: 'One row per visit. The server owns status: draft, then ongoing, then complete.',
      // In the paper's order, so the links run side by side instead of crossing.
      cols: [
        ['report_number', 'serial'],
        ['location_id', 'fk'],
        ['service_date', 'date'],
        ['started_at', 'time'],
        ['finished_at', 'time'],
        ['visit_type', 'enum'],
        ['control_areas', 'int[]'],
        ['staff_id', 'fk'],
        ['contact_id', 'fk'],
        ['customer_rating', '1..5'],
        ['status', 'enum'],
      ],
    },
    {
      id: 'report_service_types',
      who: 'me',
      note: 'A join table: one row per ticked service, unique per report and service.',
      cols: [
        ['service_report_id', 'fk'],
        ['service_type_id', 'fk'],
      ],
    },
    {
      id: 'report_tasks',
      who: 'me',
      note: 'One row per line of the work table.',
      cols: [
        ['service_report_id', 'fk'],
        ['service_task_id', 'fk'],
        ['chemical_id', 'fk'],
        ['quantity', 'int'],
        ['notes', 'text'],
      ],
    },
  ],
  [
    {
      id: 'locations',
      who: 'me',
      note: 'The customer’s sites.',
      cols: [
        ['name', 'text'],
        ['address', 'text'],
      ],
    },
    {
      id: 'users',
      who: 'team',
      note: 'Staff accounts, by region.',
      cols: [['first_name', 'text']],
    },
    {
      id: 'contacts',
      who: 'me',
      note: 'People at the customer who sign reports off.',
      cols: [
        ['name', 'text'],
        ['position', 'text'],
        ['phone_number', 'text'],
      ],
    },
    {
      id: 'catalog',
      who: 'me',
      note: 'Services, tasks and chemicals the office edits. Archived, never deleted, so old reports still read right.',
      cols: [
        ['service_types.name', ''],
        ['service_tasks.name', ''],
        ['chemicals.name', ''],
      ],
    },
    {
      id: 'sign-off',
      who: 'team',
      note: 'Proof the customer agreed: a one-time code, stored hashed, or a signature image.',
      cols: [
        ['otps.code', 'bcrypt'],
        ['otps.used_at', 'time'],
        ['signature', 'file'],
      ],
    },
  ],
]
const TABLE_OF = Object.fromEntries(
  TABLES.flat().flatMap((t) => t.cols.map(([c]) => [`${t.id}.${c}`, t])),
)

type FieldId =
  | 'site'
  | 'date'
  | 'time'
  | 'visit'
  | 'tech'
  | 'services'
  | 'areas'
  | 'task'
  | 'chem'
  | 'qty'
  | 'rep'
  | 'rating'
  | 'sig'

/** Where each paper field lands: its column(s), then the lookup a foreign key points at. */
const MAPS: Record<FieldId, { label: string; to: string[]; hop?: string[]; note: string }> = {
  site: {
    label: 'Site',
    to: ['service_reports.location_id'],
    hop: ['locations.name'],
    note: 'Picked from the customer’s locations, so the report stores an id. A renamed site shows its new name on old reports too.',
  },
  date: {
    label: 'Date',
    to: ['service_reports.service_date'],
    note: 'A real date column, required.',
  },
  time: {
    label: 'Time in · out',
    to: ['service_reports.started_at', 'service_reports.finished_at'],
    note: 'Stamped by the server when the visit starts and when it is signed off. Nobody types them.',
  },
  visit: {
    label: 'Visit type',
    to: ['service_reports.visit_type'],
    note: 'Five fixed choices become an enum: initial, follow-up, routine, complaint, intensive.',
  },
  tech: {
    label: 'Technician',
    to: ['service_reports.staff_id'],
    hop: ['users.first_name'],
    note: 'Whoever is logged in on the phone. An admin can file a report for someone else.',
  },
  services: {
    label: 'Services',
    to: ['report_service_types.service_type_id'],
    hop: ['catalog.service_types.name'],
    note: 'Each ticked service is one row in a join table that points at the service catalog.',
  },
  areas: {
    label: 'Areas treated',
    to: ['service_reports.control_areas'],
    note: 'Eight fixed areas fit in one integer array on the report, with an index and no join table.',
  },
  task: {
    label: 'Work done · task',
    to: ['report_tasks.service_task_id'],
    hop: ['catalog.service_tasks.name'],
    note: 'Each line of the work table becomes one report_tasks row.',
  },
  chem: {
    label: 'Work done · chemical',
    to: ['report_tasks.chemical_id'],
    hop: ['catalog.chemicals.name'],
    note: 'The row keeps the chemical’s id, not the name written down, so renaming a product never rewrites an old report.',
  },
  qty: {
    label: 'Work done · quantity',
    to: ['report_tasks.quantity'],
    note: 'Tasks bill by quantity or by chemical, so the amount is a number, not a note.',
  },
  rep: {
    label: 'Customer rep',
    to: ['service_reports.contact_id'],
    hop: ['contacts.name'],
    note: 'The person who signs is one of the customer’s contacts. A new one can be added during sign-off.',
  },
  rating: {
    label: 'Rating',
    to: ['service_reports.customer_rating'],
    note: 'One to five, required before the report can be completed.',
  },
  sig: {
    label: 'Customer signature',
    to: ['service_reports.status'],
    hop: ['sign-off.otps.code', 'sign-off.signature'],
    note: 'Confirmed by a signature or a one-time code sent by Zalo or SMS. One transaction saves it and completes the report.',
  },
}
const FIELD_IDS = Object.keys(MAPS) as FieldId[]

const CHAPTERS: { k: string; fields: FieldId[]; text: ReactNode }[] = [
  {
    k: 'Site',
    fields: ['site', 'date', 'time'],
    text: 'The site is picked from the customer’s locations, so the report keeps an id. The times are stamped by the server.',
  },
  {
    k: 'Visit',
    fields: ['visit', 'tech'],
    text: 'The visit type is one of five fixed values. The technician is whoever is logged in, not a name written down.',
  },
  {
    k: 'Services',
    fields: ['services'],
    text: 'Each ticked box becomes one row in a join table that points at the service catalog.',
  },
  {
    k: 'Areas',
    fields: ['areas'],
    text: 'Eight fixed areas fit in one integer array on the report, with an index and no join table.',
  },
  {
    k: 'Work done',
    fields: ['task', 'chem', 'qty'],
    text: 'Each line becomes a report_tasks row that keeps ids, not names, so renaming a chemical never rewrites an old report.',
  },
  {
    k: 'Sign-off',
    fields: ['rep', 'rating', 'sig'],
    text: 'The customer rates the visit and confirms by signature or one-time code. One transaction writes it all.',
  },
]
const CHAPTER_MS = 2400
const LOOP = CHAPTER_MS * CHAPTERS.length
const REDUCED_CHAPTER = 4 // the work table tells the story best as a still

type Sel = `f:${FieldId}` | `c:${string}`
type Raw = { id: string; f: FieldId; x1: number; y1: number; x2: number; y2: number }
const PORT_GAP = 8

type Box = { l: number; r: number; cy: number }

/** GreenMaster Go: how the paper service report became tables. Hover a field or a column. */
export function GreenMasterArchitecture() {
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const barRefs = useRef<HTMLElement[]>([])
  const { clock, renderRef, playing, setPlaying } = useFigureClock(frameRef, {
    still: REDUCED_CHAPTER * CHAPTER_MS + CHAPTER_MS / 2,
  })
  const [narrow, setNarrow] = useState(false)
  const [chapter, setChapter] = useState(0)
  const [boxes, setBoxes] = useState<{ paper: number; at: Record<string, Box> }>({
    paper: 0,
    at: {},
  })
  const { sel, bind } = useSelection<Sel>(stageRef)

  // Measure every field and column, so links can be drawn between them.
  useEffect(() => {
    const stage = stageRef.current
    const frame = frameRef.current
    if (!stage || !frame) return
    const measure = () => {
      setNarrow(frame.clientWidth < NARROW)
      const S = stage.getBoundingClientRect()
      const at: Record<string, Box> = {}
      for (const el of stage.querySelectorAll<HTMLElement>('[data-anchor]')) {
        const r = el.getBoundingClientRect()
        at[el.dataset.anchor ?? ''] = {
          l: r.left - S.left,
          r: r.right - S.left,
          cy: r.top - S.top + r.height / 2,
        }
      }
      const p = paperRef.current?.getBoundingClientRect()
      setBoxes({ paper: p ? p.right - S.left : 0, at })
    }
    // Caveat, the handwriting, often lands after first paint and reflows the paper.
    return watchLayout(
      [stage, frame, ...stage.children, ...stage.querySelectorAll('[data-anchor]')],
      measure,
    )
  }, [])

  // Chapter = which slice of the loop we're in; the bars show progress through each.
  useEffect(() => {
    const render = () => {
      const t = clock.current % LOOP
      setChapter(Math.floor(t / CHAPTER_MS))
      CHAPTERS.forEach((_, i) => {
        const bar = barRefs.current[i]
        if (bar) bar.style.width = `${clamp((t - i * CHAPTER_MS) / CHAPTER_MS) * 100}%`
      })
    }
    renderRef.current = render
    render()
  }, [clock, renderRef])

  const jump = (i: number) => {
    clock.current += i * CHAPTER_MS + (playing ? 0 : CHAPTER_MS / 2) - (clock.current % LOOP)
    renderRef.current?.()
  }

  // What's lit: a hovered field or column wins, else the chapter's fields.
  const fieldOfCol = (c: string) =>
    FIELD_IDS.find((f) => MAPS[f].to.includes(c) || MAPS[f].hop?.includes(c))
  const selField = sel?.startsWith('f:')
    ? (sel.slice(2) as FieldId)
    : sel
      ? fieldOfCol(sel.slice(2))
      : undefined
  const litFields: FieldId[] = sel ? (selField ? [selField] : []) : CHAPTERS[chapter].fields
  const litCols = new Set(litFields.flatMap((f) => [...MAPS[f].to, ...(MAPS[f].hop ?? [])]))
  if (sel?.startsWith('c:')) litCols.add(sel.slice(2))

  const links: { id: string; d: string; hop: boolean; ends: [number, number][] }[] = []
  if (!narrow) {
    const out: Raw[] = []
    const hops: Raw[] = []
    for (const f of litFields) {
      const from = boxes.at[`f:${f}`]
      const { to, hop = [] } = MAPS[f]
      for (const c of to) {
        const b = boxes.at[`c:${c}`]
        if (from && b)
          out.push({ id: `${f}>${c}`, f, x1: boxes.paper, y1: from.cy, x2: b.l, y2: b.cy })
      }
      const a = boxes.at[`c:${to[0]}`]
      for (const c of hop) {
        const b = boxes.at[`c:${c}`]
        if (a && b) hops.push({ id: `${to[0]}>${c}`, f, x1: a.r, y1: a.cy, x2: b.l, y2: b.cy })
      }
    }
    // Fields side by side on the paper (date, time) leave from the same height: give each its own port.
    const ys = [...new Set(out.map((l) => `${Math.round(l.y1)}|${l.f}`))]
    for (const l of out) {
      const row = ys.filter((k) => k.startsWith(`${Math.round(l.y1)}|`))
      l.y1 += (row.indexOf(`${Math.round(l.y1)}|${l.f}`) - (row.length - 1) / 2) * PORT_GAP
    }
    for (const [group, hop] of [
      [out, false],
      [hops, true],
    ] as const)
      for (const l of group)
        links.push({
          id: l.id,
          d: curve(l.x1, l.y1, l.x2, l.y2, true),
          hop,
          ends: [
            [l.x1, l.y1],
            [l.x2, l.y2],
          ],
        })
  }

  const part = partFor(sel, selField)

  return (
    <ArchFigure
      title="Service report No. 0001284, from paper to rows"
      mineLabel="built by me"
      narrow={narrow}
      frameRef={frameRef}
    >
      <div
        ref={stageRef}
        className="relative grid items-start"
        style={
          narrow
            ? { gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }
            : { gridTemplateColumns: 'minmax(0,300px) minmax(0,1fr) minmax(0,1fr)', columnGap: 44 }
        }
      >
        <div ref={paperRef} className={narrow ? 'col-span-2' : 'mr-3'}>
          <Paper lit={new Set(litFields)} bind={bind} />
        </div>
        {TABLES.map((column) => (
          <div key={column[0].id} className="grid min-w-0 gap-3">
            {column.map((t) => (
              <TableCard key={t.id} t={t} lit={litCols} sel={sel} bind={bind} narrow={narrow} />
            ))}
          </div>
        ))}
        {!narrow && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
          >
            {/* Ports, as in the design: where a link can leave the paper or land on a column. */}
            <g className="fill-subtle/40">
              {Object.entries(boxes.at).map(([k, b]) =>
                k.startsWith('f:') ? (
                  <circle key={k} cx={boxes.paper} cy={b.cy} r={2} />
                ) : TABLES[0].some((t) => k.startsWith(`c:${t.id}.`)) ? (
                  <circle key={k} cx={b.l} cy={b.cy} r={2} />
                ) : null,
              )}
            </g>
            <Swap as="g" k={sel ?? `ch${chapter}`}>
              {links.map((l) => (
                <g key={l.id}>
                  <path
                    d={l.d}
                    pathLength={1}
                    strokeDasharray={1}
                    className={`fill-none stroke-accent animate-[draw_320ms_cubic-bezier(0.77,0,0.175,1)_both] motion-reduce:animate-none ${l.hop ? '[animation-delay:200ms]' : ''}`}
                  />
                  {l.ends.map(([x, y], i) => (
                    <circle
                      // biome-ignore lint/suspicious/noArrayIndexKey: start and end
                      key={i}
                      cx={x}
                      cy={y}
                      r={3}
                      className={`fill-accent animate-[fade-in_150ms_var(--ease-out)_both] motion-reduce:animate-none ${i ? (l.hop ? '[animation-delay:520ms]' : '[animation-delay:320ms]') : l.hop ? '[animation-delay:200ms]' : ''}`}
                    />
                  ))}
                </g>
              ))}
            </Swap>
          </svg>
        )}
      </div>

      <Track
        playing={playing}
        onToggle={() => setPlaying(!playing)}
        labels={CHAPTERS.map((c) => c.k)}
        current={chapter}
        onJump={jump}
        onSeek={(i, f) => {
          clock.current += (i + f) * CHAPTER_MS - (clock.current % LOOP)
          renderRef.current?.()
        }}
        marked={
          new Set(CHAPTERS.flatMap((c, i) => (selField && c.fields.includes(selField) ? [i] : [])))
        }
        barRefs={barRefs}
      />
      <Detail
        domId="greenmaster-arch-detail"
        minH={[100, 140]}
        selKey={sel}
        part={part}
        chapter={chapter}
        text={
          <>
            <b className="font-medium text-fg">{CHAPTERS[chapter].k}.</b> {CHAPTERS[chapter].text}
          </>
        }
        narrow={narrow}
      />
    </ArchFigure>
  )
}

function partFor(sel: Sel | null, field: FieldId | undefined): PartInfo | null {
  if (!sel) return null
  if (sel.startsWith('f:') && field) {
    const m = MAPS[field]
    const t = TABLE_OF[m.to[0]]
    if (field === 'sig')
      return {
        title: m.label,
        mine: false,
        chip: 'team',
        what: m.note,
        mineText: 'completion flow, Zalo or SMS',
        teamText: 'codes, signatures',
      }
    return { title: m.label, mine: t.who === 'me', chip: chip(t.who), what: m.note }
  }
  const col = sel.slice(2)
  const t = TABLE_OF[col]
  return {
    title: col,
    mine: t.who === 'me',
    chip: chip(t.who),
    what: field ? MAPS[field].note : `${t.note} Not on the paper.`,
  }
}

const chip = (who: Who) => (who === 'me' ? 'built by me' : 'team')

type Bind = ReturnType<typeof useSelection<Sel>>['bind']

const litBg = 'bg-accent/10 text-accent'
const fade = (on: boolean) =>
  `rounded transition-colors ease-(--ease-out) ${on ? `${litBg} duration-150` : 'duration-700'}`

/** One field on the paper: a button that lights up while its data is on show. */
function Field({
  id,
  lit,
  bind,
  children,
  className = '',
}: {
  id: FieldId
  lit: Set<FieldId>
  bind: Bind
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      data-node
      data-anchor={`f:${id}`}
      aria-label={MAPS[id].label}
      aria-describedby="greenmaster-arch-detail"
      {...bind(`f:${id}`)}
      className={`-mx-1.5 block cursor-pointer px-1.5 py-0.5 text-left ${fade(lit.has(id))} ${className}`}
    >
      {children}
    </button>
  )
}

/** The paper form. Handwritten values are set in the serif italic, the signature in the hand. */
function Paper({ lit, bind }: { lit: Set<FieldId>; bind: Bind }) {
  const label = 'block text-meta text-muted'
  const hand = 'font-script text-[19px] leading-tight text-fg'
  const boxes = (opts: [string, boolean][]) => (
    <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-fg">
      {opts.map(([o, on]) => (
        <span key={o} className="flex items-center gap-1">
          <i className={`inline-block size-2.5 border border-fg/60 ${on ? 'bg-fg' : ''}`} />
          <span className={on ? '' : 'text-muted'}>{o}</span>
        </span>
      ))}
    </span>
  )
  const work: [string, string, string][] = [
    ['Gel bait', 'Fipronil gel', '12'],
    ['Bait stations', 'Bromadiolone', '6'],
    ['Drain spray', 'Cypermethrin', '2'],
  ]
  return (
    <div className="grid gap-2.5 rounded-lg border border-edge bg-card p-4 shadow-[0_1px_2px_var(--color-card-shadow)]">
      <div className="flex items-baseline justify-between border-line border-b pb-2">
        <span className="font-serif text-[17px] text-fg">Service report</span>
        <span className="font-mono text-meta text-muted">No. 0001284</span>
      </div>
      <Field lit={lit} bind={bind} id="site">
        <span className={label}>Site</span>
        <span className={hand}>Lotus Bakery, Ward 4</span>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field lit={lit} bind={bind} id="date">
          <span className={label}>Date</span>
          <span className={hand}>14/03/2026</span>
        </Field>
        <Field lit={lit} bind={bind} id="time">
          <span className={label}>Time in · out</span>
          <span className={hand}>8:30 · 9:45</span>
        </Field>
      </div>
      <Field lit={lit} bind={bind} id="visit">
        <span className={label}>Visit type</span>
        {boxes([
          ['Initial', false],
          ['Routine', true],
          ['Follow-up', false],
          ['Complaint', false],
        ])}
      </Field>
      <Field lit={lit} bind={bind} id="services">
        <span className={label}>Services</span>
        {boxes([
          ['Cockroach', true],
          ['Rodent', true],
          ['Termite', false],
          ['Mosquito', false],
        ])}
      </Field>
      <Field lit={lit} bind={bind} id="areas">
        <span className={label}>Areas treated</span>
        {boxes([
          ['Kitchen', true],
          ['Warehouse', true],
          ['Canteen', false],
          ['Drains', true],
        ])}
      </Field>
      <div>
        <span className={label}>Work done</span>
        <div className="mt-0.5 grid grid-cols-[1fr_1fr_auto] gap-x-2 text-[11px] text-muted">
          <span>Task</span>
          <span>Chemical</span>
          <span>Qty</span>
        </div>
        {work.map(([task, chem, qty], i) => {
          // Only the first line is wired to the tables; the rest are the same shape.
          const cell = (id: FieldId, v: string) =>
            i === 0 ? (
              <Field lit={lit} bind={bind} id={id} className="!mx-0 !px-1">
                <span className={hand}>{v}</span>
              </Field>
            ) : (
              <span className={`px-1 ${hand}`}>{v}</span>
            )
          return (
            <div
              key={task}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-x-2 border-line border-b py-0.5"
            >
              {cell('task', task)}
              {cell('chem', chem)}
              {cell('qty', qty)}
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field lit={lit} bind={bind} id="tech">
          <span className={label}>Technician</span>
          <span className={hand}>Minh Tran</span>
        </Field>
        <Field lit={lit} bind={bind} id="rep">
          <span className={label}>Customer rep</span>
          <span className={hand}>Lan Pham, manager</span>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field lit={lit} bind={bind} id="rating">
          <span className={label}>Rating</span>
          <span className="flex gap-2.5 font-mono text-meta text-muted">
            {[1, 2, 3, 4, 5].map((r) => (
              <span
                key={r}
                className={
                  r === 4
                    ? 'grid size-5 place-items-center rounded-full border border-fg text-fg'
                    : 'grid size-5 place-items-center'
                }
              >
                {r}
              </span>
            ))}
          </span>
        </Field>
        <Field lit={lit} bind={bind} id="sig">
          <span className={label}>Customer signature</span>
          <span className="block border-fg/40 border-b font-hand text-[22px] leading-tight text-fg">
            Lan Pham
          </span>
        </Field>
      </div>
    </div>
  )
}

function TableCard({
  t,
  lit,
  sel,
  bind,
  narrow,
}: {
  t: Table
  lit: Set<string>
  sel: Sel | null
  bind: Bind
  narrow: boolean
}) {
  const any = t.cols.some(([c]) => lit.has(`${t.id}.${c}`))
  return (
    <div
      className={`min-w-0 rounded-lg border bg-card px-3 py-2.5 transition-colors ease-(--ease-out) ${any ? 'border-accent duration-150' : 'border-edge duration-700'}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[12px] font-medium text-fg">{t.id}</span>
        <Dot mine={t.who === 'me'} />
      </div>
      {/* One tab stop per table; arrow keys move between its columns. */}
      {t.cols.map(([c, type], i) => {
        const id = `${t.id}.${c}`
        const b = bind(`c:${id}`)
        const on = lit.has(id)
        return (
          <button
            key={c}
            type="button"
            tabIndex={i === 0 ? 0 : -1}
            data-node
            data-anchor={`c:${id}`}
            aria-describedby="greenmaster-arch-detail"
            {...b}
            onKeyDown={(e) => {
              b.onKeyDown(e)
              const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
              if (!step) return
              e.preventDefault()
              const row = e.currentTarget.parentElement?.querySelectorAll('button')
              ;(row?.[i + step] as HTMLButtonElement | undefined)?.focus()
            }}
            className={`-mx-1.5 flex w-[calc(100%+12px)] cursor-pointer items-baseline justify-between gap-2 px-1.5 font-mono text-[11px] leading-[20px] ${fade(on)} ${on || sel === `c:${id}` ? '' : 'text-muted'}`}
          >
            <span className="truncate">{c}</span>
            {!narrow && type && <span className={on ? '' : 'text-subtle'}>{type}</span>}
          </button>
        )
      })}
    </div>
  )
}
