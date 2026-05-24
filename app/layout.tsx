import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScriptGenie Telugu Gaming",
  description: "AI YouTube script generator for Telugu gaming creators"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
