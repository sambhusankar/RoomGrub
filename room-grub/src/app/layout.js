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
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA manifest and theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
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
