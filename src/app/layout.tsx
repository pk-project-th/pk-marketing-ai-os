"use client";

import React, { useState } from "react";
import "./globals.css";
import { BrandProvider } from "@/context/BrandContext";
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
        <title>PK OS · Marketing AI</title>
        <meta name="description" content="AI Marketing Operating System for Multi-Brand Automotive Strategy and Content Creation" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon-32x32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F1014" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PK OS" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F7F8FA] text-[#17181A] min-h-screen antialiased flex selection:bg-[#C9A96E]/20 selection:text-[#17181A]">
        <BrandProvider>
          {/* Workspace Sidebar */}
          <WorkspaceSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
            <WorkspaceHeader onOpenMobile={() => setMobileOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <WorkspaceBottomNav />
        </BrandProvider>
      </body>
    </html>
  );
}
