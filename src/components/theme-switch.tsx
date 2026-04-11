'use client'

import { Moon01, Sun } from '@untitledui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeSwitch() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="size-8" />
  }

  const currentTheme = theme ?? resolvedTheme ?? 'light'
  const isDark = currentTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative overflow-hidden text-foreground/60 touch-manipulation"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            className="flex items-center justify-center"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Sun size={16} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            className="flex items-center justify-center"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Moon01 size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
