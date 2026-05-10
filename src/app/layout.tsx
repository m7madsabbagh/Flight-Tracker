import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchFlight — Live Flight Tracker",
  description:
    "Real-time aircraft tracking powered by OpenSky Network and MapLibre GL JS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-aviation-bg text-aviation-text antialiased">{children}</body>
    </html>
  );
}
