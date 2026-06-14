<div align="center">

<!-- Logo Placeholder -->
<p align="center">
  <img src="./assets/logo.svg" alt="browser-use-lite Logo" width="180" height="180">
</p>

<h1 align="center">🌐 Browser Use Lite</h1>

<p align="center">
  <strong>Lightweight AI Browser Automation Agent — Zero-Config Startup</strong>
</p>

<p align="center">
  <a href="https://github.com/gitstq/browser-use-lite/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/gitstq/browser-use-lite/ci.yml?style=flat-square&logo=github&label=CI" alt="CI Status">
  </a>
  <a href="https://www.npmjs.com/package/browser-use-lite">
    <img src="https://img.shields.io/npm/v/browser-use-lite?style=flat-square&logo=npm&color=cb3837" alt="npm version">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=flat-square&logo=node.js" alt="Node.js Version">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/gitstq/browser-use-lite?style=flat-square&color=2b9348" alt="License">
  </a>
  <a href="https://github.com/gitstq/browser-use-lite/stargazers">
    <img src="https://img.shields.io/github/stars/gitstq/browser-use-lite?style=flat-square&logo=github&color=fbbf24" alt="GitHub Stars">
  </a>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> |
  <a href="./README.zh-TW.md">繁體中文</a> |
  <a href="./README.en.md">English</a>
</p>

</div>

---

## 🎉 Introduction

**Browser Use Lite** is a lightweight browser automation library designed specifically for AI agents. It enables Large Language Models (LLMs) to browse the web, click buttons, fill out forms, and extract data just like a human — all with just a few lines of code.

Unlike traditional automation tools, Browser Use Lite focuses on an **AI-native experience** — it automatically transforms web pages into structured representations that LLMs can understand, allowing AI to make autonomous decisions about the next steps.

### Why Choose Browser Use Lite?

| Feature | Browser Use Lite | Traditional Tools |
|---------|-----------------|-------------------|
| AI-Native Support | ✅ Built-in | ❌ Requires manual integration |
| Startup Config | ✅ Zero-config | ❌ Complex configuration |
| Page Understanding | ✅ Auto-structured | ❌ Raw HTML |
| Learning Curve | ✅ Minimal | ❌ Steep |

---

## ✨ Core Features

- 🤖 **AI-Native Design** — Automatically transforms web pages into LLM-friendly structured representations
- 🚀 **Zero-Config Startup** — Start automating with a single command
- 🎯 **Precise Control** — Stable browser control powered by Puppeteer
- 📊 **Data Extraction** — Built-in Zod schema validation for type-safe data scraping
- 🔧 **Highly Extensible** — Plugin-based architecture for easy customization
- 🌐 **Proxy Support** — Built-in HTTP/HTTPS/SOCKS proxy configuration
- 📱 **Multi-Platform** — Supports Windows, macOS, and Linux
- 🧪 **Test-Friendly** — Built-in testing tools and mock environments

---

## 🚀 Quick Start

### Requirements

