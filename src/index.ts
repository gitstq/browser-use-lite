/**
 * browser-use-lite 主入口
 * 导出所有公共API，支持程序化调用
 */

// 核心模块
export { Agent } from './core/agent.js';
export { MemoryManager } from './core/memory.js';
export {
  ActionStatus,
  StepType,
} from './core/types.js';
export type {
  Action,
  ActionResult,
  AgentConfig,
  AgentResult,
  AgentStep,
  DOMElement,
  PageInfo,
  LLMConfig,
  LLMMessage,
  LLMResponse,
  LLMProvider,
} from './core/types.js';
import type { Agent as AgentType } from './core/agent.js';
import type { LLMProvider as LLMProviderType } from './core/types.js';
import type { AgentConfig as AgentConfigType } from './core/types.js';

// 浏览器模块
export { BrowserManager } from './browser/browser-manager.js';
export { DOMExtractor } from './browser/dom-extractor.js';

// 动作模块
export { ActionRegistry } from './actions/registry.js';
export {
  ClickSchema,
  TypeSchema,
  NavigateSchema,
  ScrollSchema,
  WaitSchema,
  GetPageInfoSchema,
  ActionSchemas,
  getSchemaDescriptions,
} from './actions/schema.js';
export type { ActionName } from './actions/schema.js';

// 内置动作
export { clickAction } from './actions/builtins/click.js';
export { typeAction } from './actions/builtins/type.js';
export { navigateAction } from './actions/builtins/navigate.js';
export { scrollAction } from './actions/builtins/scroll.js';

// LLM模块
export { BaseLLM } from './llm/base.js';
export { OpenAILLM, createOpenAILLM } from './llm/openai.js';

// CLI模块
export { runCLI } from './cli/index.js';

/**
 * 库版本号
 */
export const VERSION = '0.1.0';

/**
 * 创建Agent的便捷函数
 */
export async function createAgent(
  llm: LLMProviderType,
  config: AgentConfigType,
): Promise<AgentType> {
  return new (await import('./core/agent.js')).Agent(llm, config);
}
