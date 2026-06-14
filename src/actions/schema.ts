/**
 * Zod Schema定义模块
 * 为所有浏览器动作定义参数校验Schema
 * 用于LLM参数解析和运行时验证
 */

import { z } from 'zod';

/**
 * 点击动作参数Schema
 */
export const ClickSchema = z.object({
  /** 元素索引（从DOM提取器获取） */
  index: z.number().int().nonnegative().describe('元素索引'),
  /** 可选：CSS选择器 */
  selector: z.string().optional().describe('CSS选择器'),
});

/**
 * 输入动作参数Schema
 */
export const TypeSchema = z.object({
  /** 元素索引 */
  index: z.number().int().nonnegative().describe('元素索引'),
  /** 要输入的文本 */
  text: z.string().describe('要输入的文本'),
  /** 是否先清空 */
  clear: z.boolean().optional().default(true).describe('是否先清空输入框'),
  /** 可选：CSS选择器 */
  selector: z.string().optional().describe('CSS选择器'),
});

/**
 * 导航动作参数Schema
 */
export const NavigateSchema = z.object({
  /** 目标URL */
  url: z.string().url().describe('目标URL'),
  /** 等待条件 */
  waitUntil: z
    .enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2'])
    .optional()
    .default('networkidle2')
    .describe('页面加载等待条件'),
});

/**
 * 滚动动作参数Schema
 */
export const ScrollSchema = z.object({
  /** 滚动方向 */
  direction: z.enum(['up', 'down', 'left', 'right']).describe('滚动方向'),
  /** 滚动距离（像素） */
  distance: z.number().int().positive().optional().default(300).describe('滚动距离（像素）'),
  /** 是否滚动到特定元素 */
  toElement: z.number().int().nonnegative().optional().describe('滚动到指定元素索引'),
});

/**
 * 等待动作参数Schema
 */
export const WaitSchema = z.object({
  /** 等待时间（毫秒） */
  duration: z.number().int().nonnegative().optional().default(1000).describe('等待时间（毫秒）'),
  /** 等待元素出现 */
  forSelector: z.string().optional().describe('等待此CSS选择器匹配的元素出现'),
});

/**
 * 获取页面信息动作参数Schema
 */
export const GetPageInfoSchema = z.object({
  /** 是否包含完整HTML */
  includeHtml: z.boolean().optional().default(false).describe('是否包含完整HTML'),
});

/**
 * 动作参数Schema映射表
 */
export const ActionSchemas = {
  click: ClickSchema,
  type: TypeSchema,
  navigate: NavigateSchema,
  scroll: ScrollSchema,
  wait: WaitSchema,
  getPageInfo: GetPageInfoSchema,
} as const;

/**
 * 动作名称类型
 */
export type ActionName = keyof typeof ActionSchemas;

/**
 * 获取Schema的JSON描述（用于LLM提示）
 */
export function getSchemaDescriptions(): string {
  const descriptions: string[] = [];

  for (const [name, schema] of Object.entries(ActionSchemas)) {
    const shape = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape;
    const params: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const isOptional = value instanceof z.ZodOptional;
      const baseType = isOptional ? (value as z.ZodOptional<z.ZodTypeAny>).unwrap() : value;
      const typeStr = baseType.constructor.name.replace('Zod', '').toLowerCase();
      params.push(`${key}: ${typeStr}${isOptional ? '?' : ''}`);
    }

    descriptions.push(`- ${name}({ ${params.join(', ')} })`);
  }

  return descriptions.join('\n');
}
