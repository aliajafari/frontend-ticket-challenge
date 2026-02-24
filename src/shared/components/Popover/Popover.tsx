import type { ReactNode } from 'react'
import styles from './Popover.module.css'

type Placement = 'top'

export interface PopoverProps {
  content: ReactNode
  children: ReactNode
  placement?: Placement
  popoverClassName?: string
  className?: string
}

export function Popover({
  content,
  children,
  placement = 'top',
  popoverClassName,
  className,
}: PopoverProps) {
  const triggerClassName = [styles.trigger, className].filter(Boolean).join(' ')
  const popoverClasses = [styles.popover, styles[placement], popoverClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={triggerClassName}>
      {children}
      <div className={popoverClasses}>
        {content}
      </div>
    </div>
  )
}

