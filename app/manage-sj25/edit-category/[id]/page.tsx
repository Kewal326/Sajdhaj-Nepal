'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
const db = supabase as any

const CLOUD_NAME = 'qzxz6chw'
const UPLOAD_PRESET = 'prauhhjs'

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Image upload failed')
  return (await res.json()).secure_url as string
}

function autoSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function EditCategoryPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<{ file: File; preview: string } | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) return
    db.from('categories').select('*').eq('id', id).single().then(({ data }: { data: any }) => {
      if (data) {
        const c = data as any
        setName(c.name ?? '')
        setExistingImageUrl(c.image_url ?? null)
      }
      setLoading(false)
    })
  }, [id, isNew])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setError(''); setSaving(true)
    try {
      let image_url = existingImageUrl
      if (imageFile) image_url = await uploadToCloudinary(imageFile.file)

      const payload = { name: name.trim(), slug: autoSlug(name), image_url, icon: null } as any

      if (isNew) {
        const { data: cats } = await db.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
        const nextOrder = ((cats?.[0] as any)?.sort_order ?? -1) + 1
        const { error: e } = await db.from('categories').insert({ ...payload, sort_order: nextOrder })
        if (e) throw new Error(e.message)
      } else {
        const { error: e } = await db.from('categories').update(payload).eq('id', id)
        if (e) throw new Error(e.message)
      }

      router.push('/manage-sj25')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${name}"? Products in this category will lose their category. This cannot be undone.`)) return
    const { error } = await db.from('categories').delete().eq('id', id)
    if (error) { alert(error.message); return }
    router.push('/manage-sj25')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">{isNew ? 'Add category' : 'Edit category'}</h1>
      </header>

      <form onSubmit={handleSave} className="p-4 space-y-4 pb-10">
        {/* Image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Category image</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-50 relative flex-shrink-0">
              {imageFile
                ? <Image src={imageFile.preview} alt="" fill className="object-cover" unoptimized />
                : existingImageUrl
                ? <Image src={existingImageUrl} alt="" fill className="object-cover" sizes="80px" />
                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📷</div>}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium">
                {imageFile || existingImageUrl ? 'Change image' : 'Upload image'}
              </button>
              {(imageFile || existingImageUrl) && (
                <button type="button" onClick={() => { setImageFile(null); setExistingImageUrl(null) }} className="text-xs text-red-400 text-left">Remove</button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0]
            if (file) setImageFile({ file, preview: URL.createObjectURL(file) })
            e.target.value = ''
          }} />
        </div>

        {/* Name */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <input
            placeholder="Category name *"
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
          />
          {name && (
            <p className="text-xs text-gray-400 mt-2 px-1">URL: /category/{autoSlug(name)}</p>
          )}
        </div>

        {error && <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl p-3">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-brand-700 text-white text-sm font-semibold py-4 rounded-2xl disabled:opacity-60">
          {saving ? 'Saving…' : isNew ? 'Add category' : 'Save changes'}
        </button>

        {!isNew && (
          <button type="button" onClick={handleDelete} className="w-full bg-red-50 text-red-500 text-sm font-semibold py-4 rounded-2xl">
            Delete category
          </button>
        )}
      </form>
    </div>
  )
}
