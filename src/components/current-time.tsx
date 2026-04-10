'use client'

import { format } from 'date-fns'
import { useEffect, useState } from 'react'

function getCurrentTime() {
  return format(new Date(), 'HH:mm')
}

export function CurrentTime() {
  const [time, setTime] = useState(getCurrentTime)

  useEffect(() => {
    const update = () => setTime(getCurrentTime())

    update()
    const intervalId = window.setInterval(update, 60_000)

    return () => window.clearInterval(intervalId)
  }, [])

  return <>{time}</>
}
