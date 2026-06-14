<div align="center">

<!-- Logo 佔位區域 -->
<p align="center">
  <img src="./assets/logo.svg" alt="browser-use-lite Logo" width="180" height="180">
</p>

<h1 align="center">🌐 Browser Use Lite</h1>

<p align="center">
  <strong>輕量級 AI 瀏覽器自動化代理，零配置啟動</strong>
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

## 🎉 專案介紹

**Browser Use Lite** 是一個專為 AI 智慧體設計的輕量級瀏覽器自動化函式庫。它讓大型語言模型（LLM）能夠像人類一樣瀏覽網頁、點擊按鈕、填寫表單、提取資料，而這一切只需要幾行程式碼即可實現。

與傳統自動化工具不同，Browser Use Lite 專注於 **AI 原生體驗** —— 它自動將網頁轉換為 LLM 可理解的結構化表示，讓 AI 能夠自主決策下一步操作。

### 為什麼選擇 Browser Use Lite？

| 特性 | Browser Use Lite | 傳統自動化工具 |
|------|-----------------|--------------|
| AI 原生支援 | ✅ 內建 | ❌ 需自行整合 |
| 啟動配置 | ✅ 零配置 | ❌ 複雜配置 |
| 網頁理解 | ✅ 自動結構化 | ❌ 原始 HTML |
| 學習曲線 | ✅ 極低 | ❌ 陡峭 |

---

## ✨ 核心特性

- 🤖 **AI 原生設計** — 自動將網頁轉換為 LLM 友好的結構化表示
- 🚀 **零配置啟動** — 一行命令即可開始自動化瀏覽
- 🎯 **精準操控** — 基於 Puppeteer 的穩定瀏覽器控制
- 📊 **資料提取** — 內建 Zod 模式驗證，類型安全的資料抓取
- 🔧 **高度可擴展** — 插件化架構，輕鬆自定義行為
- 🌐 **代理支援** — 內建 HTTP/HTTPS/SOCKS 代理配置
- 📱 **多平台** — 支援 Windows、macOS、Linux
- 🧪 **測試友好** — 內建測試工具和模擬環境

---

## 🚀 快速開始

### 環境要求

