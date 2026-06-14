/**
 * OpenAI适配器模块
 * 实现OpenAI API的调用适配
 * 支持自定义baseURL（适用于国内代理或第三方API）
 */

import { BaseLLM } from './base.js';
import type { LLMConfig, LLMMessage, LLMResponse } from '../core/types.js';

/**
 * OpenAI API响应类型
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI LLM适配器
 */
export class OpenAILLM extends BaseLLM {
  private baseURL: string;

  constructor(config: LLMConfig) {
    super(config);
    // 支持自定义baseURL，适配国内代理环境
    this.baseURL = config.baseURL ?? 'https://api.openai.com/v1';
  }

  /**
   * 验证配置
   */
  validateConfig(): boolean {
    return !!this.config.apiKey && !!this.config.model;
  }

  /**
   * 发送消息到OpenAI API
   */
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.validateConfig()) {
      throw new Error('OpenAI配置无效：缺少apiKey或model');
    }

    return this.withRetry(async () => {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API错误 (${response.status})：${errorText}`);
      }

      const data = (await response.json()) as OpenAIResponse;

      if (!data.choices || data.choices.length === 0) {
        throw new Error('OpenAI API返回空响应');
      }

      const choice = data.choices[0];

      return {
        content: choice.message.content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    });
  }
}

/**
 * 创建OpenAI LLM实例的工厂函数
 */
export function createOpenAILLM(config: LLMConfig): OpenAILLM {
  return new OpenAILLM(config);
}
