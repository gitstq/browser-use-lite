#!/usr/bin/env tsx
/**
 * 基础搜索示例
 * 演示如何使用 browser-use-lite 执行简单的搜索任务
 *
 * 运行方式：
 *   npx tsx examples/basic-search.ts
 * 或：
 *   OPENAI_API_KEY=your-key npx tsx examples/basic-search.ts
 */

import { clickAction } from '../src/actions/builtins/click.js';
import { navigateAction } from '../src/actions/builtins/navigate.js';
import { scrollAction } from '../src/actions/builtins/scroll.js';
import { typeAction } from '../src/actions/builtins/type.js';
import { ActionRegistry } from '../src/actions/registry.js';
import { Agent } from '../src/core/agent.js';
import { OpenAILLM } from '../src/llm/openai.js';

/**
 * 运行基础搜索示例
 */
async function runBasicSearch(): Promise<void> {
  // 从环境变量获取API密钥
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('请设置 OPENAI_API_KEY 环境变量');
    console.error('例如：OPENAI_API_KEY=your-key npx tsx examples/basic-search.ts');
    process.exit(1);
  }

  // 注册所有内置动作
  const registry = new ActionRegistry();
  registry.register(clickAction);
  registry.register(typeAction);
  registry.register(navigateAction);
  registry.register(scrollAction);

  console.log('已注册动作：', registry.getNames().join(', '));

  // 创建LLM实例
  // 如果使用国内代理，可以设置 baseURL 和 proxy
  const llm = new OpenAILLM({
    apiKey,
    model: 'gpt-4o-mini',
    // baseURL: 'https://api.openai.com/v1', // 国内用户可替换为代理地址
    // proxy: 'http://127.0.0.1:7890', // 如果需要代理
  });

  // 创建Agent配置
  const agentConfig = {
    task: '访问百度（https://www.baidu.com），在搜索框中输入"browser-use-lite"，点击搜索按钮，返回搜索结果页面的标题',
    maxSteps: 10,
    stepTimeout: 30000,
    headless: false, // 设置为false以显示浏览器窗口，方便观察
    // proxyServer: 'http://127.0.0.1:7890', // 如果需要代理
  };

  // 创建Agent
  const agent = new Agent(llm, agentConfig);

  console.log('\n========================================');
  console.log('任务：', agentConfig.task);
  console.log('最大步数：', agentConfig.maxSteps);
  console.log('无头模式：', agentConfig.headless);
  console.log('========================================\n');

  try {
    // 执行任务
    const result = await agent.run();

    console.log('\n========================================');
    console.log('执行结果：');
    console.log('成功：', result.success);

    if (result.finalAnswer) {
      console.log('答案：', result.finalAnswer);
    }

    if (result.error) {
      console.log('错误：', result.error);
    }

    console.log('\n执行步骤：');
    for (const step of result.steps) {
      const time = new Date(step.timestamp).toLocaleTimeString('zh-CN');
      console.log(
        `[${time}] ${step.type}: ${step.content.slice(0, 100)}${step.content.length > 100 ? '...' : ''}`,
      );
    }

    console.log('========================================');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('执行出错：', message);
    process.exit(1);
  }
}

// 运行示例
runBasicSearch();
