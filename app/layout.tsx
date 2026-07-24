import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blankless | Autonomous Appointment Recovery",
  description: "No blank slots. No wasted capacity."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
