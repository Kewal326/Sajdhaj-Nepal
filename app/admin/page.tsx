'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
const db = supabase as any
import type { Category } from '@/types/database'

const CLOUD_NAME = 'qzxz6chw'
const UPLOAD_PRESET = 'prauhhjs'

type ImageFile = { file: File; preview: string }
type Product = { id: string; name: string; price: number; is_active: boolean; product_images: { url: string; is_primary: boolean }[] }

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Image upload failed')
  return (await res.json()).secure_url as string
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'add' | 'products' | 'categories'>('add')

  // ── Add product state ──
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '',
    cost_price: '', cost_price_with_expenses: '', category_id: '',
    stock: '', badge: '', is_featured: false,
  })

  // ── Products list state ──
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // ── Categories list state ──
  const [catList, setCatList] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(false)

  useEffect(() => {
    db.from('categories').select('*').order('sort_order')
      .then(({ data }: { data: any }) => setCategories((data ?? []) as Category[]))
  }, [])

  useEffect(() => {
    if (tab === 'products') {
      setLoadingProducts(true)
      db.from('products')
        .select('id, name, price, is_active, product_images(url, is_primary)')
        .order('created_at', { ascending: false })
        .then(({ data }: { data: any }) => { setProducts((data ?? []) as Product[]); setLoadingProducts(false) })
    }
    if (tab === 'categories') {
      setLoadingCats(true)
      db.from('categories').select('*').order('sort_order')
        .then(({ data }: { data: any }) => { setCatList((data ?? []) as Category[]); setLoadingCats(false) })
    }
  }, [tab])

  // ── Category reorder ──
  async function moveCat(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= catList.length) return
    const next = [...catList]
    ;[next[index], next[target]] = [next[target], next[index]]
    setCatList(next)
    await Promise.all(next.map((c, i) => db.from('categories').update({ sort_order: i } as any).eq('id', c.id)))
  }

  // ── Category delete ──
  async function deleteCat(cat: Category) {
    if (!window.confirm(`Delete "${cat.name}"? Products in this category will lose their category. This cannot be undone.`)) return
    const { error } = await db.from('categories').delete().eq('id', cat.id)
    if (error) { alert(error.message); return }
    setCatList(prev => prev.filter(c => c.id !== cat.id))
    setCategories(prev => prev.filter(c => c.id !== cat.id))
  }

  // ── Product delete ──
  async function deleteProduct(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    await db.from('product_images').delete().eq('product_id', p.id)
    const { error } = await db.from('products').delete().eq('id', p.id)
    if (error) { alert(error.message); return }
    setProducts(prev => prev.filter(x => x.id !== p.id))
  }

  // ── Add product form ──
  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.price) { setError('Price is required'); return }
    if (images.length === 0) { setError('Add at least one image'); return }
    setError(''); setLoading(true); setSuccess('')
    try {
      const urls = await Promise.all(images.map(img => uploadToCloudinary(img.file)))
      const { data: product, error: productErr } = await db.from('products').insert({
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
      }).select('id').single()
      if (productErr) throw new Error(productErr.message)
      const { error: imgErr } = await db.from('product_images').insert(
        urls.map((url, i) => ({ product_id: (product as any).id, url, is_primary: i === 0, sort_order: i }))
      )
      if (imgErr) throw new Error(imgErr.message)
      setSuccess(`"${form.name}" added!`)
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
        <h1 className="text-base font-semibold text-gray-900">Admin</h1>
        <div className="flex gap-1 mt-2">
          {([['add', 'Add product'], ['products', 'Products'], ['categories', 'Categories']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── ADD PRODUCT TAB ── */}
      {tab === 'add' && (
        <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Photos <span className="text-gray-400 font-normal">(first = main)</span></p>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={img.preview} alt="" fill className="object-cover" unoptimized />
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-700/80 text-white text-[9px] text-center py-0.5">Main</span>}
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">×</button>
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400">
                <span className="text-2xl leading-none">+</span>
                <span className="text-[10px]">Add photo</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { setImages(prev => [...prev, ...Array.from(e.target.files ?? []).map(f => ({ file: f, preview: URL.createObjectURL(f) }))]); e.target.value = '' }} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <input placeholder="Product name *" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
            <textarea placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputClass + ' resize-none'} />
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={inputClass + ' text-gray-600'}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

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
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-50 rounded-xl p-3">{error}</p>}
          {success && <p className="text-sm text-green-700 text-center bg-green-50 rounded-xl p-3">{success}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand-700 text-white text-sm font-semibold py-4 rounded-2xl disabled:opacity-60">
            {loading ? 'Uploading & saving…' : 'Add product'}
          </button>
        </form>
      )}

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <div className="p-4 space-y-3 pb-10">
          {loadingProducts ? (
            <div className="flex justify-center pt-12"><div className="w-5 h-5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400 text-sm pt-12">No products yet.</p>
          ) : products.map(p => {
            const thumb = p.product_images?.find(i => i.is_primary)?.url ?? p.product_images?.[0]?.url
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {thumb && <Image src={thumb} alt={p.name} fill className="object-cover" sizes="56px" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-brand-700 mt-0.5">NPR {p.price.toLocaleString()}</p>
                  {!p.is_active && <span className="text-[10px] text-red-500">Hidden</span>}
                </div>
                <button onClick={() => router.push(`/admin/edit/${p.id}`)} className="flex-shrink-0 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-2 rounded-xl">Edit</button>
                <button onClick={() => deleteProduct(p)} className="flex-shrink-0 bg-red-50 text-red-500 text-xs font-medium px-3 py-2 rounded-xl">Delete</button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {tab === 'categories' && (
        <div className="p-4 space-y-3 pb-10">
          <button onClick={() => router.push('/admin/edit-category/new')} className="w-full bg-brand-700 text-white text-sm font-semibold py-3 rounded-2xl">
            + Add category
          </button>
          {loadingCats ? (
            <div className="flex justify-center pt-8"><div className="w-5 h-5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>
          ) : catList.map((cat, i) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => moveCat(i, -1)} disabled={i === 0} className="w-6 h-5 flex items-center justify-center text-gray-400 disabled:opacity-20 text-xs">▲</button>
                <button onClick={() => moveCat(i, 1)} disabled={i === catList.length - 1} className="w-6 h-5 flex items-center justify-center text-gray-400 disabled:opacity-20 text-xs">▼</button>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-50 overflow-hidden relative flex-shrink-0">
                {cat.image_url && <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="40px" />}
              </div>
              <p className="flex-1 text-sm font-medium text-gray-900 truncate">{cat.name}</p>
              <button onClick={() => router.push(`/admin/edit-category/${cat.id}`)} className="flex-shrink-0 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-2 rounded-xl">Edit</button>
              <button onClick={() => deleteCat(cat)} className="flex-shrink-0 bg-red-50 text-red-500 text-xs font-medium px-3 py-2 rounded-xl">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
