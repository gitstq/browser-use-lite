/**
 * Puppeteer浏览器封装模块
 * 提供浏览器的启动、关闭、页面管理等基础功能
 * 针对中国大陆网络环境做了特殊处理：
 * - 支持代理服务器配置
 * - 内置超时重试机制
 * - 使用stealth插件绕过检测
 */

import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';

// puppeteer-extra 使用 CommonJS 导出，需要兼容处理
const puppeteer = puppeteerExtra as unknown as {
  use: (plugin: unknown) => void;
  launch: (options: Record<string, unknown>) => Promise<Browser>;
};

/**
 * 浏览器管理器配置
 */
export interface BrowserManagerConfig {
  /** 是否无头模式 */
  headless?: boolean;
  /** 代理服务器地址，例如 http://127.0.0.1:7890 */
  proxyServer?: string;
  /** 额外的启动参数 */
  args?: string[];
  /** 视口大小 */
  viewport?: { width: number; height: number };
  /** 可执行文件路径 */
  executablePath?: string;
  /** 默认导航超时（毫秒） */
  defaultNavigationTimeout?: number;
}

/**
 * 浏览器管理器
 * 封装Puppeteer的生命周期管理和常用操作
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: Required<BrowserManagerConfig>;

  constructor(config: BrowserManagerConfig = {}) {
    this.config = {
      headless: config.headless ?? true,
      proxyServer: config.proxyServer ?? '',
      args: config.args ?? [],
      viewport: config.viewport ?? { width: 1280, height: 720 },
      executablePath: config.executablePath ?? '',
      defaultNavigationTimeout: config.defaultNavigationTimeout ?? 30000,
    };

    // 注册stealth插件，绕过网站检测
    puppeteer.use(StealthPlugin());
  }

  /**
   * 启动浏览器
   * 如果已启动则先关闭再重新启动
   */
  async launch(): Promise<void> {
    if (this.browser) {
      await this.close();
    }

    try {
      const launchOptions: {
        headless: boolean;
        args: string[];
        defaultViewport: { width: number; height: number };
        executablePath?: string;
      } = {
        headless: this.config.headless,
        args: this.buildLaunchArgs(),
        defaultViewport: this.config.viewport,
      };

      // 如果指定了可执行文件路径
      if (this.config.executablePath) {
        launchOptions.executablePath = this.config.executablePath;
      }

      this.browser = await puppeteer.launch(launchOptions);

      // 创建新页面
      const pages = await this.browser.pages();
      const page = pages.length > 0 ? pages[0] : await this.browser.newPage();
      this.page = page;

      // 设置默认超时
      page.setDefaultNavigationTimeout(this.config.defaultNavigationTimeout);
      page.setDefaultTimeout(this.config.defaultNavigationTimeout);

      // 设置视口
      await page.setViewport(this.config.viewport);

      // 设置User-Agent（模拟真实浏览器）
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`浏览器启动失败：${message}`);
    }
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        // 关闭失败时忽略错误
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`浏览器关闭时出错：${message}`);
      } finally {
        this.browser = null;
        this.page = null;
      }
    }
  }

  /**
   * 获取当前页面
   */
  getPage(): Page | null {
    return this.page;
  }

  /**
   * 获取浏览器实例
   */
  getBrowser(): Browser | null {
    return this.browser;
  }

  /**
   * 导航到指定URL
   * 内置重试机制，适应中国大陆网络环境
   */
  async navigate(url: string, retries: number = 3): Promise<void> {
    if (!this.page) {
      throw new Error('页面未初始化，请先调用launch()');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: this.config.defaultNavigationTimeout,
        });
        return; // 成功则返回
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (attempt === retries) {
          throw new Error(`导航到 ${url} 失败（已重试${retries}次）：${message}`);
        }
        // 等待后重试
        const delay = attempt * 1000;
        console.warn(`导航失败，${delay}ms后重试(${attempt}/${retries})...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * 截图并保存
   */
  async screenshot(path?: string): Promise<Uint8Array> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }

    const options: { path?: string; fullPage?: boolean; type?: 'png' | 'jpeg' } = {
      fullPage: true,
      type: 'png',
    };

    if (path) {
      options.path = path;
    }

    return await this.page.screenshot(options);
  }

  /**
   * 获取当前页面URL
   */
  async getCurrentUrl(): Promise<string> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }
    return this.page.url();
  }

  /**
   * 获取当前页面标题
   */
  async getTitle(): Promise<string> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }
    return this.page.title();
  }

  /**
   * 等待指定时间
   */
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 等待元素出现
   */
  async waitForSelector(selector: string, timeout?: number): Promise<void> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }
    await this.page.waitForSelector(selector, { timeout: timeout ?? this.config.defaultNavigationTimeout });
  }

  /**
   * 执行页面内JavaScript
   */
  async evaluate<T>(fn: () => T): Promise<T> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }
    return this.page.evaluate(fn);
  }

  /**
   * 检查浏览器是否已启动
   */
  isLaunched(): boolean {
    return this.browser !== null && this.page !== null;
  }

  /**
   * 构建启动参数
   */
  private buildLaunchArgs(): string[] {
    const args: string[] = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,720',
      '--lang=zh-CN',
    ];

    // 代理配置（支持中国大陆网络环境）
    if (this.config.proxyServer) {
      args.push(`--proxy-server=${this.config.proxyServer}`);
    }

    // 合并用户自定义参数
    args.push(...this.config.args);

    return args;
  }
}
