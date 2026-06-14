#!/usr/bin/env node
/**
 * CLI入口模块
 * 提供命令行接口，支持零配置启动
 * 使用Commander.js解析命令行参数
 */

import { Command } from 'commander';
import { Agent } from '../core/agent.js';
import { OpenAILLM } from '../llm/openai.js';
import { ActionRegistry } from '../actions/registry.js';
import { clickAction } from '../actions/builtins/click.js';
import { typeAction } from '../actions/builtins/type.js';
import { navigateAction } from '../actions/builtins/navigate.js';
import { scrollAction } from '../actions/builtins/scroll.js';

/**
 * 启动CLI
 */
export async function runCLI(): Promise<void> {
  const program = new Command();

  program
    .name('browser-use-lite')
    .description('轻量级AI浏览器自动化代理')
    .version('0.1.0');

  program
    .command('run')
    .description('执行浏览器自动化任务')
    .argument('<task>', '任务描述，例如："搜索今天的新闻"')
    .option('-k, --api-key <key>', 'OpenAI API密钥')
    .option('-m, --model <model>', '模型名称', 'gpt-4o-mini')
    .option('-u, --base-url <url>', 'API基础URL', 'https://api.openai.com/v1')
    .option('-p, --proxy <proxy>', '代理服务器地址（支持中国大陆网络环境）')
    .option('--headless', '启用无头模式', true)
    .option('--no-headless', '禁用无头模式（显示浏览器窗口）')
    .option('--max-steps <n>', '最大执行步数', '10')
    .option('--timeout <ms>', '每步超时时间（毫秒）', '30000')
    .action(async (task: string, options) => {
      // 注册内置动作
      const registry = new ActionRegistry();
      registry.register(clickAction);
      registry.register(typeAction);
      registry.register(navigateAction);
      registry.register(scrollAction);

      // 获取API密钥（优先命令行参数，其次环境变量）
      const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('错误：需要提供OpenAI API密钥（通过--api-key参数或OPENAI_API_KEY环境变量）');
        process.exit(1);
      }

      // 创建LLM实例
      const llm = new OpenAILLM({
        apiKey,
        model: options.model,
        baseURL: options.baseUrl,
        proxy: options.proxy,
      });

      // 创建Agent配置
      const agentConfig = {
        task,
        maxSteps: parseInt(options.maxSteps, 10),
        stepTimeout: parseInt(options.timeout, 10),
        headless: options.headless,
        proxyServer: options.proxy,
        model: options.model,
        apiKey,
        baseURL: options.baseUrl,
      };

      // 创建并运行Agent
      const agent = new Agent(llm, agentConfig);

      console.log(`\n========================================`);
      console.log(`任务：${task}`);
      console.log(`模型：${options.model}`);
      console.log(`代理：${options.proxy ?? '无'}`);
      console.log(`========================================\n`);

      try {
        const result = await agent.run();

        console.log('\n========================================');
        if (result.success) {
          console.log('任务执行成功！');
          if (result.finalAnswer) {
            console.log(`答案：${result.finalAnswer}`);
          }
        } else {
          console.log('任务执行失败');
          if (result.error) {
            console.log(`错误：${result.error}`);
          }
        }
        console.log(`总步数：${result.steps.length}`);
        console.log('========================================');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`执行出错：${message}`);
        process.exit(1);
      }
    });

  // 添加示例命令
  program
    .command('example')
    .description('运行示例任务')
    .option('-k, --api-key <key>', 'OpenAI API密钥')
    .option('-p, --proxy <proxy>', '代理服务器地址')
    .action(async (options) => {
      const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('错误：需要提供OpenAI API密钥');
        process.exit(1);
      }

      console.log('运行示例：访问百度并搜索"browser-use-lite"');

      const llm = new OpenAILLM({
        apiKey,
        model: 'gpt-4o-mini',
        proxy: options.proxy,
      });

      const agent = new Agent(llm, {
        task: '访问百度（https://www.baidu.com），搜索"browser-use-lite"，返回搜索结果中的第一条标题',
        maxSteps: 8,
        headless: false,
        proxyServer: options.proxy,
      });

      const result = await agent.run();

      if (result.success) {
        console.log(`\n示例执行成功！`);
        console.log(`答案：${result.finalAnswer ?? '无'}`);
      } else {
        console.log(`\n示例执行失败：${result.error ?? '未知错误'}`);
      }
    });

  await program.parseAsync(process.argv);
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI().catch((error) => {
    console.error('CLI错误：', error);
    process.exit(1);
  });
}
