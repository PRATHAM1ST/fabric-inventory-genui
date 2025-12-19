import type { Metadata } from "next";
import type { ReactNode } from "react";
import * as React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fabric Inventory | GenUI",
  description: "AI-powered fabric inventory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="h-screen">{children}</main>
      </body>
    </html>
  );
}
