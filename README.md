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

## Built-in catalogs

The app ships with the validated Standard recursive catalog (28 masters, 112 selectable subcategories, 560 presets) and the revised Explicit catalog with participant-count separation and LoRA-friendly subject prose. All newly introduced selectable categories start disabled.

## Send a prompt to ComfyUI

1. In ComfyUI, enable developer mode and export the workflow in **API format**.
2. Open **ComfyUI Connection** in the desktop app.
3. Keep the default server URL (`http://127.0.0.1:8188`) unless ComfyUI uses another address.
4. Enter the node ID and input name for the destination text input (usually `text`).
5. Load the API workflow, test the connection, and select **Queue in ComfyUI**.

The bridge copies the workflow in memory, replaces only the configured prompt input, and submits it through ComfyUI's `/prompt` endpoint. The saved workflow file is never modified.
