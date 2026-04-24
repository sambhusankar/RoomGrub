export default function SplitsLoading() {
  return (
    <div className="p-4 md:p-8 bg-[#faf5ff] min-h-screen animate-pulse">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
      <div className="rounded-xl bg-white border border-gray-100 p-5 mb-6">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="flex flex-col gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded-lg w-32" />
    </div>
  );
}
