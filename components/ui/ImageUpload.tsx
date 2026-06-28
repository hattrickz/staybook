'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  folder?: string
}

export function ImageUpload({ value = [], onChange, maxImages = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (value.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res  = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (data.url) {
          uploaded.push(data.url)
        } else {
          toast.error(`Failed to upload ${file.name}`)
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    onChange([...value, ...uploaded])
    setUploading(false)

    if (uploaded.length > 0) {
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded!`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {/* Upload area */}
      {value.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-colors',
            'hover:border-brand hover:bg-brand-50',
            uploading && 'opacity-60 cursor-not-allowed'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="text-brand animate-spin" />
              <p className="text-sm text-ink-secondary">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                <Upload size={20} className="text-brand" />
              </div>
              <p className="text-sm font-medium text-ink-primary">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-ink-tertiary">
                PNG, JPG, WEBP up to 10MB · Max {maxImages} images
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative group rounded-xl overflow-hidden aspect-video bg-surface-tertiary">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-2 left-2 bg-brand text-white text-xs px-2 py-0.5 rounded-md font-medium">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {value.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-brand hover:bg-brand-50 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <ImageIcon size={20} className="text-ink-tertiary" />
              <span className="text-xs text-ink-tertiary">Add more</span>
            </button>
          )}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-ink-tertiary">
          {value.length}/{maxImages} images · First image is the cover photo
        </p>
      )}
    </div>
  )
}
