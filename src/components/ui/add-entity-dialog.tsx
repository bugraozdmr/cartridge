"use client"

import type React from 'react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SelectCustom } from '@/components/ui/select-custom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, useDialogContext } from '@/components/ui/dialog'
import { ImagePlusIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

type AddEntityDialogProps = {
  title: string
  description: string
  triggerLabel?: React.ReactNode
  triggerIcon?: React.ReactNode
  triggerClassName?: string
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  contentClassName?: string
  action: (formData: FormData) => Promise<void>
  defaultValues?: any
  fields: Array<{
    name: string
    label: string
    placeholder?: string
    type?: string
    options?: Array<{ value: string; label: string }>
    value?: string
    step?: string
    required?: boolean
    condition?: (values: Record<string, string>) => boolean
  }>
}

function AddEntityDialogInner({ title, description, triggerLabel, triggerIcon, triggerClassName, triggerVariant, contentClassName, action, defaultValues, fields }: AddEntityDialogProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const { open, setOpen } = useDialogContext()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageName, setImageName] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(defaultValues?.imageUrl || null)
  const [removeImage, setRemoveImage] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectValues, setSelectValues] = useState<Record<string, string>>({})

  // Reset state when dialog opens with new default values
  useEffect(() => {
    if (open) {
      setImagePreviewUrl(defaultValues?.imageUrl || null)
      setImageName(null)
      setSelectedFile(null)
      setRemoveImage(false)
      setSelectValues(() => {
        const nextValues: Record<string, string> = {}
        for (const field of fields) {
          nextValues[field.name] = (defaultValues?.[field.name] ?? field.value ?? '').toString()
        }
        return nextValues
      })
    }
  }, [open, defaultValues, fields])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current) return

    const formData = new FormData()

    // Add all text fields from the form
    const formElements = formRef.current.elements
    for (const field of fields) {
      if (field.type === 'image') continue
      const el = formElements.namedItem(field.name) as HTMLInputElement | null
      if (el) formData.append(field.name, el.value)
    }

    // Add image from state (NOT from ref — the input unmounts when preview shows)
    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    if (removeImage) formData.append('removeImage', 'true')
    if (defaultValues?.id) formData.append('id', defaultValues.id)

    setIsPending(true)
    try {
      await action(formData)
      toast.success('Başarıyla kaydedildi!')
      if (!defaultValues) formRef.current?.reset()
      setImageName(null)
      setSelectedFile(null)
      setOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Kaydedilirken bir hata oluştu.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <DialogTrigger asChild>
        {triggerIcon && !triggerLabel ? (
          <button
            type="button"
            className={triggerClassName}
            title={title}
          >
            {triggerIcon}
          </button>
        ) : (
          <Button 
            variant={triggerVariant}
            className={triggerClassName || "rounded-2xl px-4 py-2 shadow-lg shadow-primary/20"}
          >
            {triggerIcon}
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <fieldset disabled={isPending} className="space-y-4 group">
            {fields.filter(f => !f.condition || f.condition(selectValues)).map((field) => (
              <label key={field.name} className="block space-y-2 relative">
                {field.type !== 'hidden' && (
                  <span className="text-sm font-medium text-foreground/90">{field.label}</span>
                )}
                {field.type === 'image' ? (
                  <div className="flex flex-col gap-2 w-full">
                      {imagePreviewUrl ? (
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-border group/image">
                          <Image src={imagePreviewUrl} alt="Preview" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setImagePreviewUrl(null)
                              setImageName(null)
                              setSelectedFile(null)
                              setRemoveImage(true)
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-rose-500"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer bg-muted/40 border-border hover:bg-muted/60 transition overflow-hidden group-disabled:opacity-50 group-disabled:cursor-not-allowed">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImagePlusIcon className="w-8 h-8 mb-3 text-muted-foreground" />
                                {imageName ? (
                                  <p className="text-sm font-medium text-primary">{imageName}</p>
                                ) : (
                                  <>
                                    <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Resim seçmek için tıklayın</span></p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG veya WEBP</p>
                                  </>
                                )}
                            </div>
                            <input 
                              name={field.name} 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              required={field.required && !defaultValues?.imageUrl && !removeImage}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0]
                                  setSelectedFile(file)
                                  setImageName(file.name)
                                  setImagePreviewUrl(URL.createObjectURL(file))
                                  setRemoveImage(false)
                                } else {
                                  setSelectedFile(null)
                                  setImageName(null)
                                  setImagePreviewUrl(null)
                                }
                              }}
                            />
                        </label>
                      )}
                  </div>
                ) : field.type === 'select' ? (
                  <SelectCustom
                    name={field.name}
                    options={field.options || []}
                    value={selectValues[field.name] || ''}
                    onChange={(value) => setSelectValues(prev => ({ ...prev, [field.name]: value }))}
                    placeholder={field.placeholder || 'Seçiniz...'}
                    required={field.required ?? true}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required ?? false}
                    value={selectValues[field.name] || ''}
                    onChange={(e) => setSelectValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full min-h-[80px] rounded-2xl border border-border bg-muted/40 px-4 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ) : field.type === 'hidden' ? (
                  <input type="hidden" name={field.name} defaultValue={field.value ?? defaultValues?.[field.name]} />
                ) : (
                  <input
                    name={field.name}
                    type={field.type ?? 'text'}
                    step={field.step}
                    placeholder={field.placeholder}
                    required={field.required ?? true}
                    value={selectValues[field.name] || ''}
                    onChange={(e) => setSelectValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="h-11 w-full rounded-2xl border border-border bg-muted/40 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </label>
            ))}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-2xl bg-primary px-5 text-primary-foreground hover:bg-primary/90 disabled:opacity-70 flex items-center gap-2"
              >
                {isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </>
  )
}

export function AddEntityDialog(props: AddEntityDialogProps) {
  return (
    <Dialog>
      <AddEntityDialogInner {...props} />
    </Dialog>
  )
}
