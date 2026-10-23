import { Moon, Sun } from 'lucide-react'
import { setTheme, useTheme } from '@/lib/theme'

const icon =
  'col-start-1 row-start-1 transition-[opacity,scale,rotate] duration-200 ease-(--ease-out)'
const hidden = 'scale-50 rotate-45 opacity-0'

/** Sun in light mode, moon in dark mode. Click to switch; the choice is remembered. */
export function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="grid size-8 place-items-center rounded-full text-subtle transition-[color,background-color,scale] duration-150 ease-(--ease-out) hover:bg-well hover:text-fg active:scale-[0.94]"
    >
      <Moon size={15} aria-hidden className={`${icon} ${theme === 'dark' ? '' : hidden}`} />
      <Sun size={15} aria-hidden className={`${icon} ${theme === 'light' ? '' : hidden}`} />
    </button>
  )
}
