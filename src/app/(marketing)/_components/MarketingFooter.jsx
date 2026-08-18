import Image from 'next/image';

export default function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" width={28} height={28} alt="RoomGrub" />
          <span className="font-bold text-neutral-900">RoomGrub</span>
        </div>
        <p className="text-sm text-neutral-500">© 2026 RoomGrub. Split bills, not friendship.</p>
      </div>
    </footer>
  );
}
