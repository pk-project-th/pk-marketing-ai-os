@echo off
chcp 65001 >nul
title PK CREATIVE HUB v3.0 — All-in-One AI Content OS & 6 Studios
echo ============================================================================
echo   PK CREATIVE HUB v3.0 — All-in-One AI Content OS ^& 6 Studios
echo   รวมทุกโปรเจกต์: หน้าหลัก OS + ขายของปักตะกร้า + หนังสั้น + MV + ซับอัตโนมัติ + โหลดคลิป + สกิลพิเศษ
echo ============================================================================
cd /d "%~dp0"
start "" "http://localhost:3000"
npm run dev
