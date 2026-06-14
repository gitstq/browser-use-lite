/**
 * DOM提取器模块
 * 负责从页面中提取结构化信息，包括：
 * - 可交互元素（按钮、链接、输入框等）
 * - 页面文本内容
 * - 元素位置和属性信息
 */

import type { Page } from 'puppeteer';
import type { DOMElement, PageInfo } from '../core/types.js';

/**
 * DOM提取器
 * 使用Puppeteer在页面内执行JavaScript来提取DOM信息
 */
export class DOMExtractor {
  /**
   * 可交互元素的CSS选择器
   */
  private static readonly INTERACTIVE_SELECTORS = [
    'a',
    'button',
    'input',
    'textarea',
    'select',
    '[role="button"]',
    '[role="link"]',
    '[onclick]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /**
   * 提取页面完整信息
   */
  async extract(page: Page): Promise<PageInfo> {
    const [title, url, interactiveElements, textContent] = await Promise.all([
      page.title(),
      page.url(),
      this.extractInteractiveElements(page),
      this.extractTextContent(page),
    ]);

    return {
      title,
      url,
      interactiveElements,
      textContent,
    };
  }

  /**
   * 提取可交互元素
   */
  async extractInteractiveElements(page: Page): Promise<DOMElement[]> {
    return await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      const results: DOMElement[] = [];

      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();

        // 只提取可见元素
        if (rect.width === 0 || rect.height === 0) {
          return;
        }

        // 提取属性
        const attributes: Record<string, string> = {};
        const attrs = el.attributes;
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          attributes[attr.name] = attr.value;
        }

        // 获取元素文本
        const text = htmlEl.innerText ?? htmlEl.textContent ?? '';

        const domElement: DOMElement = {
          tag: el.tagName.toLowerCase(),
          text: text.trim().slice(0, 200), // 限制文本长度
          id: el.id || undefined,
          className: el.className || undefined,
          index,
          attributes,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        };

        results.push(domElement);
      });

      return results;
    }, DOMExtractor.INTERACTIVE_SELECTORS);
  }

  /**
   * 提取页面文本内容（用于LLM理解页面）
   */
  async extractTextContent(page: Page): Promise<string> {
    return await page.evaluate(() => {
      // 移除脚本和样式标签的内容
      const body = document.body.cloneNode(true) as HTMLElement;

      // 移除不需要的元素
      const removeSelectors = ['script', 'style', 'noscript', 'iframe', 'nav', 'footer'];
      for (const sel of removeSelectors) {
        const elements = body.querySelectorAll(sel);
        for (const el of elements) {
          el.remove();
        }
      }

      // 获取文本并清理
      let text = body.innerText ?? '';

      // 清理多余空白
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      return text.slice(0, 3000); // 限制长度
    });
  }

  /**
   * 根据索引查找元素
   */
  async findElementByIndex(page: Page, index: number): Promise<string | null> {
    return await page.evaluate(
      (sel, idx) => {
        const elements = document.querySelectorAll(sel);
        const el = elements[idx] as HTMLElement | undefined;

        if (!el) {
          return null;
        }

        // 尝试生成唯一选择器
        if (el.id) {
          return `#${el.id}`;
        }

        // 使用data属性标记
        const marker = `__browser_use_lite_${idx}__`;
        el.setAttribute('data-browser-use-lite', marker);
        return `[data-browser-use-lite="${marker}"]`;
      },
      DOMExtractor.INTERACTIVE_SELECTORS,
      index,
    );
  }

  /**
   * 获取元素在视口中的位置
   */
  async getElementPosition(page: Page, selector: string): Promise<{ x: number; y: number } | null> {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) {
        return null;
      }

      const rect = el.getBoundingClientRect();
      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      };
    }, selector);
  }

  /**
   * 检查元素是否可见
   */
  async isElementVisible(page: Page, selector: string): Promise<boolean> {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (!el) {
        return false;
      }

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      );
    }, selector);
  }
}
