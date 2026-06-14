/**
 * LLM统一接口模块
 * 定义LLM提供者的抽象接口
 * 所有LLM适配器都需要实现此接口
 */

import type { LLMConfig, LLMMessage, LLMProvider, LLMResponse } from '../core/types.js';

export type { LLMProvider, LLMConfig, LLMMessage, LLMResponse };

/**
 * LLM基础类
 * 提供通用的重试、超时和错误处理逻辑
 */
export abstract class BaseLLM implements LLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 60000,
      ...config,
    };
  }

  /**
   * 发送消息到LLM（子类必须实现）
   */
  abstract chat(messages: LLMMessage[]): Promise<LLMResponse>;

  /**
   * 验证配置是否有效
   */
  abstract validateConfig(): boolean;

  /**
   * 带重试的请求封装
   */
  protected async withRetry<T>(fn: () => Promise<T>, retries?: number): Promise<T> {
    const maxRetries = retries ?? this.config.maxRetries ?? 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.withTimeout(fn);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break;
        }

        // 指数退避重试
        const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
        console.warn(`LLM请求失败，${delay}ms后重试(${attempt}/${maxRetries})...`);
        await this.sleep(delay);
      }
    }

    throw new Error(`LLM请求失败（已重试${maxRetries}次）：${lastError?.message}`);
  }

  /**
   * 带超时的请求封装
   */
  private async withTimeout<T>(fn: () => Promise<T>): Promise<T> {
    const timeout = this.config.timeout ?? 60000;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`LLM请求超时（${timeout}ms）`));
      }, timeout);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * 等待指定时间
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
