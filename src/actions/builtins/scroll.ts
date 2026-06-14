/**
 * 滚动动作模块
 * 实现页面滚动操作
 * 支持方向滚动和滚动到指定元素
 */

import type { Page } from 'puppeteer';
import { DOMExtractor } from '../../browser/dom-extractor.js';
import type { Action, ActionResult } from '../../core/types.js';
import { ActionStatus } from '../../core/types.js';
import { ScrollSchema } from '../schema.js';

/**
 * 滚动动作实现
 */
export const scrollAction: Action = {
  name: 'scroll',
  description: '滚动页面',
  parameters: {
    type: 'object',
    properties: {
      direction: {
        type: 'string',
        description: '滚动方向：up, down, left, right',
      },
      distance: {
        type: 'number',
        description: '滚动距离（像素，默认300）',
      },
      toElement: {
        type: 'number',
        description: '滚动到指定元素索引',
      },
    },
    required: ['direction'],
  },

  async execute(page: Page, args: Record<string, unknown>): Promise<ActionResult> {
    try {
      // 参数校验
      const params = ScrollSchema.parse(args);
      const extractor = new DOMExtractor();

      // 如果指定了元素索引，滚动到该元素
      if (params.toElement !== undefined) {
        const selector = await extractor.findElementByIndex(page, params.toElement);
        if (!selector) {
          return {
            status: ActionStatus.Failure,
            message: `未找到索引为 ${params.toElement} 的元素`,
          };
        }

        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, selector);

        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
          status: ActionStatus.Success,
          message: `已滚动到元素（索引：${params.toElement}）`,
        };
      }

      // 根据方向滚动
      const distance = params.distance;
      let scrollX = 0;
      let scrollY = 0;

      switch (params.direction) {
        case 'up':
          scrollY = -distance;
          break;
        case 'down':
          scrollY = distance;
          break;
        case 'left':
          scrollX = -distance;
          break;
        case 'right':
          scrollX = distance;
          break;
      }

      await page.evaluate(
        (x, y) => {
          window.scrollBy(x, y);
        },
        scrollX,
        scrollY,
      );

      // 等待滚动动画
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        status: ActionStatus.Success,
        message: `已向${params.direction}滚动 ${distance}px`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: ActionStatus.Failure,
        message: `滚动失败：${message}`,
      };
    }
  },
};
