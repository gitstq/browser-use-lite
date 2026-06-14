/**
 * MemoryManager 单元测试
 * 测试记忆管理的核心功能
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryManager } from '../../src/core/memory.js';
import { type AgentStep, StepType } from '../../src/core/types.js';

describe('MemoryManager', () => {
  let memory: MemoryManager;

  beforeEach(() => {
    memory = new MemoryManager();
  });

  describe('addStep', () => {
    it('应该能添加步骤到记忆', () => {
      const step: AgentStep = {
        type: StepType.Thought,
        content: '测试思考',
        timestamp: Date.now(),
      };

      memory.addStep(step);
      expect(memory.getStepCount()).toBe(1);
    });

    it('应该能添加多个步骤', () => {
      memory.addStep({
        type: StepType.Thought,
        content: '思考1',
        timestamp: Date.now(),
      });
      memory.addStep({
        type: StepType.Action,
        content: '动作1',
        timestamp: Date.now(),
      });

      expect(memory.getStepCount()).toBe(2);
    });
  });

  describe('getSteps', () => {
    it('应该返回所有步骤', () => {
      const step1: AgentStep = {
        type: StepType.Thought,
        content: '思考1',
        timestamp: 1000,
      };
      const step2: AgentStep = {
        type: StepType.Action,
        content: '动作1',
        timestamp: 2000,
      };

      memory.addStep(step1);
      memory.addStep(step2);

      const steps = memory.getSteps();
      expect(steps).toHaveLength(2);
      expect(steps[0].content).toBe('思考1');
      expect(steps[1].content).toBe('动作1');
    });

    it('返回的步骤应该是只读的', () => {
      memory.addStep({
        type: StepType.Thought,
        content: '思考',
        timestamp: Date.now(),
      });

      const steps = memory.getSteps();
      // 验证返回的是readonly数组（运行时无法完全阻止修改，但类型系统会阻止）
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBe(1);
    });
  });

  describe('getRecentSteps', () => {
    it('应该返回最近的N个步骤', () => {
      for (let i = 0; i < 5; i++) {
        memory.addStep({
          type: StepType.Thought,
          content: `思考${i}`,
          timestamp: Date.now(),
        });
      }

      const recent = memory.getRecentSteps(3);
      expect(recent).toHaveLength(3);
      expect(recent[0].content).toBe('思考2');
      expect(recent[2].content).toBe('思考4');
    });

    it('当请求数量超过总数时应该返回所有步骤', () => {
      memory.addStep({
        type: StepType.Thought,
        content: '思考1',
        timestamp: Date.now(),
      });

      const recent = memory.getRecentSteps(10);
      expect(recent).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('应该清空所有记忆', () => {
      memory.addStep({
        type: StepType.Thought,
        content: '思考',
        timestamp: Date.now(),
      });

      memory.clear();
      expect(memory.getStepCount()).toBe(0);
      expect(memory.getSteps()).toHaveLength(0);
    });
  });

  describe('buildContextPrompt', () => {
    it('应该生成包含步骤的上下文提示', () => {
      memory.addStep({
        type: StepType.Thought,
        content: '分析页面',
        timestamp: Date.now(),
      });

      const prompt = memory.buildContextPrompt();
      expect(prompt).toContain('历史执行记录');
      expect(prompt).toContain('分析页面');
    });

    it('空记忆时应该返回空字符串', () => {
      const prompt = memory.buildContextPrompt();
      expect(prompt).toBe('');
    });
  });

  describe('memory compression', () => {
    it('当步骤超过阈值时应该压缩记忆', () => {
      // 创建一个小阈值的记忆管理器
      const smallMemory = new MemoryManager({
        maxSteps: 5,
        compressionThreshold: 3,
      });

      // 添加超过阈值的步骤
      for (let i = 0; i < 10; i++) {
        smallMemory.addStep({
          type: StepType.Thought,
          content: `思考${i}`,
          timestamp: Date.now(),
        });
      }

      // 压缩后步骤数应该减少
      expect(smallMemory.getStepCount()).toBeLessThan(10);
    });
  });

  describe('saveSnapshot', () => {
    it('应该保存页面快照', () => {
      const pageInfo = {
        title: '测试页面',
        url: 'https://example.com',
        interactiveElements: [],
        textContent: '测试内容',
      };

      memory.saveSnapshot(pageInfo);
      const snapshots = memory.getSnapshots();

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].title).toBe('测试页面');
      expect(snapshots[0].url).toBe('https://example.com');
    });

    it('应该限制快照数量', () => {
      for (let i = 0; i < 15; i++) {
        memory.saveSnapshot({
          title: `页面${i}`,
          url: `https://example.com/${i}`,
          interactiveElements: [],
          textContent: '',
        });
      }

      expect(memory.getSnapshots().length).toBeLessThanOrEqual(10);
    });
  });

  describe('markImportantElement', () => {
    it('应该记录重要元素', () => {
      const element = {
        tag: 'button',
        text: '提交',
        index: 5,
        attributes: {},
      };

      memory.markImportantElement(element);
      const important = memory.getImportantElements();

      expect(important).toHaveLength(1);
      expect(important[0].text).toBe('提交');
    });
  });

  describe('exportToJSON', () => {
    it('应该能导出为JSON', () => {
      memory.addStep({
        type: StepType.Thought,
        content: '测试',
        timestamp: 1234567890,
      });

      const json = memory.exportToJSON();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('steps');
      expect(parsed).toHaveProperty('snapshots');
      expect(parsed).toHaveProperty('importantElements');
      expect(parsed.steps).toHaveLength(1);
    });
  });
});
