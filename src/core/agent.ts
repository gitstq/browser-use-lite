/**
 * ReAct循环主控模块
 * 实现ReAct（Reasoning + Acting）循环，是Agent的核心大脑：
 * 1. Thought: 基于当前状态进行推理
 * 2. Action: 执行浏览器动作
 * 3. Observation: 观察执行结果
 * 循环直到任务完成或达到最大步数
 */

import { ActionRegistry } from '../actions/registry.js';
import { BrowserManager } from '../browser/browser-manager.js';
import { DOMExtractor } from '../browser/dom-extractor.js';
import type { LLMProvider } from '../llm/base.js';
import { MemoryManager } from './memory.js';
import {
  ActionStatus,
  type AgentConfig,
  type AgentResult,
  type PageInfo,
  StepType,
} from './types.js';

/**
 * ReAct Agent主控类
 */
export class Agent {
  private memory: MemoryManager;
  private browser: BrowserManager;
  private domExtractor: DOMExtractor;
  private actionRegistry: ActionRegistry;
  private llm: LLMProvider;
  private config: Required<AgentConfig>;

  constructor(llm: LLMProvider, config: AgentConfig) {
    this.llm = llm;
    this.config = {
      maxSteps: config.maxSteps ?? 10,
      stepTimeout: config.stepTimeout ?? 30000,
      headless: config.headless ?? true,
      proxyServer: config.proxyServer ?? '',
      model: config.model ?? 'gpt-4o-mini',
      apiKey: config.apiKey ?? '',
      baseURL: config.baseURL ?? '',
      task: config.task,
      browserArgs: config.browserArgs ?? [],
      viewport: config.viewport ?? { width: 1280, height: 720 },
    };

    this.memory = new MemoryManager({ maxSteps: this.config.maxSteps });
    this.browser = new BrowserManager({
      headless: this.config.headless,
      proxyServer: this.config.proxyServer,
      args: this.config.browserArgs,
      viewport: this.config.viewport,
    });
    this.domExtractor = new DOMExtractor();
    this.actionRegistry = new ActionRegistry();
  }

  /**
   * 启动Agent执行任务
   */
  async run(): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // 初始化浏览器
      await this.browser.launch();
      this.log('浏览器已启动');

      // 记录任务目标
      this.memory.addStep({
        type: StepType.Thought,
        content: `任务目标：${this.config.task}`,
        timestamp: startTime,
      });

      // ReAct主循环
      for (let step = 0; step < this.config.maxSteps; step++) {
        this.log(`\n--- 第 ${step + 1} 步 ---`);

        // 1. 获取当前页面状态
        const pageInfo = await this.observe();

        // 2. 思考下一步
        const thought = await this.think(pageInfo);
        if (!thought) {
          return this.buildResult(false, '思考过程出错');
        }

        // 检查是否完成任务
        if (thought.includes('[完成]')) {
          const answer = thought.split('[完成]')[1]?.trim() ?? '';
          this.memory.addStep({
            type: StepType.Thought,
            content: `任务完成：${answer}`,
            timestamp: Date.now(),
          });
          return this.buildResult(true, undefined, answer);
        }

        // 3. 执行动作
        const actionResult = await this.act(thought, pageInfo);

        // 检查动作结果
        if (actionResult.status === ActionStatus.Failure) {
          this.log(`动作执行失败：${actionResult.message}`);
          // 记录失败但继续尝试
          this.memory.addStep({
            type: StepType.Observation,
            content: `执行失败：${actionResult.message}`,
            timestamp: Date.now(),
          });
        }

        // 检查是否超时
        if (Date.now() - startTime > this.config.stepTimeout * this.config.maxSteps) {
          return this.buildResult(false, '执行超时');
        }
      }

