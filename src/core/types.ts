/**
 * 核心类型定义
 * 定义了整个系统使用的基础类型、枚举和接口
 */

import type { Page } from 'puppeteer';

/**
 * 动作执行结果状态
 */
export enum ActionStatus {
  Success = 'success',
  Failure = 'failure',
  Retry = 'retry',
  Skip = 'skip',
}

/**
 * 动作执行结果
 */
export interface ActionResult {
  status: ActionStatus;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * 动作定义接口
 * 所有浏览器动作都需要实现此接口
 */
export interface Action {
  /** 动作唯一标识名称 */
  name: string;
  /** 动作描述 */
  description: string;
  /** 动作参数Schema（用于LLM理解和验证） */
  parameters: Record<string, unknown>;
  /** 执行动作 */
  execute(page: Page, args: Record<string, unknown>): Promise<ActionResult>;
}

/**
 * 代理步骤类型
 */
export enum StepType {
  Thought = 'thought',
  Action = 'action',
  Observation = 'observation',
}

/**
 * 代理执行步骤
 */
export interface AgentStep {
  type: StepType;
  content: string;
  timestamp: number;
}

/**
 * 代理配置选项
 */
export interface AgentConfig {
  /** 最大执行步数 */
  maxSteps?: number;
  /** 每步超时时间（毫秒） */
  stepTimeout?: number;
  /** 是否启用无头模式 */
  headless?: boolean;
  /** 代理服务器地址（支持中国大陆网络环境） */
  proxyServer?: string;
  /** LLM模型名称 */
  model?: string;
  /** LLM API密钥 */
  apiKey?: string;
  /** LLM API基础URL */
  baseURL?: string;
  /** 任务目标描述 */
  task: string;
  /** 浏览器启动参数 */
  browserArgs?: string[];
  /** 视口配置 */
  viewport?: { width: number; height: number };
}

/**
 * 代理执行结果
 */
export interface AgentResult {
  success: boolean;
  steps: AgentStep[];
  finalAnswer?: string;
  error?: string;
}

/**
 * DOM元素信息
 */
export interface DOMElement {
  /** 元素标签名 */
  tag: string;
  /** 元素文本内容 */
  text: string;
  /** 元素ID */
  id?: string;
  /** 元素class */
  className?: string;
  /** 元素在页面中的索引 */
  index: number;
  /** 元素属性 */
  attributes: Record<string, string>;
  /** 元素位置信息 */
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * 提取的页面信息
 */
export interface PageInfo {
  /** 页面标题 */
  title: string;
  /** 页面URL */
  url: string;
  /** 可交互元素列表 */
  interactiveElements: DOMElement[];
  /** 页面文本内容摘要 */
  textContent: string;
}

/**
 * LLM消息角色
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * LLM消息
 */
export interface LLMMessage {
  role: MessageRole;
  content: string;
}

/**
 * LLM配置
 */
export interface LLMConfig {
  /** API密钥 */
  apiKey: string;
  /** API基础URL */
  baseURL?: string;
  /** 模型名称 */
  model: string;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 请求超时（毫秒） */
  timeout?: number;
  /** 代理地址 */
  proxy?: string;
}

/**
 * LLM响应
 */
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * LLM提供者接口
 */
export interface LLMProvider {
  /** 发送消息到LLM */
  chat(messages: LLMMessage[]): Promise<LLMResponse>;
  /** 验证配置 */
  validateConfig(): boolean;
}
