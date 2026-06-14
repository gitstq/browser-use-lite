/**
 * Agent 单元测试
 * 测试ReAct Agent的核心功能
 * 使用mock来模拟浏览器和LLM
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Agent } from '../../src/core/agent.js';
import { OpenAILLM } from '../../src/llm/openai.js';
import { StepType, ActionStatus } from '../../src/core/types.js';
import type { LLMProvider, LLMResponse, AgentConfig, PageInfo } from '../../src/core/types.js';

// 创建Mock LLM提供者
function createMockLLM(responses: string[]): LLMProvider {
  let callIndex = 0;
  return {
    chat: vi.fn().mockImplementation(async () => {
      const content = responses[callIndex++] ?? '思考：任务已完成\n动作：{"name": "wait", "args": {}}';
      return {
        content,
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      } as LLMResponse;
    }),
    validateConfig: vi.fn().mockReturnValue(true),
  };
}

// Mock 浏览器管理器
vi.mock('../../src/browser/browser-manager.js', () => ({
  BrowserManager: vi.fn().mockImplementation(() => ({
    launch: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    getPage: vi.fn().mockReturnValue({
      evaluate: vi.fn().mockResolvedValue([]),
      title: vi.fn().mockResolvedValue('测试页面'),
      url: vi.fn().mockResolvedValue('https://example.com'),
    }),
    navigate: vi.fn().mockResolvedValue(undefined),
    isLaunched: vi.fn().mockReturnValue(true),
  })),
}));

// Mock DOM提取器
vi.mock('../../src/browser/dom-extractor.js', () => ({
  DOMExtractor: vi.fn().mockImplementation(() => ({
    extract: vi.fn().mockResolvedValue({
      title: '测试页面',
      url: 'https://example.com',
      interactiveElements: [],
      textContent: '测试内容',
    } as PageInfo),
    findElementByIndex: vi.fn().mockResolvedValue('#test'),
    isElementVisible: vi.fn().mockResolvedValue(true),
    getElementPosition: vi.fn().mockResolvedValue({ x: 100, y: 100 }),
  })),
}));

describe('Agent', () => {
  let mockLLM: LLMProvider;
  let agentConfig: AgentConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    agentConfig = {
      task: '测试任务',
      maxSteps: 5,
      headless: true,
    };
  });

  describe('run', () => {
    it('应该能完成简单任务', async () => {
      mockLLM = createMockLLM([
        '思考：我需要访问页面\n动作：{"name": "navigate", "args": {"url": "https://example.com"}}',
        '思考：页面已加载，任务完成\n[完成] 测试成功',
      ]);

      const agent = new Agent(mockLLM, agentConfig);
      const result = await agent.run();

      expect(result.success).toBe(true);
      expect(result.finalAnswer).toBe('测试成功');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('应该在达到最大步数时停止', async () => {
      mockLLM = createMockLLM([
        '思考：继续执行\n动作：{"name": "wait", "args": {"duration": 100}}',
      ]);

      const agent = new Agent(mockLLM, {
        ...agentConfig,
        maxSteps: 3,
      });

      const result = await agent.run();

      expect(result.success).toBe(false);
      expect(result.error).toContain('最大步数');
    });

    it('应该记录所有执行步骤', async () => {
      mockLLM = createMockLLM([
        '思考：第一步\n动作：{"name": "navigate", "args": {"url": "https://example.com"}}',
        '思考：第二步\n动作：{"name": "wait", "args": {"duration": 500}}',
        '[完成] 任务完成',
      ]);

      const agent = new Agent(mockLLM, agentConfig);
      const result = await agent.run();

      // 验证步骤类型
      const thoughtSteps = result.steps.filter((s) => s.type === StepType.Thought);
      expect(thoughtSteps.length).toBeGreaterThan(0);
    });

    it('应该处理LLM调用失败', async () => {
      mockLLM = {
        chat: vi.fn().mockRejectedValue(new Error('网络错误')),
        validateConfig: vi.fn().mockReturnValue(true),
      };

      const agent = new Agent(mockLLM, agentConfig);
      const result = await agent.run();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该处理动作执行失败', async () => {
      mockLLM = createMockLLM([
        '思考：尝试点击\n动作：{"name": "click", "args": {"index": 999}}',
        '[完成] 尽管有错误，任务完成',
      ]);

      const agent = new Agent(mockLLM, agentConfig);
      const result = await agent.run();

      // 即使动作失败，Agent也应该继续尝试
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });

  describe('配置选项', () => {
    it('应该使用自定义配置', async () => {
      mockLLM = createMockLLM(['[完成] 配置测试']);

      const customConfig: AgentConfig = {
        task: '自定义任务',
        maxSteps: 10,
        stepTimeout: 5000,
        headless: false,
        proxyServer: 'http://127.0.0.1:7890',
        model: 'gpt-4',
        apiKey: 'test-key',
        baseURL: 'https://custom.api.com',
      };

      const agent = new Agent(mockLLM, customConfig);
      const result = await agent.run();

      expect(result.success).toBe(true);
    });

    it('应该支持代理配置', async () => {
      mockLLM = createMockLLM(['[完成] 代理测试']);

      const agent = new Agent(mockLLM, {
        ...agentConfig,
        proxyServer: 'http://127.0.0.1:7890',
      });

      const result = await agent.run();
      expect(result.success).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该优雅处理浏览器启动失败', async () => {
      // 覆盖mock，模拟启动失败
      const { BrowserManager } = await import('../../src/browser/browser-manager.js');
      vi.mocked(BrowserManager).mockImplementationOnce(() => ({
        launch: vi.fn().mockRejectedValue(new Error('浏览器启动失败')),
        close: vi.fn().mockResolvedValue(undefined),
        getPage: vi.fn().mockReturnValue(null),
        navigate: vi.fn(),
        isLaunched: vi.fn().mockReturnValue(false),
      } as unknown as import('../../src/browser/browser-manager.js').BrowserManager));

      mockLLM = createMockLLM([]);
      const agent = new Agent(mockLLM, agentConfig);
      const result = await agent.run();

      expect(result.success).toBe(false);
      expect(result.error).toContain('浏览器启动失败');
    });
  });
});

describe('Agent 与真实LLM集成', () => {
  it('OpenAILLM应该能正确配置', () => {
    const llm = new OpenAILLM({
      apiKey: 'test-key',
      model: 'gpt-4o-mini',
      baseURL: 'https://api.openai.com/v1',
    });

    expect(llm.validateConfig()).toBe(true);
  });

  it('OpenAILLM应该检测无效配置', () => {
    const llm = new OpenAILLM({
      apiKey: '',
      model: '',
    });

    expect(llm.validateConfig()).toBe(false);
  });
});
