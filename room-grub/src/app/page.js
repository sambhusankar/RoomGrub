import Image from "next/image";

export default function Home() {
  return (
    <div className="w-screen flex justify-center items-start pt-10"> {/* Center horizontally, add padding from top */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={300}
        height={150}
        className="w-3/6"
      />
    </div>
  );
}
