import { ReactNode } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "OptiPlus Internal",
  description: "Internal management system for OptiPlus",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}