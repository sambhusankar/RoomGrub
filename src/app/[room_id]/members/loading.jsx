export default function MembersLoading() {
  return (
    <div className="p-4 sm:p-8 bg-[#faf5ff] min-h-screen animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-40 mx-auto sm:mx-0 mb-6" />
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full sm:w-60 bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-12" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded-lg w-full sm:w-32" />
    </div>
  );
}
