import * as React from "react"
import { useRef } from "react"
import {
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"

import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const cn = (...args: ClassValue[]) => twMerge(clsx(args))

export interface AnimatedDockProps {
  className?: string
  items: DockItemData[]
}

export interface DockItemData {
  /** Accessible label / tooltip — required since items are icon-only. */
  label: string
  Icon: React.ReactNode
  /** Provide a link to render an anchor, or an onClick to render a button. */
  link?: string
  target?: string
  onClick?: () => void
}

export const AnimatedDock = ({ className, items }: AnimatedDockProps) => {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-4 rounded-2xl border border-border bg-surface/70 px-4 pb-3 shadow-[var(--shadow-md)] backdrop-blur-md",
        className,
      )}
    >
      {items.map((item, index) => (
        <DockItem key={index} mouseX={mouseX}>
          {item.link ? (
            <a
              href={item.link}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              aria-label={item.label}
              title={item.label}
              className="flex h-full w-full grow items-center justify-center text-primary-ink"
            >
              {item.Icon}
            </a>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              aria-label={item.label}
              title={item.label}
              className="flex h-full w-full grow cursor-pointer items-center justify-center text-primary-ink"
            >
              {item.Icon}
            </button>
          )}
        </DockItem>
      ))}
    </motion.div>
  )
}

interface DockItemProps {
  mouseX: MotionValue<number>
  children: React.ReactNode
}

export const DockItem = ({ mouseX, children }: DockItemProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  const iconScale = useTransform(width, [40, 80], [1, 1.5])
  const iconSpring = useSpring(iconScale, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="flex aspect-square w-10 items-center justify-center rounded-full bg-primary text-primary-ink"
    >
      <motion.div
        style={{ scale: iconSpring }}
        className="flex h-full w-full grow items-center justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
