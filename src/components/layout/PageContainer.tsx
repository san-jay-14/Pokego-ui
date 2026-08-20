import type { ReactNode } from 'react'

/** Consistent max-width + horizontal padding wrapper used by every page. */
export function PageContainer({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div id={id} className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
