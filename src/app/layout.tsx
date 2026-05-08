import type { ReactNode } from "react";

import "@/app/globals.css";
import { ClientThemeProvider } from "@/components/providers/theme-provider";
import ToasterRoot from '@/components/ui/toaster'

export const metadata = {
  title: {
    default: "Bilgi İşlem",
    template: "%s | Bilgi İşlem",
  },
  description: "Yazıcı ve kartuş yönetimi için modern admin paneli.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClientThemeProvider>
          <ToasterRoot />
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}