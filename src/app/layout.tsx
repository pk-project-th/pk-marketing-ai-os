"use client";

import React, { useState } from "react";
import "./globals.css";
import { BrandProvider } from "@/context/BrandContext";
import { HubProvider } from "@/context/HubContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { WorkspaceBottomNav } from "@/components/layout/WorkspaceBottomNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <html lang="th" className="light">
      <head>
        <title>PK CREATIVE HUB v3.0 · All-in-One AI Content OS & Studio Hub</title>
        <meta
          name="description"
          content="ศูนย์บัญชาการ AI คิดคอนเทนต์ เขียนสคริปต์ ทำคลิปขายของปักตะกร้า ทำหนังสั้น ทำ MV เพลง ซับอัตโนมัติ และโหลดคลิปครบจบในที่เดียว"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon-32x32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F1014" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PK HUB" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F8FA] dark:bg-[#090A0F] text-[#0F172A] dark:text-zinc-100 min-h-[100dvh] antialiased flex selection:bg-emerald-500/20 selection:text-emerald-950 transition-colors">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-emerald-600 focus:text-white focus:text-xs focus:font-bold"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <BrandProvider>
          <ToastProvider>
            <HubProvider>
              {/* Workspace Sidebar */}
              <WorkspaceSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
                <WorkspaceHeader onOpenMobile={() => setMobileOpen(true)} />
                <main
                  id="main-content"
                  className="flex-1 px-3.5 py-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-12"
                >
                  {children}
                </main>
              </div>

              {/* Mobile Bottom Navigation */}
              <WorkspaceBottomNav />
            </HubProvider>
          </ToastProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
