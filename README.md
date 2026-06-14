<div align="center">

<!-- Logo占位区域 -->
<p align="center">
  <img src="./assets/logo.svg" alt="browser-use-lite Logo" width="180" height="180">
</p>

<h1 align="center">🌐 Browser Use Lite</h1>

<p align="center">
  <strong>轻量级 AI 浏览器自动化代理，零配置启动</strong>
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

## 🎉 项目介绍

**Browser Use Lite** 是一个专为 AI 智能体设计的轻量级浏览器自动化库。它让大语言模型（LLM）能够像人类一样浏览网页、点击按钮、填写表单、提取数据，而这一切只需要几行代码即可实现。

与传统自动化工具不同，Browser Use Lite 专注于 **AI 原生体验** —— 它自动将网页转换为 LLM 可理解的结构化表示，让 AI 能够自主决策下一步操作。

### 为什么选择 Browser Use Lite？

| 特性 | Browser Use Lite | 传统自动化工具 |
|------|-----------------|--------------|
| AI 原生支持 | ✅ 内置 | ❌ 需自行集成 |
| 启动配置 | ✅ 零配置 | ❌ 复杂配置 |
| 网页理解 | ✅ 自动结构化 | ❌ 原始 HTML |
| 学习曲线 | ✅ 极低 | ❌ 陡峭 |

---

## ✨ 核心特性

- 🤖 **AI 原生设计** — 自动将网页转换为 LLM 友好的结构化表示
- 🚀 **零配置启动** — 一行命令即可开始自动化浏览
- 🎯 **精准操控** — 基于 Puppeteer 的稳定浏览器控制
- 📊 **数据提取** — 内置 Zod 模式验证，类型安全的数据抓取
- 🔧 **高度可扩展** — 插件化架构，轻松自定义行为
- 🌐 **代理支持** — 内置 HTTP/HTTPS/SOCKS 代理配置
- 📱 **多平台** — 支持 Windows、macOS、Linux
- 🧪 **测试友好** — 内置测试工具和模拟环境

---

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装

#### 使用 npm（推荐）

```bash
npm install browser-use-lite
```

#### 使用 pnpm

```bash
pnpm add browser-use-lite
```

#### 中国大陆用户（使用镜像源）

```bash
# 临时使用淘宝镜像
npm install browser-use-lite --registry=https://registry.npmmirror.com

# 或使用 pnpm
pnpm add browser-use-lite --registry=https://registry.npmmirror.com
```

### 最小可运行示例

```typescript
import { BrowserAgent } from 'browser-use-lite';

async function main() {
  // 创建浏览器代理实例
  const agent = new BrowserAgent({
    headless: false, // 设置为 true 可在后台运行
  });

  try {
    // 启动浏览器并执行任务
    const result = await agent.run({
      task: '在 GitHub 上搜索 "browser-use-lite" 项目，并返回第一个结果的标题和链接',
    });

    console.log('任务完成！');
    console.log('结果：', result);
  } catch (error) {
    console.error('任务执行失败：', error);
  } finally {
    // 关闭浏览器
    await agent.close();
  }
}

main();
```

### 运行示例

```bash
# 克隆仓库
git clone https://github.com/gitstq/browser-use-lite.git
cd browser-use-lite

# 安装依赖
npm install

# 运行示例
npx ts-node examples/basic-search.ts
```

---

## 📖 详细使用指南

### 基础配置

```typescript
import { BrowserAgent } from 'browser-use-lite';

const agent = new BrowserAgent({
  // 浏览器配置
  headless: true,           // 无头模式
  slowMo: 100,              // 操作延迟（毫秒）
  viewport: {               // 视口大小
    width: 1920,
    height: 1080,
  },

  // LLM 配置
  llm: {
    provider: 'openai',     // 支持 openai / anthropic / azure 等
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },

  // 代理配置（中国大陆用户推荐）
  proxy: {
    server: 'http://127.0.0.1:7890', // Clash/V2Ray 本地代理地址
  },
});
```

### 代理配置指南（中国大陆用户）

如果你在中国大陆地区，可能需要配置代理以访问某些网站或 API：

```typescript
// Clash 用户
const agent = new BrowserAgent({
  proxy: {
    server: 'http://127.0.0.1:7890',
  },
});

// V2RayN 用户
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

// 需要认证的代理
const agent = new BrowserAgent({
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'your-username',
    password: 'your-password',
  },
});
```

### 数据提取（带 Zod 验证）

```typescript
import { z } from 'zod';
import { BrowserAgent } from 'browser-use-lite';

// 定义数据结构
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
    instruction: '提取页面上的所有商品信息',
  });

  console.log('提取到的商品：', products);
  // 类型安全：products 自动推断为 z.infer<typeof ProductSchema>[]
}
```

