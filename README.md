# Next Bundless

[![Tests](https://img.shields.io/badge/tests-30%20passed-brightgreen)](https://github.com/i5ting/next-bundless-vibe)
[![Coverage](https://img.shields.io/badge/coverage-77.62%25-yellow)](https://github.com/i5ting/next-bundless-vibe)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://github.com/i5ting/next-bundless-vibe)

将 Next.js 应用转换为 bundleless 模式的工具，无需构建即可运行 React 应用。

## 什么是 Bundleless？

Bundleless 模式允许你在不启动 Next.js 开发服务器的情况下，将 Next.js 应用转换为可以直接在浏览器中运行的独立 HTML 文件。每个路由都会生成一个独立的 HTML 文件，包含完整的 React 代码和样式，可以直接通过浏览器打开运行。

### 核心特性

- 🚀 **零构建运行** - 生成的 HTML 文件可直接在浏览器中打开
- 📦 **自动资源处理** - 自动复制和处理静态资源（图片、字体等）
- 🎨 **保留布局结构** - 保持 Next.js 的 layout 结构和全局样式
- 🔄 **组件转换** - 自动转换 Next.js 特定组件（Image、Link 等）
- 👀 **实时监听** - Watch 模式支持文件变化自动重新生成
- 🧪 **完整测试** - 包含单元测试和 E2E 测试

## 项目结构

```
next-bundless/
├── packages/
│   └── next-bundless/          # 核心工具包
│       ├── src/
│       │   ├── core/           # 核心功能模块
│       │   ├── utils/          # 工具函数
│       │   ├── cli/            # 命令行工具
│       │   └── index.js        # 主入口
│       └── test/               # 单元测试
├── hello-world/                # 示例应用
│   ├── app/                    # Next.js 应用
│   ├── bundleless/             # 生成的 bundleless 文件
│   └── tests/                  # E2E 测试
└── pnpm-workspace.yaml         # Monorepo 配置
```

## 快速开始

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 基本使用

#### 1. 生成 Bundleless 文件

```bash
# 进入示例项目目录
cd hello-world

# 生成 bundleless 文件
pnpm generate:bundleless
```

生成的文件将输出到 `hello-world/bundleless/` 目录，每个路由对应一个独立的 HTML 文件。

#### 2. 运行生成的文件

直接在浏览器中打开生成的 HTML 文件：

```bash
# 使用浏览器打开
open bundleless/index/index.html
open bundleless/home/index.html
open bundleless/register/index.html
```

#### 3. Watch 模式（开发时使用）

```bash
# 启动 watch 模式，自动监听文件变化
pnpm watch:bundleless
```

## 使用 CLI 工具

### 安装 next-bundless 包

```bash
cd packages/next-bundless
pnpm install
pnpm link --global
```

### CLI 命令

#### 生成命令

```bash
# 在 Next.js 项目根目录运行
next-bundless generate

# 指定项目根目录
next-bundless generate --root /path/to/project

# 指定输出目录
next-bundless generate --output /path/to/output

# 静默模式
next-bundless generate --quiet
```

#### Watch 命令

```bash
# 启动 watch 模式
next-bundless watch

# 指定项目根目录
next-bundless watch --root /path/to/project

# 指定输出目录
next-bundless watch --output /path/to/output
```

## 编程式 API

### 基本用法

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

### 配置选项

#### GeneratorConfig

- `projectRoot`: 项目根目录（默认：`process.cwd()`）
- `appDir`: app 目录路径（默认：`{projectRoot}/app`）
- `outputDir`: 输出目录（默认：`{projectRoot}/bundleless`）
- `verbose`: 是否显示详细日志（默认：`true`）

#### WatchConfig

- `projectRoot`: 项目根目录（默认：`process.cwd()`）
- `appDir`: app 目录路径（默认：`{projectRoot}/app`）
- `publicDir`: public 目录路径（默认：`{projectRoot}/public`）
- `debounceDelay`: 防抖延迟（毫秒，默认：`100`）

## 工作原理

### 转换流程

1. **路由发现** - 扫描 Next.js `app` 目录，识别所有路由
2. **组件读取** - 读取每个路由的 `page.jsx` 和 `layout.jsx` 文件
3. **代码转换** - 转换 Next.js 特定组件为标准 React 组件
4. **资源处理** - 复制静态资源并更新引用路径
5. **HTML 生成** - 生成包含完整 React 代码的独立 HTML 文件

### 组件转换规则

- `<Image>` → `<img>` - Next.js Image 组件转换为标准 img 标签
- `<Link>` → `<a>` - Next.js Link 组件转换为标准 a 标签
- 移除 `export default` - 转换为普通函数声明
- ESM 导入 → UMD - 使用 React UMD 版本替代 ESM 导入

## 测试

### 运行测试

```bash
# 运行所有单元测试
cd packages/next-bundless
pnpm test

# Watch 模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
cd hello-world
pnpm test

# E2E 测试 UI 模式
pnpm test:ui
```

### 测试覆盖率

| 文件 | 语句 | 分支 | 函数 | 行数 |
|------|------|------|------|------|
| **总计** | 77.62% | 63.38% | 77.77% | 77.62% |
| core/ | 77.27% | 66.66% | 75% | 77.27% |
| utils/ | 81.81% | 37.5% | 100% | 81.81% |

### 测试套件

- ✅ **30 个单元测试** 全部通过
- ✅ **5 个测试文件**
  - route-finder.test.js (5 tests)
  - asset-handler.test.js (8 tests)
  - transformer.test.js (10 tests)
  - generator.test.js (3 tests)
  - cli.integration.test.js (4 tests)
- ✅ **Playwright E2E 测试** - 测试生成的 bundleless 文件

## 开发指南

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/i5ting/next-bundless-vibe.git
cd next-bundless

# 安装依赖
pnpm install

# 链接本地包
cd packages/next-bundless
pnpm link --global
```

### 开发脚本

```bash
# 在 packages/next-bundless 目录
pnpm test              # 运行单元测试
pnpm test:watch        # Watch 模式测试
pnpm test:coverage     # 生成覆盖率报告

# 在 hello-world 目录
pnpm dev               # 启动 Next.js 开发服务器
pnpm generate:bundleless  # 生成 bundleless 文件
pnpm watch:bundleless     # Watch 模式
pnpm test              # 运行 E2E 测试
```

### 核心模块说明

#### Generator (核心生成器)
负责协调整个转换流程，调用其他模块完成路由发现、代码转换和文件生成。

#### Watcher (文件监听器)
监听 `app` 和 `public` 目录的文件变化，自动触发重新生成。

#### RouteFinder (路由查找)
扫描 Next.js `app` 目录，识别所有有效路由。

#### AssetHandler (资源处理)
处理静态资源的复制和路径转换。

#### Transformer (代码转换)
转换 Next.js 特定语法为标准 React 代码。

#### HTMLGenerator (HTML 生成)
生成包含完整 React 代码的独立 HTML 文件。

## 示例项目

### Hello World 应用

`hello-world` 目录包含一个完整的 Next.js 示例应用，展示了如何使用 next-bundless。

**路由结构：**
- `/` - 首页
- `/home` - 主页
- `/register` - 注册页面

**运行示例：**

```bash
cd hello-world

# 启动 Next.js 开发服务器
pnpm dev

# 生成 bundleless 文件
pnpm generate:bundleless

# 在浏览器中打开生成的文件
open bundleless/index/index.html
```

## 技术栈

### 核心依赖
- **Node.js** - 运行时环境
- **Commander** - CLI 框架
- **React 18** - UI 框架（UMD 版本）
- **Babel Standalone** - 浏览器端 JSX 转换

### 开发依赖
- **Vitest** - 单元测试框架
- **@vitest/coverage-v8** - 代码覆盖率工具
- **Playwright** - E2E 测试框架
- **pnpm** - 包管理器

## 限制与注意事项

### 当前限制

- 仅支持 Next.js App Router（不支持 Pages Router）
- 不支持服务端渲染（SSR）和服务端组件（RSC）
- 不支持 API 路由
- 不支持动态路由参数
- 静态资源必须放在 `public` 目录

### 适用场景

✅ **适合：**
- 静态展示页面
- 原型演示
- 教学示例
- 离线文档
- 简单的单页应用

❌ **不适合：**
- 需要 SSR 的应用
- 复杂的数据交互
- 需要后端 API 的应用
- 生产环境部署

## 常见问题

### 为什么需要 Bundleless？

Bundleless 模式允许你快速预览和分享 React 组件，无需复杂的构建流程。生成的 HTML 文件可以直接在浏览器中打开，非常适合原型演示和教学场景。

### 生成的文件可以部署吗？

可以，但不推荐用于生产环境。生成的文件适合用于演示、原型和教学，但缺少生产环境所需的优化（如代码分割、压缩等）。

### 如何处理样式？

工具会自动提取和内联 Tailwind CSS 样式。如果使用其他 CSS 方案，需要确保样式被正确内联到 HTML 中。

### 支持哪些 Next.js 版本？

目前支持 Next.js 13+ 的 App Router 模式。

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 提交 Issue

如果你发现 bug 或有功能建议，请在 GitHub 上提交 issue。

### 提交 Pull Request

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发规范

- 遵循现有代码风格
- 为新功能添加测试
- 更新相关文档
- 确保所有测试通过

## 路线图

- [ ] 支持更多 Next.js 组件转换
- [ ] 支持动态路由
- [ ] 优化生成的代码体积
- [ ] 支持更多样式方案
- [ ] 添加更多配置选项
- [ ] 改进错误处理和日志

## 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Babel Standalone](https://babeljs.io/docs/babel-standalone)
- [Vitest 文档](https://vitest.dev)
- [Playwright 文档](https://playwright.dev)

## License

ISC

## 作者

Created with ❤️ by the Next Bundless team

