# DESIGN.md - TaskForge AI Design System (Professional Light Mode)

> **Design Philosophy:** Crisp Enterprise Minimal (Human-Crafted SaaS Aesthetic)  
> **Target Theme:** Clean white canvas, soft slate cards, subtle borders, and professional royal blue accents.

---

## 1. Color Palette (Light Mode Tokens)

### Base Surfaces
* **Canvas Background:** `#f8fafc` (Slate 50) — Soft, clean neutral background.
* **Card Surface:** `#ffffff` (Pure White) — High readability content cards.
* **Borders:** `#e2e8f0` (Slate 200) — Subtle 1px borders.
* **Shadows:** `box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05)` — Soft, natural depth.

### Typography & Text Colors
* **Primary Text:** `#0f172a` (Slate 900) — Sharp header and body contrast.
* **Secondary Text:** `#475569` (Slate 600) — Muted metadata and subtext.
* **Dim Text:** `#94a3b8` (Slate 400) — Subtle captions and hints.

### Accents & Indicators
* **Royal Blue:** `#2563eb` (Primary Action & Active State).
* **Emerald Green:** `#059669` (Active Status & Security Passed).
* **Purple Slate:** `#7c3aed` (Agent Thought Chain).
* **Amber Gold:** `#d97706` (Tool Catalog Badge).
* **Crimson Red:** `#dc2626` (Security Guardrail Alert).

---

## 2. Typography

* **Primary Font:** `'Inter', 'Plus Jakarta Sans', sans-serif`
* **Monospace Font:** `'JetBrains Mono', monospace`

---

## 3. Card & Button Standards

```css
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;
}

.card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.btn-primary:hover {
  background: #1d4ed8;
}
```
