import "./globals.css";
import NavBarContainer from '@/component/NavBarContainer';
import localFont from 'next/font/local';

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export const metadata = {
  title: "Room Grub",
  description: "ERP software for bachalor rooms",
  icons:{
    icon: '/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#f0f0f0" }}
      >
        <NavBarContainer>{children}</NavBarContainer>
      </body>
    </html>
  )
}
