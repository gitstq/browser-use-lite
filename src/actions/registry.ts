/**
 * 动作注册中心模块
 * 管理所有浏览器动作的注册、查找和执行
 * 采用插件化设计，支持动态注册自定义动作
 */

import type { Action } from '../core/types.js';

/**
 * 动作注册中心
 * 单例模式管理所有可用动作
 */
export class ActionRegistry {
  private actions: Map<string, Action> = new Map();
  private static instance: ActionRegistry | null = null;

  constructor() {
    // 注册内置动作
    this.registerBuiltins();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ActionRegistry {
    if (!ActionRegistry.instance) {
      ActionRegistry.instance = new ActionRegistry();
    }
    return ActionRegistry.instance;
  }

  /**
   * 注册动作
   */
  register(action: Action): void {
    if (this.actions.has(action.name)) {
      console.warn(`动作 "${action.name}" 已存在，将被覆盖`);
    }
    this.actions.set(action.name, action);
  }

  /**
   * 批量注册动作
   */
  registerMany(actions: Action[]): void {
    for (const action of actions) {
      this.register(action);
    }
  }

  /**
   * 获取动作
   */
  get(name: string): Action | undefined {
    return this.actions.get(name);
  }

  /**
   * 检查动作是否存在
   */
  has(name: string): boolean {
    return this.actions.has(name);
  }

  /**
   * 获取所有动作名称
   */
  getNames(): string[] {
    return Array.from(this.actions.keys());
  }

  /**
   * 获取所有动作
   */
  getAll(): Action[] {
    return Array.from(this.actions.values());
  }

  /**
   * 获取动作描述信息（用于LLM提示）
   */
  getActionDescriptions(): string {
    const descriptions: string[] = [];

    for (const action of this.actions.values()) {
      descriptions.push(`${action.name}: ${action.description}`);
    }

    return descriptions.join('\n');
  }

  /**
   * 获取动作的JSON Schema描述（用于LLM结构化输出）
   */
  getActionSchemas(): Record<string, unknown> {
    const schemas: Record<string, unknown> = {};

    for (const [name, action] of this.actions) {
      schemas[name] = action.parameters;
    }

    return schemas;
  }

  /**
   * 注销动作
   */
  unregister(name: string): boolean {
    return this.actions.delete(name);
  }

  /**
   * 清空所有动作
   */
  clear(): void {
    this.actions.clear();
  }

  /**
   * 注册内置动作
   * 动态导入以避免循环依赖
   */
  private registerBuiltins(): void {
    // 使用动态导入注册内置动作
    // 实际注册在模块加载时完成
    this.lazyRegisterBuiltins();
  }

  /**
   * 懒加载注册内置动作
   */
  private lazyRegisterBuiltins(): void {
    // 为了避免循环依赖，使用延迟加载
    // 实际的内置动作会在应用启动时通过import注册
    try {
      // 动态导入内置动作模块
      import('./builtins/click.js').then((m) => {
        if (m.clickAction) this.register(m.clickAction);
      });
      import('./builtins/type.js').then((m) => {
        if (m.typeAction) this.register(m.typeAction);
      });
      import('./builtins/navigate.js').then((m) => {
        if (m.navigateAction) this.register(m.navigateAction);
      });
      import('./builtins/scroll.js').then((m) => {
        if (m.scrollAction) this.register(m.scrollAction);
      });
    } catch {
      // 动态导入失败时静默处理
      // 用户可以通过手动注册来补充
    }
  }
}
