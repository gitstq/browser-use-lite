/**
 * 点击动作模块
 * 实现页面元素的点击操作
 * 支持通过元素索引或CSS选择器定位元素
 */

import type { Page } from 'puppeteer';
import type { Action, ActionResult } from '../../core/types.js';
import { ActionStatus } from '../../core/types.js';
import { ClickSchema } from '../schema.js';
import { DOMExtractor } from '../../browser/dom-extractor.js';

/**
 * 点击动作实现
 */
export const clickAction: Action = {
  name: 'click',
  description: '点击页面上的元素（按钮、链接等）',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'number',
        description: '元素索引（从页面元素列表获取）',
      },
      selector: {
        type: 'string',
        description: 'CSS选择器（可选，优先级高于index）',
      },
    },
    required: ['index'],
  },

  async execute(page: Page, args: Record<string, unknown>): Promise<ActionResult> {
    try {
      // 参数校验
      const params = ClickSchema.parse(args);
      const extractor = new DOMExtractor();

      let selector: string | null = null;

      // 优先使用CSS选择器
      if (params.selector) {
        selector = params.selector;
        // 验证元素是否存在
        const exists = await page.evaluate((sel) => document.querySelector(sel) !== null, selector);
        if (!exists) {
          return {
            status: ActionStatus.Failure,
            message: `未找到匹配选择器的元素：${selector}`,
          };
        }
      } else {
        // 通过索引查找元素
        selector = await extractor.findElementByIndex(page, params.index);
        if (!selector) {
          return {
            status: ActionStatus.Failure,
            message: `未找到索引为 ${params.index} 的元素`,
          };
        }
      }

      // 检查元素是否可见
      const isVisible = await extractor.isElementVisible(page, selector);
      if (!isVisible) {
        // 尝试滚动到元素位置
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, selector);

        // 等待滚动完成
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 执行点击
      await page.click(selector);

      // 等待页面可能的导航或加载
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        status: ActionStatus.Success,
        message: `成功点击元素（索引：${params.index}，选择器：${selector}）`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: ActionStatus.Failure,
        message: `点击失败：${message}`,
      };
    }
  },
};
