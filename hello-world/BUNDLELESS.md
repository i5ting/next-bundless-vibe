# Bundleless React 生成器

这个项目包含一个脚本，可以将 Next.js 路由转换为基于 esm.sh 的独立运行的 React 应用，无需构建工具。

## 功能特点

- ✅ 自动遍历所有 Next.js 路由
- ✅ 生成可独立运行的 React 代码（非静态 HTML）
- ✅ **保留原始的 Layout 结构**
- ✅ **保留全局 CSS 样式（globals.css）**
- ✅ **自动复制静态资源（图片、SVG 等）**
- ✅ **自动转换资源路径为相对路径**
- ✅ 使用 esm.sh CDN 加载 React 和 React-DOM
- ✅ 使用 Babel Standalone 在浏览器中转换 JSX
- ✅ 保留 Tailwind CSS 样式
- ✅ 无需启动 dev 服务器
- ✅ 无需构建步骤，直接在浏览器中运行

## 使用方法

### 生成 bundleless 代码

```bash
npm run generate:bundleless
```

### Watch 模式（自动生成）

```bash
npm run watch:bundleless
```

Watch 模式会监听 `app` 和 `public` 目录的文件变动，自动重新生成 bundleless 代码。按 `Ctrl+C` 退出。

### 查看所有路由

```bash
npm run routes
```

## 生成的文件结构

```
bundleless/
├── index/              # 根路由 (/)
│   ├── index.html      # 可独立运行的 React 应用
│   ├── component.jsx   # 转换后的组件代码
│   └── assets/         # 静态资源目录
│       ├── next.svg    # 复制的图片资源
│       └── vercel.svg  # 复制的图片资源
└── home/               # /home 路由
    ├── index.html      # 可独立运行的 React 应用
    └── component.jsx   # 转换后的组件代码
```

## 技术实现

### 依赖项（通过 CDN 加载）

- **React 18.3.1** - 从 `https://esm.sh/react@18.3.1`
- **React-DOM 18.3.1** - 从 `https://esm.sh/react-dom@18.3.1/client`
- **Babel Standalone** - 从 `https://unpkg.com/@babel/standalone/babel.min.js`
- **Tailwind CSS** - 从 `https://cdn.tailwindcss.com`

### 工作原理

1. 脚本扫描 `app` 目录中的所有路由
2. 读取 `layout.tsx` 和 `globals.css` 文件
3. 读取每个路由的 `page.tsx` 或 `page.js` 文件
4. **查找代码中引用的静态资源（通过 `src` 和 `href` 属性）**
5. **从 `public` 或 `app` 目录复制静态资源到 `bundleless/[route]/assets/` 目录**
6. **将代码中的绝对路径（如 `/next.svg`）替换为相对路径（如 `./assets/next.svg`）**
7. 移除 Next.js 特定的导入（如 `next/image`, `next/link`, `next/font/google`）
8. 保留 layout 的 body 类名（如 `antialiased`）
9. 转换全局 CSS，移除 Tailwind 导入语句
10. 生成包含以下内容的 HTML 文件：
    - 全局 CSS 样式（内联在 `<style>` 标签中）
    - Layout 的 body 类名
    - Babel Standalone 用于转换 JSX
    - 从 esm.sh 导入 React 和 ReactDOM
    - RootLayout 组件包裹页面组件
    - 原始的 React 组件代码（路径已更新）
    - 渲染逻辑

## 运行生成的应用

直接在浏览器中打开任何生成的 `index.html` 文件：

```bash
# 打开 home 路由
open bundleless/home/index.html

# 或者在浏览器中直接打开文件
```

## 注意事项

- 生成的代码适合开发和演示，不建议用于生产环境
- Babel Standalone 会在浏览器中实时转换 JSX，可能影响性能
- 不支持服务端渲染（SSR）
- 不支持 Next.js 特定功能（如路由、图片优化等）

## 脚本位置

- `scripts/generate-with-assets.js` - 生成带 layout 和静态资源的 bundleless 代码（推荐）
- `scripts/generate-with-assets-core.js` - 核心生成模块（可被其他脚本导入）
- `scripts/watch-bundleless.js` - Watch 模式脚本，监听文件变动自动生成
- `scripts/generate-with-layout.js` - 生成带 layout 但不处理静态资源的 bundleless 代码
- `scripts/generate-esm-bundleless.js` - 生成不带 layout 的 bundleless 代码
- `scripts/get-routes.js` - 列出所有路由

## 静态资源处理

脚本会自动处理静态资源：

### 支持的资源类型

- 图片：`.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- 图标：`.ico`
- 其他通过 `src` 或 `href` 属性引用的资源

### 资源查找位置

1. `public/` 目录（Next.js 默认静态资源目录）
2. `app/` 目录（如 `app/favicon.ico`）

### 路径转换示例

```jsx
// 原始代码
<img src="/next.svg" alt="Next.js" />

// 转换后
<img src="./assets/next.svg" alt="Next.js" />
```

生成的文件可以直接在浏览器中打开，所有资源都使用相对路径，无需服务器。

## Watch 模式

Watch 模式可以监听文件变动并自动重新生成 bundleless 代码，非常适合开发时使用。

### 启动 Watch 模式

```bash
npm run watch:bundleless
```

### 监听的目录

- `app/` - 所有路由和组件文件
- `public/` - 静态资源文件

### 工作流程

1. 启动时自动执行一次完整生成
2. 监听文件变动（创建、修改、删除）
3. 检测到变动后自动重新生成
4. 如果正在生成中，会在完成后再次生成
5. 按 `Ctrl+C` 退出 watch 模式

### 使用场景

- 开发时实时预览 bundleless 版本
- 同时运行 `npm run dev` 和 `npm run watch:bundleless`
- 修改代码后自动更新 bundleless 输出

## 生成的 HTML 结构

生成的 HTML 文件包含：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Tailwind CSS CDN -->
  <style>
    /* 全局 CSS 样式（来自 globals.css） */
  </style>
</head>
<body class="antialiased">
  <div id="root"></div>

  <script type="text/babel" data-type="module">
    // Page Component
    // Layout Component (RootLayout)
    // Render with Layout wrapping Page
  </script>
</body>
</html>
```
