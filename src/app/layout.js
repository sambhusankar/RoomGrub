import "./globals.css";
import localFont from 'next/font/local';
import BottomNav from '@/components/BottomNav';

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export const metadata = {
  title: {
    default: "RoomGrub — Split Expenses",
    template: "%s | RoomGrub",
  },
  description: "RoomGrub helps roommates and groups track shared expenses, split bills, and settle payments easily. No more awkward money conversations.",
  icons: {
    icon: '/logo.png'
  },
  generator: "Next.js",
  keywords: "RoomGrub, Room Grub, roomgrub, room grub, split bills, bill splitting, expense sharing, shared expenses, roommate expenses, group expenses, settle payments, financial management",
  authors: [{ name: "Sankar", url: "https://sankar.com" }],
  themeColor: "#9333ea",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "RoomGrub — Split Bills, Not Friendship",
    description: "RoomGrub helps roommates and groups track shared expenses, split bills, and settle payments easily.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "RoomGrub",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/icons/logo-512.png`,
        width: 512,
        height: 512,
        alt: "RoomGrub logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RoomGrub — Split Bills, Not Friendship",
    description: "RoomGrub helps roommates and groups track shared expenses, split bills, and settle payments easily.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/icons/logo-512.png`],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.png" />
        <meta name="theme-color" content="#9333ea" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
          minHeight: "100vh"
        }}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
