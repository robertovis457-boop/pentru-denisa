import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pentru Denisa",
  description: "Un site romantic creat de Roberto pentru Denisa."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
