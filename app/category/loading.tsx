export default function CategoryListLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <div className="h-4 w-28 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div className="h-2.5 w-14 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
