export default function ProductLoading() {
  return (
    <div className="animate-pulse">
      {/* Back button header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-4 w-20 bg-gray-200 rounded-full" />
      </div>

      {/* Main image */}
      <div className="aspect-square bg-gray-200 w-full" />

      {/* Thumbnail strip */}
      <div className="flex gap-2 px-4 mt-3">
        {[1,2,3].map(i => (
          <div key={i} className="w-16 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
        ))}
      </div>

      {/* Info */}
      <div className="px-4 mt-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-4 bg-gray-200 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 rounded-full w-full mt-4" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-4/6" />
        <div className="h-12 bg-gray-200 rounded-2xl mt-6" />
      </div>
    </div>
  )
}