### 多步骤任务

```typescript
const agent = new BrowserAgent();

await agent.run({
  task: [
    '打开 https://github.com/login',
    '输入用户名 "example" 和密码 "password"',
    '点击登录按钮',
    '导航到 Settings 页面',
    '提取用户的邮箱地址',
  ],
  maxSteps: 10, // 最大执行步骤数
});
```

### 自定义动作

```typescript
import { BrowserAgent, defineAction } from 'browser-use-lite';

const customAction = defineAction({
  name: 'screenshot-element',
  description: '截取指定元素的屏幕截图',
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

## 💡 设计思路与迭代规划

### 架构设计

```
browser-use-lite/
├── src/
│   ├── core/           # 核心引擎
│   │   ├── agent.ts    # 主代理逻辑
│   │   ├── browser.ts  # 浏览器管理
│   │   └── planner.ts  # 任务规划器
│   ├── llm/            # LLM 集成层
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   └── base.ts
│   ├── actions/        # 浏览器动作集
│   │   ├── click.ts
│   │   ├── type.ts
│   │   ├── navigate.ts
│   │   └── extract.ts
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── examples/           # 示例代码
├── tests/              # 测试套件
└── docs/               # 文档
```

### 核心设计原则

1. **AI 优先** — 所有 API 设计以 LLM 易用性为第一目标
2. **类型安全** — 全程使用 TypeScript + Zod，编译时和运行时双重保障
3. **最小依赖** — 核心功能零依赖，扩展功能按需加载
4. **可观测性** — 内置详细日志和调试工具

### 迭代路线图

| 版本 | 计划功能 | 预计时间 |
|------|---------|---------|
| v0.1.x | 核心浏览功能、基础 LLM 集成 | ✅ 已完成 |
| v0.2.x | 多 LLM 提供商支持、插件系统 | 🚧 进行中 |
| v0.3.x | 视觉理解（截图分析）、OCR 支持 | 📅 计划中 |
| v0.4.x | 并行任务执行、分布式浏览 | 📅 计划中 |
| v1.0.0 | 稳定 API、完整文档、生产就绪 | 📅 计划中 |

---

## 📦 打包与部署指南

### 本地构建

```bash
# 克隆仓库
git clone https://github.com/gitstq/browser-use-lite.git
cd browser-use-lite

# 安装依赖（中国大陆用户使用镜像源）
npm install --registry=https://registry.npmmirror.com

# 构建项目
npm run build

# 运行测试
npm test
```

### 发布到 npm

```bash
# 登录 npm（如未登录）
npm login

# 版本升级
npm version patch  # 或 minor / major

# 发布
npm publish

# 中国大陆用户发布到淘宝镜像
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
# 构建镜像
docker build -t browser-use-lite .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your-api-key \
  --name browser-use-lite \
  browser-use-lite
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是提交 Bug 报告、功能建议，还是代码贡献。

### 开发环境搭建

```bash
# Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/browser-use-lite.git
cd browser-use-lite

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 运行测试
npm test

# 运行代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix
```

### 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能提交
git commit -m "feat: 添加新的浏览器动作"

# 修复提交
git commit -m "fix: 修复点击元素时的定位问题"

# 文档提交
git commit -m "docs: 更新 README 中的示例代码"

# 重构提交
git commit -m "refactor: 优化 LLM 调用逻辑"
```

### 提交 Pull Request 流程

1. Fork 本仓库并创建你的分支 (`git checkout -b feature/amazing-feature`)
2. 提交你的更改 (`git commit -m 'feat: 添加某个功能'`)
3. 推送到分支 (`git push origin feature/amazing-feature`)
4. 打开一个 Pull Request

### 行为准则

- 尊重每一位贡献者
- 接受建设性的批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

---

## 📄 开源协议说明

本项目采用 [MIT 协议](https://opensource.org/licenses/MIT) 开源。

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

## 🙏 致谢

- [Puppeteer](https://pptr.dev/) — 强大的 Node.js 浏览器自动化库
- [Zod](https://zod.dev/) — TypeScript 优先的模式验证库
- [OpenAI](https://openai.com/) — 提供强大的 LLM API

---

<div align="center">

<p>
  <sub>Built with ❤️ by <a href="https://github.com/gitstq">gitstq</a></sub>
</p>

<p>
  <a href="https://github.com/gitstq/browser-use-lite/stargazers">⭐ Star 我们</a> ·
  <a href="https://github.com/gitstq/browser-use-lite/issues">🐛 提交 Issue</a> ·
  <a href="https://github.com/gitstq/browser-use-lite/discussions">💬 参与讨论</a>
</p>

</div>
