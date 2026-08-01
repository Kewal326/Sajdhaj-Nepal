'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

const CLOUD_NAME = 'qzxz6chw'
const UPLOAD_PRESET = 'prauhhjs'

type ImageFile = { file: File; preview: string }

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return data.secure_url as string
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    cost_price: '',
    cost_price_with_expenses: '',
    category_id: '',
    stock: '',
    badge: '',
    is_featured: false,
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => setCategories((data ?? []) as Category[]))
  }, [])

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function pickImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newImages: ImageFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...newImages])
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.price) { setError('Price is required'); return }
    if (images.length === 0) { setError('Add at least one image'); return }

    setError('')
    setLoading(true)
    setSuccess('')

    try {
      // 1. Upload all images to Cloudinary
      const urls = await Promise.all(images.map(img => uploadToCloudinary(img.file)))

      // 2. Insert product
      const { data: product, error: productErr } = await supabase.from('products').insert({
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
        is_active: true,
      } as any).select('id').single()

      if (productErr) throw new Error(productErr.message)

      // 3. Insert image records
      const { error: imgErr } = await supabase.from('product_images').insert(
        urls.map((url, i) => ({
          product_id: (product as any).id,
          url,
          is_primary: i === 0,
          sort_order: i,
        })) as any
      )
      if (imgErr) throw new Error(imgErr.message)

      setSuccess(`"${form.name}" added successfully!`)
      setForm({ name: '', description: '', price: '', original_price: '', cost_price: '', cost_price_with_expenses: '', category_id: '', stock: '', badge: '', is_featured: false })
      setImages([])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400 bg-white'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Add product</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-10">

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Photos <span className="text-gray-400 font-normal">(first = main photo)</span></p>
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <Image src={img.preview} alt="" fill className="object-cover" unoptimized />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-700/80 text-white text-[9px] text-center py-0.5">Main</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px] leading-none"
                >×</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-[10px]">Add photo</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <input
            placeholder="Product name *"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            className={inputClass + ' resize-none'}
          />
          <select
            value={form.category_id}
            onChange={e => set('category_id', e.target.value)}
            className={inputClass + ' text-gray-600'}
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Pricing</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span>
              <input
                type="number"
                placeholder="Selling price *"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                className={inputClass + ' pl-12'}
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span>
              <input
                type="number"
                placeholder="Original (optional)"
                value={form.original_price}
                onChange={e => set('original_price', e.target.value)}
                className={inputClass + ' pl-12'}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span>
              <input
                type="number"
                placeholder="Cost price"
                value={form.cost_price}
                onChange={e => set('cost_price', e.target.value)}
                className={inputClass + ' pl-12'}
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">NPR</span>
              <input
                type="number"
                placeholder="Cost + expenses"
                value={form.cost_price_with_expenses}
                onChange={e => set('cost_price_with_expenses', e.target.value)}
                className={inputClass + ' pl-12'}
              />
            </div>
          </div>
        </div>

        {/* Extra */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Details</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Qty in stock"
                value={form.stock}
                onChange={e => set('stock', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <select
                value={form.badge}
                onChange={e => set('badge', e.target.value)}
                className={inputClass + ' text-gray-600'}
              >
                <option value="">No badge</option>
                <option value="New">New</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Sale">Sale</option>
                <option value="Limited">Limited</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={e => set('is_featured', e.target.checked)}
              className="hidden"
            />
            <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_featured ? 'bg-brand-700' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">Show on homepage (Featured)</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl p-3">{error}</p>}
        {success && <p className="text-sm text-green-700 text-center bg-green-50 rounded-xl p-3">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-700 text-white text-sm font-semibold py-4 rounded-2xl disabled:opacity-60"
        >
          {loading ? 'Uploading & saving…' : 'Add product'}
        </button>
      </form>
    </div>
  )
}
