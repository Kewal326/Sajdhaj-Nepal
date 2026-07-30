// Home page skeleton — shown instantly while server fetches categories + products
export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="h-5 w-32 bg-gray-200 rounded-full" />
        <div className="h-6 w-6 bg-gray-200 rounded" />
      </div>

      {/* Hero banner */}
      <div className="mx-4 mt-4 rounded-2xl bg-gray-200 min-h-36" />

      {/* Trust chips */}
      <div className="flex gap-2 px-4 mt-3">
        {[80, 64, 72, 68].map(w => (
          <div key={w} className="h-7 rounded-full bg-gray-100" style={{ width: w }} />
        ))}
      </div>

      {/* Categories */}
      <div className="mt-5 px-4">
        <div className="h-4 w-24 bg-gray-200 rounded-full mb-3" />
        <div className="flex gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-gray-200" />
              <div className="h-2.5 w-12 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Featured grid */}
      <div className="mt-5 px-4">
        <div className="h-4 w-20 bg-gray-200 rounded-full mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-200" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                <div className="h-3 bg-gray-200 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
