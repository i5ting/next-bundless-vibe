#!/usr/bin/env node

const { program } = require('commander');
const { generate, watch } = require('../index');
const path = require('path');

program
  .name('next-bundless')
  .description('将 Next.js 应用转换为 bundleless 模式')
  .version('1.0.0');

program
  .command('generate')
  .description('生成 bundleless 代码')
  .option('-r, --root <path>', '项目根目录', process.cwd())
  .option('-o, --output <path>', '输出目录')
  .option('-q, --quiet', '静默模式')
  .action((options) => {
    const config = {
      projectRoot: path.resolve(options.root),
      verbose: !options.quiet
    };

    if (options.output) {
      config.outputDir = path.resolve(options.output);
    }

    generate(config);
  });

program
  .command('watch')
  .description('启动 watch 模式')
  .option('-r, --root <path>', '项目根目录', process.cwd())
  .option('-o, --output <path>', '输出目录')
  .action((options) => {
    const config = {
      projectRoot: path.resolve(options.root)
    };

    if (options.output) {
      config.outputDir = path.resolve(options.output);
    }

    watch(config);
  });

program.parse();
