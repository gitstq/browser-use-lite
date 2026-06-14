/**
 * 输入动作模块
 * 实现向输入框输入文本的操作
 * 支持清空后输入和追加输入两种模式
 */

import type { Page } from 'puppeteer';
import { DOMExtractor } from '../../browser/dom-extractor.js';
import type { Action, ActionResult } from '../../core/types.js';
import { ActionStatus } from '../../core/types.js';
import { TypeSchema } from '../schema.js';

/**
 * 输入动作实现
 */
export const typeAction: Action = {
  name: 'type',
  description: '在输入框中输入文本',
  parameters: {
    type: 'object',
    properties: {
      index: {
        type: 'number',
        description: '输入框元素索引',
      },
      text: {
        type: 'string',
        description: '要输入的文本',
      },
      clear: {
        type: 'boolean',
        description: '是否先清空输入框（默认true）',
      },
      selector: {
        type: 'string',
        description: 'CSS选择器（可选）',
      },
    },
    required: ['index', 'text'],
  },

  async execute(page: Page, args: Record<string, unknown>): Promise<ActionResult> {
    try {
      // 参数校验
      const params = TypeSchema.parse(args);
      const extractor = new DOMExtractor();

      let selector: string | null = null;

      // 优先使用CSS选择器
      if (params.selector) {
        selector = params.selector;
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

      // 聚焦到元素
      await page.focus(selector);

      // 如果需要，先清空输入框
      if (params.clear) {
        // 使用Ctrl+A全选然后删除
        await page.keyboard.down('Control');
        await page.keyboard.down('a');
        await page.keyboard.up('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
      }

      // 输入文本
      await page.keyboard.type(params.text, { delay: 50 });

      return {
        status: ActionStatus.Success,
        message: `成功在元素（索引：${params.index}）中输入文本："${params.text}"`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: ActionStatus.Failure,
        message: `输入失败：${message}`,
      };
    }
  },
};
