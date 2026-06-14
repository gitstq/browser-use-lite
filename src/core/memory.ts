/**
 * 上下文记忆管理模块
 * 负责管理Agent执行过程中的上下文记忆，包括：
 * - 历史步骤记录
 * - 页面状态快照
 * - 关键信息提取
 */

import { StepType, type AgentStep, type PageInfo, type DOMElement } from './types.js';

/**
 * 记忆管理器配置
 */
interface MemoryConfig {
  /** 最大记忆步数，超过则压缩 */
  maxSteps: number;
  /** 压缩阈值 */
  compressionThreshold: number;
}

/**
 * 页面状态快照
 */
interface PageSnapshot {
  url: string;
  title: string;
  timestamp: number;
  elementCount: number;
}

/**
 * 上下文记忆管理器
 */
export class MemoryManager {
  private steps: AgentStep[] = [];
  private snapshots: PageSnapshot[] = [];
  private importantElements: Map<number, DOMElement> = new Map();
  private config: MemoryConfig;

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      maxSteps: config?.maxSteps ?? 20,
      compressionThreshold: config?.compressionThreshold ?? 15,
    };
  }

  /**
   * 添加执行步骤到记忆
   */
  addStep(step: AgentStep): void {
    this.steps.push(step);

    // 当步骤数超过阈值时，进行记忆压缩
    if (this.steps.length > this.config.compressionThreshold) {
      this.compressMemory();
    }
  }

  /**
   * 获取所有步骤
   */
  getSteps(): readonly AgentStep[] {
    return this.steps;
  }

  /**
   * 获取最近N个步骤
   */
  getRecentSteps(count: number): AgentStep[] {
    return this.steps.slice(-count);
  }

  /**
   * 获取步骤数量
   */
  getStepCount(): number {
    return this.steps.length;
  }

  /**
   * 保存页面快照
   */
  saveSnapshot(pageInfo: PageInfo): void {
    const snapshot: PageSnapshot = {
      url: pageInfo.url,
      title: pageInfo.title,
      timestamp: Date.now(),
      elementCount: pageInfo.interactiveElements.length,
    };
    this.snapshots.push(snapshot);

    // 限制快照数量
    if (this.snapshots.length > 10) {
      this.snapshots = this.snapshots.slice(-10);
    }
  }

  /**
   * 获取所有快照
   */
  getSnapshots(): readonly PageSnapshot[] {
    return this.snapshots;
  }

  /**
   * 记录重要元素
   */
  markImportantElement(element: DOMElement): void {
    this.importantElements.set(element.index, element);
  }

  /**
   * 获取重要元素
   */
  getImportantElements(): DOMElement[] {
    return Array.from(this.importantElements.values());
  }

  /**
   * 生成上下文摘要（用于LLM提示）
   */
  buildContextPrompt(): string {
    const parts: string[] = [];

    // 添加历史步骤
    if (this.steps.length > 0) {
      parts.push('=== 历史执行记录 ===');
      const recentSteps = this.getRecentSteps(10);
      for (const step of recentSteps) {
        const time = new Date(step.timestamp).toLocaleTimeString('zh-CN');
        parts.push(`[${time}] ${step.type}: ${step.content}`);
      }
      parts.push('');
    }

    // 添加页面历史
    if (this.snapshots.length > 0) {
      parts.push('=== 页面访问历史 ===');
      const recentSnapshots = this.snapshots.slice(-5);
      for (const snap of recentSnapshots) {
        parts.push(`- ${snap.title} (${snap.url})`);
      }
      parts.push('');
    }

    // 添加重要元素
    const important = this.getImportantElements();
    if (important.length > 0) {
      parts.push('=== 重要元素 ===');
      for (const el of important.slice(-5)) {
        parts.push(`- [${el.index}] ${el.tag}: ${el.text.slice(0, 50)}`);
      }
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * 记忆压缩：将早期步骤压缩为摘要
   */
  private compressMemory(): void {
    if (this.steps.length <= this.config.maxSteps) {
      return;
    }

    // 保留最近的步骤，将早期步骤压缩
    const keepCount = Math.floor(this.config.maxSteps / 2);
    const earlySteps = this.steps.slice(0, -keepCount);
    const recentSteps = this.steps.slice(-keepCount);

    // 生成早期步骤的摘要
    const actionCount = earlySteps.filter((s) => s.type === 'action').length;
    const thoughtCount = earlySteps.filter((s) => s.type === 'thought').length;

    const summary: AgentStep = {
      type: StepType.Thought,
      content: `[记忆压缩] 之前已执行 ${actionCount} 个动作，产生 ${thoughtCount} 个思考步骤。`,
      timestamp: earlySteps[earlySteps.length - 1]?.timestamp ?? Date.now(),
    };

    this.steps = [summary, ...recentSteps];
  }

  /**
   * 清空所有记忆
   */
  clear(): void {
    this.steps = [];
    this.snapshots = [];
    this.importantElements.clear();
  }

  /**
   * 导出记忆为JSON（用于调试）
   */
  exportToJSON(): string {
    return JSON.stringify(
      {
        steps: this.steps,
        snapshots: this.snapshots,
        importantElements: Array.from(this.importantElements.values()),
      },
      null,
      2,
    );
  }
}
