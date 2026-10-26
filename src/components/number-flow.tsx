import Base, { type NumberFlowProps } from '@number-flow/react'
import { useMotionForced } from '@/lib/use-media-query'

export { NumberFlowGroup } from '@number-flow/react'

/** NumberFlow, which reads Reduce Motion by itself, so it also has to hear the footer's override. */
export default function NumberFlow(props: NumberFlowProps) {
  return <Base respectMotionPreference={!useMotionForced()} {...props} />
}
