import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import AuthDebug from "./_debug/AuthDebug";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
import { getAuth, onAuthStateChanged } from "firebase/auth";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next-gen Flea Market MVP",
  description: "MVP slice: create, list, and view items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-50 text-neutral-900 antialiased overflow-x-hidden`}
      >
        <Providers>
          {children}
          <AuthDebug />
        </Providers>
      </body>
    </html>
  );
}
