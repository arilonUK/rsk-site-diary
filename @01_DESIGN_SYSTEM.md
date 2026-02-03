# DESIGN SYSTEM: The "Industrial Vibe"

Apply these styles to meet the "High-Contrast Safety Gear" aesthetic constraint defined in the Master Instructions.

## 1. Color Palette (Tailwind Mappings)

### Backgrounds & Containers
* **Main App Background:** Dark Slate Grey.
    * Tailwind: `bg-slate-900` (`#0f172a`)
* **Card/Container Backgrounds:** Slightly lighter grey to separate content.
    * Tailwind: `bg-slate-800` (`#1e293b`)

### Typography
* **Primary Text (High readability):** Bold White.
    * Tailwind: `text-white font-bold`
* **Secondary Text/Labels:** Light Grey.
    * Tailwind: `text-slate-300 font-medium`
* **Headers/Banners:** Massive, uppercase text.
    * Tailwind: `text-2xl` or `text-3xl`, `uppercase`, `tracking-wide`

### Interactive States (Buttons & Toggles)

* **Primary Action / Active State (e.g., Next Step, Selected Card):**
    * Vibe: Safety Yellow/Gold with bold Black text for maximum contrast.
    * Tailwind: `bg-yellow-500 hover:bg-yellow-400 text-black font-black`

* **Success / "Drilling" State:**
    * Vibe: Vivid Green.
    * Tailwind: `bg-green-600 text-white`

* **Danger / Stop / "Standby" State:**
    * Vibe: Vivid Red/Orange.
    * Tailwind: `bg-red-600 text-white`

* **Disabled State:**
    * Vibe: Muted grey, clearly unclickable.
    * Tailwind: `bg-slate-700 text-slate-500 cursor-not-allowed opacity-50`

## 2. Component Sizing Rules

* **Standard Button Height:** `h-24` (96px) or `h-20` (80px) minimum.
* **Full Width:** Most inputs and buttons should be `w-full`.
* **Stepper Buttons (+/-):** Must be massive squares, minimum `w-24 h-24`.
* **Padding/Gap:** Use `p-6`, `p-8`, `gap-6`, `gap-8` liberally to separate touch targets.
