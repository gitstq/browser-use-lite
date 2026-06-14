/**
 * 导航动作模块
 * 实现页面导航操作
 * 支持自定义等待条件和超时设置
 */

import type { Page } from 'puppeteer';
import type { Action, ActionResult } from '../../core/types.js';
import { ActionStatus } from '../../core/types.js';
import { NavigateSchema } from '../schema.js';

/**
 * 导航动作实现
 */
export const navigateAction: Action = {
  name: 'navigate',
  description: '导航到指定URL',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: '目标URL',
      },
      waitUntil: {
        type: 'string',
        description: '等待条件：load, domcontentloaded, networkidle0, networkidle2',
      },
    },
    required: ['url'],
  },

  async execute(page: Page, args: Record<string, unknown>): Promise<ActionResult> {
    try {
      // 参数校验
      const params = NavigateSchema.parse(args);

      // 执行导航
      const response = await page.goto(params.url, {
        waitUntil: params.waitUntil,
        timeout: 30000,
      });

      // 检查响应状态
      if (response) {
        const status = response.status();
        if (status >= 400) {
          return {
            status: ActionStatus.Failure,
            message: `导航到 ${params.url} 失败，HTTP状态码：${status}`,
          };
        }
      }

      // 等待页面稳定
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        status: ActionStatus.Success,
        message: `成功导航到 ${params.url}`,
        data: {
          url: params.url,
          status: response?.status() ?? 0,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: ActionStatus.Failure,
        message: `导航失败：${message}`,
      };
    }
  },
};
