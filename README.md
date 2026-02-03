# RSK Digital Site Diary (Prototype v0.1)

A ruggedized iPad PWA for drilling rig shift logging in extreme environments.

## 🏗️ Design Philosophy

This app is built for workers wearing thick gloves in harsh conditions (bright sunlight, rain, dust). The UI follows three **immutable Prime Directives**:

1. **Anti-Typing Axiom**: No keyboard inputs - only steppers, cards, and toggles
2. **Glove-First Scale**: 80px minimum tap targets with generous spacing
3. **High-Contrast Safety Aesthetic**: Dark backgrounds, bold text, safety colors (yellow/green/red)

See [`@00_MASTER_INSTRUCTIONS.md`](./@00_MASTER_INSTRUCTIONS.md) for full design constraints.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend/database)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd rsk-site-diary
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   - Get `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your [Supabase project settings](https://app.supabase.com/project/_/settings/api)

3. **Set up the database**
   - Go to your Supabase project SQL Editor
   - Run the schema from [`@02_DATABASE_SCHEMA.md`](./@02_DATABASE_SCHEMA.md)
   - Insert the sample data (optional but recommended for testing)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173 in your browser (or iPad)

## 📁 Project Structure

```
rsk-site-diary/
├── src/
│   ├── views/           # Full-page components (Splash, SafetyCheck, MainLog)
│   ├── components/      # Reusable UI components
│   ├── lib/            # Supabase client and utilities
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   ├── App.tsx         # Main routing setup
│   └── index.css       # Global styles with Tailwind
├── @00_MASTER_INSTRUCTIONS.md  # Design rules and constraints
├── @01_DESIGN_SYSTEM.md        # Color palette and component specs
├── @02_DATABASE_SCHEMA.md      # Supabase database schema
└── README.md
```

## 🎨 Design System

The app uses Tailwind CSS with a custom industrial color palette:

- **Background**: `bg-slate-900` (dark slate)
- **Cards**: `bg-slate-800` (lighter slate)
- **Primary Action**: `bg-yellow-500` (safety yellow)
- **Success/Drilling**: `bg-green-600` (vivid green)
- **Danger/Standby**: `bg-red-600` (vivid red)
- **Disabled**: `bg-slate-700` (muted grey)

All interactive elements are **minimum 80px tall** with generous padding.

See [`@01_DESIGN_SYSTEM.md`](./@01_DESIGN_SYSTEM.md) for full specifications.

## 🗺️ User Flow

Linear, one-way navigation (no menus or back buttons):

1. **Splash Screen** → 2-second branding display
2. **Safety Check** → Mandatory safety checklist
3. **Main Activity Log** → Core shift logging (TODO)
4. **End Shift** → Submit and review (TODO)

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for utility-first styling
- **React Router** for navigation
- **Supabase** for PostgreSQL database and backend

## 📝 Database Schema

The app tracks:
- **Rigs** (drilling equipment)
- **Crew Members** (staff assignments)
- **Drill Bits** (asset lifecycle tracking for predictive maintenance)
- **Shifts** (daily work headers)
- **Activity Logs** (detailed timeline: DRILLING vs STANDBY)

See [`@02_DATABASE_SCHEMA.md`](./@02_DATABASE_SCHEMA.md) for complete schema and sample data.

## 🚧 Roadmap

### ✅ Completed
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS configuration
- [x] Splash View with branding and loading state
- [x] Safety Check View with toggle checklist
- [x] Basic routing structure
- [x] Supabase client setup
- [x] TypeScript type definitions

### 🔜 Coming Soon
- [ ] Main Activity Log interface
- [ ] Rig and crew selection (card-based)
- [ ] Activity timeline (DRILLING vs STANDBY)
- [ ] Depth stepper components
- [ ] Drill bit selection interface
- [ ] End Shift summary and submission
- [ ] PWA manifest for iPad installation
- [ ] Offline support

## 📱 Deployment

This app is designed as a Progressive Web App (PWA) for iPad.

**To deploy:**
1. Build the production version: `npm run build`
2. Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)
3. Users can "Add to Home Screen" on iPad for app-like experience

## 📄 License

Proprietary - RSK Digital Site Diary Prototype

## 🤝 Contributing

This is a prototype project. For questions or feedback, contact the development team.

---

**Built with ⚡ for extreme environments**
