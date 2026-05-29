'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// Strong ease-out: feels fast and intentional on the first frame
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

interface Pillar {
  title: string
  detail: string
}

interface Props {
  pillars: Pillar[]
}

export function SolutionPillars({ pillars }: Props) {
  const ref = useRef<HTMLOListElement>(null)
  // Fires once when the list is at least 80px inside the viewport
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <ol ref={ref} className="mt-12 space-y-10">
      {pillars.map(({ title, detail }, i) => (
        <motion.li
          key={title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.13 }}
          className="flex gap-8 items-start"
        >
          <span
            aria-hidden
            className="font-display text-5xl font-bold tabular-nums leading-none pt-1 shrink-0 w-12 text-muted-foreground opacity-40"
          >
            {i + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-2xl">{detail}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}
