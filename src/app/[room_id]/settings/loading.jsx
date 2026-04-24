export default function SettingsLoading() {
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-40 mx-auto mb-8" />
      <div className="max-w-[800px] mx-auto flex flex-col gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="h-5 bg-gray-200 rounded w-36 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="rounded-lg border border-red-200 p-5">
          <div className="h-5 bg-gray-200 rounded w-28 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-9 bg-gray-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}
