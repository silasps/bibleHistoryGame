"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Button } from "@/components/ui/button"

/** Confirmação no visual do app, no lugar do confirm() do navegador. O foco começa em "Cancelar". */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-night/70 backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <AlertDialog.Popup className="glass fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-3 rounded-3xl border border-border p-6 outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <AlertDialog.Title className="font-display text-3xl leading-tight text-parchment">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-mist">{description}</AlertDialog.Description>
          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
            <AlertDialog.Close render={<Button variant="outline" size="lg" className="h-12 rounded-full px-6" />}>Cancelar</AlertDialog.Close>
            <Button
              variant="destructive"
              size="lg"
              className="h-12 rounded-full px-6"
              onClick={() => {
                onOpenChange(false)
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
