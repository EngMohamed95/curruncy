import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "شاشة أسعار العملات المباشرة",
  description: "شاشة عرض صرافة بالفيديو وأسعار العملات المتجددة تلقائيًا.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
