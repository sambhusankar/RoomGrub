import "./globals.css";
import NavBarContainer from '@/component/NavBarContainer';
import localFont from 'next/font/local';

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export const metadata = {
  title: "Room Grub",
  description: "Split bills not friendship",
  icons: {
    icon: '/logo.png'
  },
  generator: "Next.js",
  keywords: "Room Grub, bill splitting, expense sharing, group expenses, financial management",
  authors: [{ name: "Sankar", url: "https://sankar.com" }],
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.png" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: "linear-gradient(135deg, #f0f0f0 0%, #e0e7ff 100%)",
          height: "100vh"
        }}
      >
        <NavBarContainer>{children}</NavBarContainer>
      </body>
    </html>
  );
}
