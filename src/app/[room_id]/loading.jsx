export default function HomeLoading() {
  return (
    <div className="px-4 py-2 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="rounded-xl border border-gray-100 bg-white p-4 mb-6">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-100 p-4 h-16" />
          <div className="rounded-xl bg-gray-100 p-4 h-16" />
        </div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
