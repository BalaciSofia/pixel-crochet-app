# Pixel Pattern Studio

**[▶ Live demo](https://balacisofia.github.io/pixel-crochet-app/)**

A **Next.js + TypeScript** web app for designing and following **pixel-based crochet patterns**.

Design patterns square by square or turn an image into a pattern, keep track of the yarn you own, then switch to **work mode** to crochet it row by row.
Made for **crochet tapestry**, but it works just as well for **cross-stitch**, since both are grid-based.

## Features

### Patterns
* Create a blank pattern (1–200 stitches wide and tall)
* Turn an image into a pattern: pick the size and the number of colors, and optionally match it to your yarn
* Search, filter (new, in progress, finished) and sort your patterns on the home page
* Each pattern card shows a preview, its progress and how many colors you still need to buy

### Edit mode
* Draw, erase and fill tools, with undo and redo (Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z)
* Row and column rulers (rows are counted from the bottom, the way you crochet)
* Zoom buttons, pinch to zoom on touch screens, an optional grid and full screen
* Palette with yarn names, plus a custom color picker
* Resize the canvas (with a warning when stitches would be cut off)
* Autosave, with a "Saving… / Saved" indicator

### Work mode
* Tick rows off in order, from the row numbers beside the pattern or from the row list
* Finished rows are dimmed and the next row is outlined
* Progress bar, and a reset option
* Stitch count per color
* **Calculate yarn needed**: enter how many cm of yarn one stitch uses and get the metres per color (10% extra included). A help popup explains how to measure it.

### My yarn
* Keep a list of the yarn colors you own, with optional names
* New patterns start with your yarn colors (or an empty palette if you have none)
* **Need to buy**: any color in a pattern that isn't in your yarn is tagged with a cart badge, in the editor, in work mode and on the home cards. The tags update by themselves when you add or remove yarn.
* **Have it? Add**: add a tagged color to your yarn in one click
* **Try matching to my yarn**: suggests the closest yarn you own for each color you'd have to buy. You accept or reject each suggestion, and accepted ones recolor the pattern (you can undo this).

### Export
* Export a pattern as a PDF with the chart and the stitch count per color

## Your data

Everything is stored in your browser (IndexedDB). There is no account and no server, so your patterns and yarn stay on the device and browser you used. Clearing the site's data deletes them.

## Getting started

```bash
git clone https://github.com/BalaciSofia/pixel-crochet-app.git
cd pixel-crochet-app
npm install
npm run dev
```

Open: http://localhost:3000

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build a static export into `out/` |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript checker |

The production build is a static site served from `/pixel-crochet-app` (see `next.config.ts`), ready for GitHub Pages.

## Project structure

```
app/
  components/
    Gallery/   home page: welcome screen, pattern cards, yarn, new pattern and image import dialogs
    Editor/    editor: toolbar, edit and work canvases, sidebars, yarn matching
    shared/    buttons, dialogs, badges, icons and other shared pieces
  hooks/       canvas drawing, export, save status, yarn helpers
  store/       Zustand stores for patterns and yarn, saved to IndexedDB
  utils/       image to pattern, color math, flood fill, export helpers
  theme.ts     Material UI theme
  tokens.ts    design colors, shadows and fonts
```

## Tech stack

* Next.js 16 (static export)
* React 19
* TypeScript
* Material UI
* Zustand
* idb-keyval (IndexedDB storage)
* jsPDF
