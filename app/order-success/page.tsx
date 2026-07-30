import Link from 'next/link'

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80dvh] gap-4 px-8 text-center">
      <span className="text-6xl">🎉</span>
      <h1 className="text-xl font-semibold text-gray-900">Order placed!</h1>
      <p className="text-sm text-gray-500 leading-relaxed">
        Thank you for your order. We will contact you on WhatsApp to confirm delivery.
      </p>
      <Link
        href="/"
        className="mt-4 bg-brand-700 text-white text-sm font-medium px-8 py-3 rounded-2xl"
      >
        Continue shopping
      </Link>
    </div>
  )
}
