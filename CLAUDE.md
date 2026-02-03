# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start Vite dev server at http://localhost:5173
npm run build    # TypeScript check + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

No test framework is currently configured.

**Always run tests before committing.**

## Project Overview

RSK Digital Site Diary is a Progressive Web App (PWA) for iPad designed for shift logging on drilling rigs. Target users work in extreme conditions (thick gloves, bright sunlight, rain, dust).

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite, Supabase (PostgreSQL)

## The Prime Directives (Immutable Constraints)

Every UI change must adhere to these three rules:

### Rule #1: Anti-Typing Axiom
The on-screen keyboard must **NEVER** appear during standard data entry.
- Numbers → Use Stepper components with +/- buttons
- Selections → Use SelectableCard components, toggle switches, or oversized radio buttons

### Rule #2: Glove-First Scale
Users wear thick impact gloves.
- **Minimum tap target: 80×80 pixels** for ANY interactive element
- Standard button height: `h-24` (96px) or `h-20` (80px)
- Use `p-6`, `p-8`, `gap-6`, `gap-8` spacing between elements

### Rule #3: High-Contrast Safety Aesthetic
- Dark backgrounds: `bg-slate-900` (main), `bg-slate-800` (cards)
- Primary action: `bg-yellow-500 text-black font-black`
- Success/Drilling: `bg-green-600 text-white`
- Danger/Standby: `bg-red-600 text-white`
- Text: `text-white font-bold` (primary), `text-slate-300` (secondary)

## Architecture

**Navigation:** Strict linear one-way flow. No hamburger menus or nested navigation.
```
Splash → Safety Check → Main Log → End Shift
```

**Directory Structure:**
- `src/views/` - Full-page view components (SplashView, SafetyCheckView, MainLogView)
- `src/components/` - Reusable UI components (SelectableCard, Stepper)
- `src/lib/supabase.ts` - Supabase client initialization
- `src/types/database.ts` - TypeScript interfaces matching Supabase schema

**Key Documentation Files:**
- `@00_MASTER_INSTRUCTIONS.md` - Design constraints, Prime Directives
- `@01_DESIGN_SYSTEM.md` - Color palette, component sizing rules
- `@02_DATABASE_SCHEMA.md` - Supabase schema definitions
- `@03_FUNCTIONAL_SPECS.md` - View-by-view UI specifications

## Environment Setup

```bash
cp .env.example .env  # Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```
