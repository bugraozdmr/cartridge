"use client"

import * as React from 'react'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export function useDialogContext() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used inside <Dialog>')
  }

  return context
}

export function Dialog({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [isControlled, onOpenChange])

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export function DialogTrigger({ asChild, children, ...props }: TriggerProps & { children: React.ReactElement }) {
  const { setOpen } = useDialogContext()

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler }>
    const childOnClick = child.props.onClick

    return React.cloneElement(child, {
      ...props,
      onClick: (event) => {
        childOnClick?.(event)
        props.onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>)
        setOpen(true)
      },
    })
  }

  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        setOpen(true)
      }}
    >
      {children}
    </button>
  )
}

export function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useDialogContext()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    if (open) window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Kapat"
        className="fixed inset-0 z-50 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] outline-none',
          className,
        )}
      >
        {children}
        <button
          type="button"
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-2xl font-semibold tracking-tight text-foreground', className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export function DialogClose({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext()

  return (
    <button type="button" {...props} onClick={(event) => {
      props.onClick?.(event)
      setOpen(false)
    }}>
      {children}
    </button>
  )
}
