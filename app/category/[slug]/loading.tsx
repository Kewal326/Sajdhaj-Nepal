export default function CategoryProductsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-100 overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <div className="p-2.5 space-y-2">
              <div className="h-3 bg-gray-200 rounded-full w-3/4" />
              <div className="h-3 bg-gray-200 rounded-full w-1/2" />
              <div className="h-8 bg-gray-200 rounded-xl mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