      return this.buildResult(false, '达到最大步数限制');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`执行出错：${errorMessage}`);
      return this.buildResult(false, errorMessage);
    } finally {
      // 确保浏览器关闭
      await this.browser.close();
      this.log('浏览器已关闭');
    }
  }

  /**
   * Observation: 观察当前页面状态
   */
  private async observe(): Promise<PageInfo> {
    const page = this.browser.getPage();
    if (!page) {
      throw new Error('页面未初始化');
    }

    const pageInfo = await this.domExtractor.extract(page);
    this.memory.saveSnapshot(pageInfo);

    this.memory.addStep({
      type: StepType.Observation,
      content: `当前页面：${pageInfo.title} (${pageInfo.url})，发现 ${pageInfo.interactiveElements.length} 个可交互元素`,
      timestamp: Date.now(),
    });

    return pageInfo;
  }

  /**
   * Thought: 基于当前状态进行推理
   */
  private async think(pageInfo: PageInfo): Promise<string | null> {
    const prompt = this.buildThinkPrompt(pageInfo);

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: `你是一个浏览器自动化助手。你的任务是通过分析页面状态，决定下一步操作。
可用动作：${this.actionRegistry.getActionDescriptions()}
请按以下格式回复：
1. 思考：分析当前状态和目标
2. 动作：选择动作和参数（JSON格式）
如果任务已完成，请回复"[完成] 答案"
如果无法继续，请回复"[失败] 原因"`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const content = response.content;
      this.memory.addStep({
        type: StepType.Thought,
        content,
        timestamp: Date.now(),
      });

      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`LLM调用失败：${errorMessage}`);
      return null;
    }
  }

  /**
   * Action: 执行浏览器动作
   */
  private async act(
    thought: string,
    pageInfo: PageInfo,
  ): Promise<{
    status: ActionStatus;
    message: string;
  }> {
    const page = this.browser.getPage();
    if (!page) {
      return { status: ActionStatus.Failure, message: '页面未初始化' };
    }

    // 从思考内容中提取动作和参数
    const actionCall = this.parseActionCall(thought);
    if (!actionCall) {
      // 如果没有提取到动作，可能是思考步骤或已完成
      return { status: ActionStatus.Skip, message: '无需执行动作' };
    }

    const { actionName, args } = actionCall;
    const action = this.actionRegistry.get(actionName);

    if (!action) {
      return { status: ActionStatus.Failure, message: `未知动作：${actionName}` };
    }

    // 添加页面信息到参数
    const enrichedArgs = {
      ...args,
      pageInfo,
    };

    try {
      const result = await action.execute(page, enrichedArgs);

      this.memory.addStep({
        type: StepType.Action,
        content: `执行 ${actionName}：${result.message}`,
        timestamp: Date.now(),
      });

      return { status: result.status, message: result.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { status: ActionStatus.Failure, message: errorMessage };
    }
  }

  /**
   * 构建思考提示词
   */
  private buildThinkPrompt(pageInfo: PageInfo): string {
    const parts: string[] = [];

    // 任务目标
    parts.push(`任务目标：${this.config.task}`);
    parts.push('');

    // 上下文记忆
    const context = this.memory.buildContextPrompt();
    if (context) {
      parts.push(context);
    }

    // 当前页面状态
    parts.push('=== 当前页面状态 ===');
    parts.push(`标题：${pageInfo.title}`);
    parts.push(`URL：${pageInfo.url}`);
    parts.push('');

    // 可交互元素
    if (pageInfo.interactiveElements.length > 0) {
      parts.push('=== 可交互元素 ===');
      for (const el of pageInfo.interactiveElements.slice(0, 20)) {
        const text = el.text.slice(0, 50).replace(/\n/g, ' ');
        parts.push(`[${el.index}] ${el.tag}${el.id ? `#${el.id}` : ''}: ${text}`);
      }
      parts.push('');
    }

    // 页面文本摘要
    parts.push('=== 页面文本 ===');
    parts.push(pageInfo.textContent.slice(0, 500));
    parts.push('');

    // 指令
    parts.push('请分析当前状态，决定下一步操作。');
    parts.push('回复格式：');
    parts.push('思考：...');
    parts.push('动作：{"name": "动作名", "args": {...}}');

    return parts.join('\n');
  }

  /**
   * 从LLM回复中解析动作调用
   */
  private parseActionCall(
    thought: string,
  ): { actionName: string; args: Record<string, unknown> } | null {
    // 尝试匹配JSON格式的动作
    const jsonMatch = thought.match(/动作[:：]\s*(\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]) as { name: string; args?: Record<string, unknown> };
        return {
          actionName: parsed.name,
          args: parsed.args ?? {},
        };
      } catch {
        // JSON解析失败，继续尝试其他格式
      }
    }

    // 尝试匹配简写格式：动作名(参数)
    const simpleMatch = thought.match(/(\w+)\s*\(([^)]*)\)/);
    if (simpleMatch) {
      return {
        actionName: simpleMatch[1],
        args: {},
      };
    }

    return null;
  }

  /**
   * 构建执行结果
   */
  private buildResult(success: boolean, error?: string, finalAnswer?: string): AgentResult {
    return {
      success,
      steps: [...this.memory.getSteps()],
      finalAnswer,
      error,
    };
  }

  /**
   * 日志输出
   */
  private log(message: string): void {
    // eslint-disable-next-line no-console
    console.log(`[Agent] ${message}`);
  }
}
