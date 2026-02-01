# next-bundless

[![Tests](https://img.shields.io/badge/tests-30%20passed-brightgreen)](https://github.com/your-repo/next-bundless)
[![Coverage](https://img.shields.io/badge/coverage-77.62%25-yellow)](https://github.com/your-repo/next-bundless)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://github.com/your-repo/next-bundless)

将 Next.js 应用转换为 bundleless 模式的工具。

## 功能特性

- 🚀 将 Next.js 组件转换为独立的 HTML 文件
- 📦 自动处理静态资源引用
- 🎨 保留 layout 结构和全局样式
- 👀 支持 watch 模式，实时监听文件变化
- 🔄 自动转换 Next.js 特定组件（Image, Link 等）

## 安装

```bash
pnpm install next-bundless
```

## 使用方法

### 命令行工具

#### 生成 bundleless 代码

```bash
# 在项目根目录运行
next-bundless generate

# 指定项目根目录
next-bundless generate --root /path/to/project

# 指定输出目录
next-bundless generate --output /path/to/output

# 静默模式
next-bundless generate --quiet
```

#### 启动 watch 模式

```bash
# 在项目根目录运行
next-bundless watch

# 指定项目根目录
next-bundless watch --root /path/to/project

# 指定输出目录
next-bundless watch --output /path/to/output
```

### 编程式 API

```javascript
const { generate, watch, createGenerator } = require('next-bundless');

// 生成一次
generate({
  projectRoot: '/path/to/project',
  outputDir: '/path/to/output',
  verbose: true
});

// 启动 watch 模式
watch({
  projectRoot: '/path/to/project',
  outputDir: '/path/to/output'
});

// 使用生成器类
const generator = createGenerator({
  projectRoot: '/path/to/project'
});
generator.generate();
```

## 配置选项

### GeneratorConfig

- `projectRoot`: 项目根目录（默认：`process.cwd()`）
- `appDir`: app 目录路径（默认：`{projectRoot}/app`）
- `outputDir`: 输出目录（默认：`{projectRoot}/bundleless`）
- `verbose`: 是否显示详细日志（默认：`true`）

### WatchConfig

- `projectRoot`: 项目根目录（默认：`process.cwd()`）
- `appDir`: app 目录路径（默认：`{projectRoot}/app`）
- `publicDir`: public 目录路径（默认：`{projectRoot}/public`）
- `debounceDelay`: 防抖延迟（毫秒，默认：`100`）

## 项目结构

```
packages/next-bundless/
├── src/
│   ├── core/
│   │   ├── generator.js       # 核心生成器
│   │   ├── watcher.js         # 文件监听器
│   │   ├── route-finder.js    # 路由查找
│   │   ├── asset-handler.js   # 资源处理
│   │   ├── transformer.js     # 代码转换
│   │   └── html-generator.js  # HTML 生成
│   ├── utils/
│   │   └── file-reader.js     # 文件读取工具
│   ├── cli/
│   │   └── index.js           # CLI 入口
│   └── index.js               # 主入口
├── test/
│   ├── route-finder.test.js
│   ├── asset-handler.test.js
│   ├── transformer.test.js
│   ├── generator.test.js
│   └── cli.integration.test.js
├── package.json
└── README.md
```

## 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# Watch 模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 测试覆盖率

| 文件 | 语句 | 分支 | 函数 | 行数 |
|------|------|------|------|------|
| **总计** | 77.62% | 63.38% | 77.77% | 77.62% |
| core/ | 77.27% | 66.66% | 75% | 77.27% |
| utils/ | 81.81% | 37.5% | 100% | 81.81% |

### 测试套件

- ✅ **30 个测试** 全部通过
- ✅ **5 个测试文件**
  - route-finder.test.js (5 tests)
  - asset-handler.test.js (8 tests)
  - transformer.test.js (10 tests)
  - generator.test.js (3 tests)
  - cli.integration.test.js (4 tests)

## 开发

### 安装依赖

```bash
pnpm install
```

### 开发脚本

```bash
# 运行测试
pnpm test

# Watch 模式测试
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 构建（生成 bundleless 代码）
pnpm build

# 开发模式（watch）
pnpm dev
```

## 技术栈

- **Node.js** - 运行时环境
- **Commander** - CLI 框架
- **Vitest** - 测试框架
- **@vitest/coverage-v8** - 覆盖率工具

## License

ISC



