# Prompt Randomizer Desktop

A standalone Electron prompt manager for Standard and adult-only Explicit Krea 2 prompt generation.

## Current milestone

- One shared interface and one static stylesheet for both generator modes
- Live Standard/Explicit switch with independent persistent state
- Deterministic seed-based prompt composition
- Character LoRA mode in both generators
- Category and option controls
- Native JSON import/export
- Existing category enable/behavior settings preserved during import
- New imported categories disabled by default
- Windows NSIS packaging configuration

## Run locally

Install Node.js 20 or newer, then:

```bash
npm install
npm start
```

Run the prompt-engine tests:

```bash
npm test
```

Build the Windows installer on Windows:

```bash
npm run pack:win
```

## Architecture

Electron handles the desktop window, file dialogs, clipboard, and persistence. The prompt compositor is a plain JavaScript module with no Electron dependency, so it can be tested independently and later connected to ComfyUI through a small bridge.

The Standard and Explicit views render through the same HTML and CSS. Switching modes swaps generator data only; it does not inject styles or replace the layout.

## Explicit content boundary

The Explicit generator is intended only for fictional consenting adults. Its starter subject pools are separated by participant count and use LoRA-friendly wording that describes staging without redefining character identity.
