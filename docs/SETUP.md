# Installation & Setup Guide

## Prerequisites
- Node.js LTS (v20+ or v24+)
- npm or pnpm
- Git

## Step 1: Clone or Open the Repository
```bash
cd C:\Users\Marketing\.gemini\antigravity\scratch\pk-marketing-ai-os
```

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Optionally provide your `GEMINI_API_KEY`. If left empty, the application runs in local simulated engine mode.

## Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
