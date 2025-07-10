# QuickChat

A minimal, frameless AI chat overlay that appears instantly with a global hotkey. Because sometimes you just need to ask ChatGPT something without opening a browser tab.

## Demo

![QuickChat Demo](demo.gif)

## The Idea

I was tired of constantly opening ChatGPT/Claude in the browser just to ask quick questions. I wanted something that pops up instantly with a hotkey, lets me ask something, get an answer, copy it, and disappear. So I built this.

## Features

- **Global hotkey** - Press Ctrl+Shift+Space from anywhere
- **Frameless window** - Clean, minimal interface with no distractions
- **Always on top** - Stays visible until you dismiss it
- **Auto-hide** - Disappears when you click outside or press Escape
- **Settings** - Configure your OpenAI API key, model, and system prompt

## Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/quickchat.git
   cd quickchat
   npm install
   ```

2. **Run it**
   ```bash
   # Development
   npm run electron-dev
   
   # Production build
   npm run build && npm run electron
   ```

3. **One time only - add your OpenAI API key**
   - Run the app and press `Ctrl`+`,` for settings
   - Paste your OpenAI API key
   - Optionally customize the model and system prompt

## Usage

- **Open**: Press Ctrl+Shift+Space
- **Ask**: Type your question and press Enter
- **Copy**: Press Ctrl+J or click the copy button
- **Clear**: Press Ctrl+K to clear everything
- **Re-focus on TextBox**: Press Ctrl+L to refocus on the text box to modify the prompt
- **Settings**: Press Ctrl+, to open settings
- **Close**: Press Escape or click outside the window

## Building

```bash
npm run build
npm run electron-build
```

## Contributing

Found a bug? Want a feature? PRs welcome! This is a simple project, so keep it simple.

## Tech Stack

- React + Vite
- Electron
- Tailwind CSS
- OpenAI API

---

*Fun fact: About 95% of this code was written with [Claude Code](https://claude.ai/code).*
