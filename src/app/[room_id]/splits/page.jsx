export default async function SplitsPage() {
    return (
        <div
            className="flex flex-col items-center justify-center text-center px-6 gap-3"
            style={{ minHeight: 'calc(100dvh - 120px)' }}
        >
            <p className="text-purple-500 text-xs font-semibold tracking-widest uppercase">Splits</p>
            <p className="text-2xl">🛠️</p>
            <p className="text-lg font-semibold text-gray-800">Under maintenance</p>
            <p className="text-sm text-gray-500 max-w-xs">
                Sorry, splits summary is temporarily unavailable while we fix an issue. Back soon!
            </p>
        </div>
    );
}