- [Node.js](https://nodejs.org/) >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0

### Installation

#### Using npm (Recommended)

```bash
npm install browser-use-lite
```

#### Using pnpm

```bash
pnpm add browser-use-lite
```

#### For Users in Mainland China (Using Mirror Registry)

```bash
# Use npmmirror temporarily
npm install browser-use-lite --registry=https://registry.npmmirror.com

# Or using pnpm
pnpm add browser-use-lite --registry=https://registry.npmmirror.com
```

### Minimal Runnable Example

```typescript
import { BrowserAgent } from 'browser-use-lite';

async function main() {
  // Create a browser agent instance
  const agent = new BrowserAgent({
    headless: false, // Set to true to run in background
  });

  try {
    // Launch browser and execute task
    const result = await agent.run({
      task: 'Search for "browser-use-lite" on GitHub and return the title and link of the first result',
    });

    console.log('Task completed!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Task execution failed:', error);
  } finally {
    // Close the browser
    await agent.close();
  }
}

main();
```

### Running Examples

```bash
# Clone the repository
git clone https://github.com/gitstq/browser-use-lite.git
cd browser-use-lite

# Install dependencies
npm install

# Run example
npx ts-node examples/basic-search.ts
```

---

## 📖 Detailed Usage Guide

### Basic Configuration

```typescript
import { BrowserAgent } from 'browser-use-lite';

const agent = new BrowserAgent({
  // Browser configuration
  headless: true,           // Headless mode
  slowMo: 100,              // Operation delay (ms)
  viewport: {               // Viewport size
    width: 1920,
    height: 1080,
  },

  // LLM configuration
  llm: {
    provider: 'openai',     // Supports openai / anthropic / azure, etc.
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Proxy configuration (recommended for users in Mainland China)
  proxy: {
    server: 'http://127.0.0.1:7890', // Clash/V2Ray local proxy address
  },
});
```

### Proxy Configuration Guide (For Users in Mainland China)

If you are in Mainland China, you may need to configure a proxy to access certain websites or APIs:

```typescript
// For Clash users
const agent = new BrowserAgent({
  proxy: {
    server: 'http://127.0.0.1:7890',
  },
});

// For V2RayN users
const agent = new BrowserAgent({
  proxy: {
    server: 'http://127.0.0.1:10809',
  },
});

// Using SOCKS5
const agent = new BrowserAgent({
  proxy: {
    server: 'socks5://127.0.0.1:10808',
  },
});

// Proxy with authentication
const agent = new BrowserAgent({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'your-username',
    password: 'your-password',
  },
});
```

### Data Extraction (with Zod Validation)

```typescript
import { z } from 'zod';
import { BrowserAgent } from 'browser-use-lite';

// Define data structure
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  rating: z.number().min(0).max(5).optional(),
  url: z.string().url(),
});

const agent = new BrowserAgent({
  llm: { provider: 'openai', model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY },
});

async function scrapeProducts() {
  const products = await agent.extract({
    url: 'https://example.com/products',
    schema: ProductSchema,
    instruction: 'Extract all product information from the page',
  });

  console.log('Extracted products:', products);
  // Type-safe: products is automatically inferred as z.infer<typeof ProductSchema>[]
}
```

### Multi-Step Tasks

```typescript
const agent = new BrowserAgent();

await agent.run({
  task: [
    'Open https://github.com/login',
    'Enter username "example" and password "password"',
    'Click the login button',
    'Navigate to the Settings page',
    'Extract the user\'s email address',
  ],
  maxSteps: 10, // Maximum number of execution steps
});
```

### Custom Actions

```typescript
import { BrowserAgent, defineAction } from 'browser-use-lite';

const customAction = defineAction({
  name: 'screenshot-element',
  description: 'Take a screenshot of a specified element',
  parameters: z.object({
    selector: z.string(),
    outputPath: z.string(),
  }),
  async execute({ page, parameters }) {
    const element = await page.$(parameters.selector);
    if (!element) throw new Error('Element not found');
    await element.screenshot({ path: parameters.outputPath });
    return { success: true, path: parameters.outputPath };
  },
});

const agent = new BrowserAgent({
  actions: [customAction],
});
```

---

## 💡 Design Philosophy & Roadmap

### Architecture

```
browser-use-lite/
├── src/
│   ├── core/           # Core engine
│   │   ├── agent.ts    # Main agent logic
│   │   ├── browser.ts  # Browser management
│   │   └── planner.ts  # Task planner
│   ├── llm/            # LLM integration layer
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   └── base.ts
│   ├── actions/        # Browser action set
│   │   ├── click.ts
│   │   ├── type.ts
│   │   ├── navigate.ts
│   │   └── extract.ts
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── examples/           # Example code
├── tests/              # Test suite
└── docs/               # Documentation
```

### Core Design Principles

1. **AI-First** — All API designs prioritize LLM usability
2. **Type Safety** — Full TypeScript + Zod for compile-time and runtime guarantees
3. **Minimal Dependencies** — Core features with zero dependencies, extensions loaded on demand
4. **Observability** — Built-in detailed logging and debugging tools

### Iteration Roadmap

| Version | Planned Features | ETA |
|---------|-----------------|-----|
| v0.1.x | Core browsing features, basic LLM integration | ✅ Completed |
| v0.2.x | Multi-LLM provider support, plugin system | 🚧 In Progress |
| v0.3.x | Visual understanding (screenshot analysis), OCR support | 📅 Planned |
| v0.4.x | Parallel task execution, distributed browsing | 📅 Planned |
| v1.0.0 | Stable API, complete documentation, production-ready | 📅 Planned |

---

## 📦 Packaging & Deployment Guide

### Local Build

```bash
# Clone the repository
git clone https://github.com/gitstq/browser-use-lite.git
cd browser-use-lite

# Install dependencies (use mirror for users in Mainland China)
npm install --registry=https://registry.npmmirror.com

# Build the project
npm run build

# Run tests
npm test
```

### Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Version bump
npm version patch  # or minor / major

# Publish
npm publish

# For users in Mainland China publishing to npmmirror
npm publish --registry=https://registry.npmmirror.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build image
docker build -t browser-use-lite .

# Run container
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your-api-key \
  --name browser-use-lite \
  browser-use-lite
```

---

## 🤝 Contributing Guide

We welcome all forms of contributions! Whether it's bug reports, feature suggestions, or code contributions.

### Development Environment Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/browser-use-lite.git
cd browser-use-lite

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Auto-fix code style
npm run lint:fix
```

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Feature commit
git commit -m "feat: add new browser action"

# Fix commit
git commit -m "fix: resolve element positioning issue on click"

# Documentation commit
git commit -m "docs: update example code in README"

# Refactor commit
git commit -m "refactor: optimize LLM call logic"
```

### Pull Request Process

1. Fork this repository and create your branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add some feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

### Code of Conduct

- Be respectful to every contributor
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards other community members

---

## 📄 License

This project is open-sourced under the [MIT License](https://opensource.org/licenses/MIT).

```
MIT License

Copyright (c) 2024-present gitstq

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgements

- [Puppeteer](https://pptr.dev/) — Powerful Node.js browser automation library
- [Zod](https://zod.dev/) — TypeScript-first schema validation library
- [OpenAI](https://openai.com/) — Providing powerful LLM APIs

---

<div align="center">

<p>
  <sub>Built with ❤️ by <a href="https://github.com/gitstq">gitstq</a></sub>
</p>

<p>
  <a href="https://github.com/gitstq/browser-use-lite/stargazers">⭐ Star Us</a> ·
  <a href="https://github.com/gitstq/browser-use-lite/issues">🐛 Submit Issue</a> ·
  <a href="https://github.com/gitstq/browser-use-lite/discussions">💬 Join Discussion</a>
</p>

</div>