- [Node.js](https://nodejs.org/) >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安裝

#### 使用 npm（推薦）

```bash
npm install browser-use-lite
```

#### 使用 pnpm

```bash
pnpm add browser-use-lite
```

#### 中國大陸用戶（使用鏡像源）

```bash
# 臨時使用淘寶鏡像
npm install browser-use-lite --registry=https://registry.npmmirror.com

# 或使用 pnpm
pnpm add browser-use-lite --registry=https://registry.npmmirror.com
```

### 最小可運行範例

```typescript
import { BrowserAgent } from 'browser-use-lite';

async function main() {
  // 創建瀏覽器代理實例
  const agent = new BrowserAgent({
    headless: false, // 設置為 true 可在後台運行
  });

  try {
    // 啟動瀏覽器並執行任務
    const result = await agent.run({
      task: '在 GitHub 上搜尋 "browser-use-lite" 專案，並返回第一個結果的標題和連結',
    });

    console.log('任務完成！');
    console.log('結果：', result);
  } catch (error) {
    console.error('任務執行失敗：', error);
  } finally {
    // 關閉瀏覽器
    await agent.close();
  }
}

main();
```

### 運行範例

```bash
# 克隆倉庫
git clone https://github.com/gitstq/browser-use-lite.git
cd browser-use-lite

# 安裝依賴
npm install

# 運行範例
npx ts-node examples/basic-search.ts
```

---

## 📖 詳細使用指南

### 基礎配置

```typescript
import { BrowserAgent } from 'browser-use-lite';

const agent = new BrowserAgent({
  // 瀏覽器配置
  headless: true,           // 無頭模式
  slowMo: 100,              // 操作延遲（毫秒）
  viewport: {               // 視口大小
    width: 1920,
    height: 1080,
  },

  // LLM 配置
  llm: {
    provider: 'openai',     // 支援 openai / anthropic / azure 等
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },

  // 代理配置（中國大陸用戶推薦）
  proxy: {
    server: 'http://127.0.0.1:7890', // Clash/V2Ray 本地代理地址
  },
});
```

### 代理配置指南（中國大陸用戶）

如果你在中國大陸地區，可能需要配置代理以訪問某些網站或 API：

```typescript
// Clash 用戶
const agent = new BrowserAgent({
  proxy: {
    server: 'http://127.0.0.1:7890',
  },
});

// V2RayN 用戶
const agent = new BrowserAgent({
  proxy: {
    server: 'http://127.0.0.1:10809',
  },
});

// 使用 SOCKS5
const agent = new BrowserAgent({
  proxy: {
    server: 'socks5://127.0.0.1:10808',
  },
});

// 需要認證的代理
const agent = new BrowserAgent({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'your-username',
    password: 'your-password',
  },
});
```

### 資料提取（帶 Zod 驗證）

```typescript
import { z } from 'zod';
import { BrowserAgent } from 'browser-use-lite';

// 定義資料結構
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
    instruction: '提取頁面上的所有商品資訊',
  });

  console.log('提取到的商品：', products);
  // 類型安全：products 自動推斷為 z.infer<typeof ProductSchema>[]
}
```

### 多步驟任務

```typescript
const agent = new BrowserAgent();

await agent.run({
  task: [
    '打開 https://github.com/login',
    '輸入用戶名 "example" 和密碼 "password"',
    '點擊登入按鈕',
    '導航到 Settings 頁面',
    '提取用戶的郵箱地址',
  ],
  maxSteps: 10, // 最大執行步驟數
});
```

### 自定義動作

```typescript
import { BrowserAgent, defineAction } from 'browser-use-lite';

const customAction = defineAction({
  name: 'screenshot-element',
  description: '截取指定元素的螢幕截圖',
  parameters: z.object({
    selector: z.string(),
    outputPath: z.string(),
  }),
  async execute({ page, parameters }) {
    const element = await page.$(parameters.selector);
    if (!element) throw new Error('元素未找到');
    await element.screenshot({ path: parameters.outputPath });
    return { success: true, path: parameters.outputPath };
  },
});

const agent = new BrowserAgent({
  actions: [customAction],
});
```

---

## 💡 設計思路與迭代規劃

### 架構設計

```
browser-use-lite/
├── src/
│   ├── core/           # 核心引擎
│   │   ├── agent.ts    # 主代理邏輯
│   │   ├── browser.ts  # 瀏覽器管理
│   │   └── planner.ts  # 任務規劃器
│   ├── llm/            # LLM 整合層
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   └── base.ts
│   ├── actions/        # 瀏覽器動作集
│   │   ├── click.ts
│   │   ├── type.ts
│   │   ├── navigate.ts
│   │   └── extract.ts
│   ├── types/          # TypeScript 類型定義
│   └── utils/          # 工具函數
├── examples/           # 範例程式碼
├── tests/              # 測試套件
└── docs/               # 文件
```

### 核心設計原則

1. **AI 優先** — 所有 API 設計以 LLM 易用性為第一目標
2. **類型安全** — 全程使用 TypeScript + Zod，編譯時和執行時雙重保障
3. **最小依賴** — 核心功能零依賴，擴展功能按需載入
4. **可觀測性** — 內建詳細日誌和除錯工具

### 迭代路線圖

| 版本 | 計劃功能 | 預計時間 |
|------|---------|---------|
| v0.1.x | 核心瀏覽功能、基礎 LLM 整合 | ✅ 已完成 |
| v0.2.x | 多 LLM 提供商支援、插件系統 | 🚧 進行中 |
| v0.3.x | 視覺理解（截圖分析）、OCR 支援 | 📅 計劃中 |
| v0.4.x | 並行任務執行、分散式瀏覽 | 📅 計劃中 |
| v1.0.0 | 穩定 API、完整文件、生產就緒 | 📅 計劃中 |

---

## 📦 打包與部署指南

### 本地構建

```bash
# 克隆倉庫
git clone https://github.com/gitstq/browser-use-lite.git
cd browser-use-lite

# 安裝依賴（中國大陸用戶使用鏡像源）
npm install --registry=https://registry.npmmirror.com

# 構建專案
npm run build

# 運行測試
npm test
```

### 發佈到 npm

```bash
# 登入 npm（如未登入）
npm login

# 版本升級
npm version patch  # 或 minor / major

# 發佈
npm publish

# 中國大陸用戶發佈到淘寶鏡像
npm publish --registry=https://registry.npmmirror.com
```

### Docker 部署

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
# 構建鏡像
docker build -t browser-use-lite .

# 運行容器
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your-api-key \
  --name browser-use-lite \
  browser-use-lite
```

---

## 🤝 貢獻指南

我們歡迎所有形式的貢獻！無論是提交 Bug 報告、功能建議，還是程式碼貢獻。

### 開發環境搭建

```bash
# Fork 並克隆倉庫
git clone https://github.com/YOUR_USERNAME/browser-use-lite.git
cd browser-use-lite

# 安裝依賴
npm install

# 啟動開發模式
npm run dev

# 運行測試
npm test

# 運行程式碼檢查
npm run lint

# 自動修復程式碼風格
npm run lint:fix
```

### 提交規範

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

```bash
# 功能提交
git commit -m "feat: 添加新的瀏覽器動作"

# 修復提交
git commit -m "fix: 修復點擊元素時的定位問題"

# 文件提交
git commit -m "docs: 更新 README 中的範例程式碼"

# 重構提交
git commit -m "refactor: 優化 LLM 呼叫邏輯"
```

### 提交 Pull Request 流程

1. Fork 本倉庫並創建你的分支 (`git checkout -b feature/amazing-feature`)
2. 提交你的更改 (`git commit -m 'feat: 添加某個功能'`)
3. 推送到分支 (`git push origin feature/amazing-feature`)
4. 打開一個 Pull Request

### 行為準則

- 尊重每一位貢獻者
- 接受建設性的批評
- 關注對社群最有利的事情
- 對其他社群成員表示同理心

---

## 📄 開源協議說明

本專案採用 [MIT 協議](https://opensource.org/licenses/MIT) 開源。

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

## 🙏 致謝

- [Puppeteer](https://pptr.dev/) — 強大的 Node.js 瀏覽器自動化函式庫
- [Zod](https://zod.dev/) — TypeScript 優先的模式驗證函式庫
- [OpenAI](https://openai.com/) — 提供強大的 LLM API

---

<div align="center">

<p>
  <sub>Built with ❤️ by <a href="https://github.com/gitstq">gitstq</a></sub>
</p>

<p>
  <a href="https://github.com/gitstq/browser-use-lite/stargazers">⭐ Star 我們</a> ·
  <a href="https://github.com/gitstq/browser-use-lite/issues">🐛 提交 Issue</a> ·
  <a href="https://github.com/gitstq/browser-use-lite/discussions">💬 參與討論</a>
</p>

</div>
