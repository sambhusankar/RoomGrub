export default function ExpensesLoading() {
  return (
    <div className="animate-pulse">
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <div className="h-8 bg-gray-200 rounded-full w-24" />
        <div className="h-8 bg-gray-200 rounded-full w-24" />
      </div>
      <div className="divide-y divide-gray-100">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-gray-200" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-200 rounded w-14" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
