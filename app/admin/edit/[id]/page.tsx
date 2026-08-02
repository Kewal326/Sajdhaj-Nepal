'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
const db = supabase as any
import type { Category } from '@/types/database'

const CLOUD_NAME = 'qzxz6chw'
const UPLOAD_PRESET = 'prauhhjs'

type ExistingImage = { id: string; url: string; is_primary: boolean; sort_order: number }
type NewImage = { file: File; preview: string }

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Image upload failed')
  return (await res.json()).secure_url as string
}

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '',
    cost_price: '', cost_price_with_expenses: '', category_id: '',
    stock: '', badge: '', is_featured: false, is_active: true,
  })

  useEffect(() => {
    Promise.all([
      db.from('categories').select('*').order('sort_order'),
      db.from('products').select('*, product_images(*)').eq('id', id).single(),
    ]).then(([{ data: cats }, { data: product }]) => {
      setCategories((cats ?? []) as Category[])
      if (product) {
        const p = product as any
        setForm({
          name: p.name ?? '',
          description: p.description ?? '',
          price: p.price?.toString() ?? '',
          original_price: p.original_price?.toString() ?? '',
          cost_price: p.cost_price?.toString() ?? '',
          cost_price_with_expenses: p.cost_price_with_expenses?.toString() ?? '',
          category_id: p.category_id ?? '',
          stock: p.stock?.toString() ?? '',
          badge: p.badge ?? '',
          is_featured: p.is_featured ?? false,
          is_active: p.is_active ?? true,
        })
        const imgs = (p.product_images ?? []) as ExistingImage[]
        setExistingImages(imgs.sort((a, b) => a.sort_order - b.sort_order))
      }
      setLoading(false)
    })
  }, [id])

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function removeExisting(imgId: string) {
    setRemovedImageIds(prev => [...prev, imgId])
    setExistingImages(prev => prev.filter(i => i.id !== imgId))
  }

  function pickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewImages(prev => [...prev, ...files.map(file => ({ file, preview: URL.createObjectURL(file) }))])
    e.target.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.price) { setError('Price is required'); return }
    if (existingImages.length === 0 && newImages.length === 0) { setError('At least one image required'); return }
    setError(''); setSaving(true); setSuccess('')

    try {
      // Update product fields
      const { error: updateErr } = await db.from('products').update({
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        cost_price_with_expenses: form.cost_price_with_expenses ? parseFloat(form.cost_price_with_expenses) : null,
        category_id: form.category_id || null,
        stock: parseInt(form.stock) || 0,
        badge: form.badge.trim() || null,
        is_featured: form.is_featured,
        is_active: form.is_active,
      }).eq('id', id)
      if (updateErr) throw new Error(updateErr.message)

      // Delete removed images
      if (removedImageIds.length > 0) {
        const { error: delErr } = await db.from('product_images').delete().in('id', removedImageIds)
        if (delErr) throw new Error(delErr.message)
      }

      // Upload and insert new images
      if (newImages.length > 0) {
        const urls = await Promise.all(newImages.map(img => uploadToCloudinary(img.file)))
        const nextOrder = existingImages.length
        const { error: imgErr } = await db.from('product_images').insert(
          urls.map((url, i) => ({
            product_id: id,
            url,
            is_primary: existingImages.length === 0 && i === 0,
            sort_order: nextOrder + i,
          }))
        )
        if (imgErr) throw new Error(imgErr.message)
      }

      setSuccess('Saved!')
      setRemovedImageIds([])
      setNewImages([])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900">Edit product</h1>
      </header>

      <form onSubmit={handleSave} className="p-4 space-y-4 pb-10">
        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Photos</p>
          <div className="flex gap-2 flex-wrap">
            {/* Existing images */}
            {existingImages.map((img, i) => (
              <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                {img.is_primary && <span className="absolute bottom-0 left-0 right-0 bg-brand-700/80 text-white text-[9px] text-center py-0.5">Main</span>}
                <button type="button" onClick={() => removeExisting(img.id)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">×</button>
              </div>
            ))}
            {/* New images queued for upload */}
            {newImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-dashed border-brand-400">
                <Image src={img.preview} alt="" fill className="object-cover" unoptimized />
                <span className="absolute bottom-0 left-0 right-0 bg-brand-400/80 text-white text-[9px] text-center py-0.5">New</span>
                <button type="button" onClick={() => setNewImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400">
              <span className="text-2xl leading-none">+</span>
              <span className="text-[10px]">Add photo</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <input placeholder="Product name *" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
          <textarea placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputClass + ' resize-none'} />
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputClass + ' text-gray-600'}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Pricing</p>
          <div className="flex gap-2">
            <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span><input type="number" placeholder="Selling price *" value={form.price} onChange={e => set('price', e.target.value)} className={inputClass + ' pl-12'} /></div>
            <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span><input type="number" placeholder="Original" value={form.original_price} onChange={e => set('original_price', e.target.value)} className={inputClass + ' pl-12'} /></div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span><input type="number" placeholder="Cost price" value={form.cost_price} onChange={e => set('cost_price', e.target.value)} className={inputClass + ' pl-12'} /></div>
            <div className="flex-1 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span><input type="number" placeholder="Cost + expenses" value={form.cost_price_with_expenses} onChange={e => set('cost_price_with_expenses', e.target.value)} className={inputClass + ' pl-12'} /></div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Details</p>
          <div className="flex gap-2">
            <input type="number" placeholder="Qty in stock" value={form.stock} onChange={e => set('stock', e.target.value)} className={inputClass + ' flex-1'} />
            <select value={form.badge} onChange={e => set('badge', e.target.value)} className={inputClass + ' flex-1 text-gray-600'}>
              <option value="">No badge</option>
              <option value="New">New</option>
              <option value="Bestseller">Bestseller</option>
              <option value="Sale">Sale</option>
              <option value="Limited">Limited</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="hidden" />
            <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_featured ? 'bg-brand-700' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">Show on homepage (Featured)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="hidden" />
            <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_active ? 'bg-green-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">Visible to customers</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl p-3">{error}</p>}
        {success && <p className="text-sm text-green-700 text-center bg-green-50 rounded-xl p-3">{success}</p>}

        <button type="submit" disabled={saving} className="w-full bg-brand-700 text-white text-sm font-semibold py-4 rounded-2xl disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
