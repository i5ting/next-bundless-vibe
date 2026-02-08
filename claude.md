# Claude Code 开发指南

## 项目概述

这是一个 Next.js Bundleless 项目，展示了如何在不使用传统打包工具的情况下运行 React 应用。

## 项目结构

```
next-bundless/
├── hello-world/          # Next.js 示例应用
│   ├── app/             # Next.js App Router
│   ├── bundleless/      # Bundleless 页面
│   │   ├── index/       # 首页
│   │   ├── home/        # Home 页面
│   │   └── register/    # 注册页面
│   └── tests/           # Playwright 测试
├── playground/          # React Bundleless Playground
│   ├── index.html       # 交互式代码编辑器
│   └── README.md        # Playground 说明文档
└── packages/            # Monorepo 包

```

## Bundleless 概念

Bundleless 是一种无需打包工具的开发方式，直接在浏览器中运行模块化代码。

### 优势

- **快速开发**: 无需等待打包过程
- **即时反馈**: 代码修改立即生效
- **简单部署**: 直接部署 HTML 文件
- **学习友好**: 降低前端开发门槛

### 技术栈

- **React 18**: 使用 UMD 版本通过 CDN 加载
- **Babel Standalone**: 浏览器端 JSX 转换
- **Tailwind CSS**: 通过 CDN 加载的样式框架
- **ESM**: 原生 ES 模块支持

## Playground 使用指南

### 功能特性

1. **页面选择器**: 从下拉菜单选择不同的 bundleless 页面
2. **代码编辑器**: 实时编辑 JSX 代码
3. **实时预览**: 即时查看运行效果
4. **模块查看器**: 显示页面加载的所有模块依赖
5. **新标签页打开**: 在独立窗口中运行应用
6. **下载 HTML**: 导出完整的独立 HTML 文件

### 快捷键

- `Ctrl/Cmd + Enter`: 运行代码

### 可用页面

- **/index**: Next.js 默认首页样式
- **/home**: 简单的 Hello World 页面
- **/register**: 用户注册表单页面

## 开发最佳实践

### 1. 组件开发

```jsx
// 使用函数组件和 Hooks
function MyComponent() {
  const [state, setState] = React.useState(initialValue);

  return (
    <div className="container">
      {/* 使用 Tailwind CSS 类名 */}
    </div>
  );
}
```

### 2. 样式处理

```jsx
// 推荐使用 Tailwind CSS
<div className="flex items-center justify-center bg-blue-500">
  Content
</div>

// 或使用内联样式
<div style={{ display: 'flex', padding: '20px' }}>
  Content
</div>
```

### 3. 模块依赖

当前支持的模块：
- React (UMD)
- ReactDOM (UMD)
- Babel Standalone (Compiler)
- Tailwind CSS (CSS Framework)

### 4. 渲染方式

```jsx
// 使用 ReactDOM.render 渲染到 preview 容器
ReactDOM.render(<App />, document.getElementById('preview'));
```

## 测试

项目使用 Playwright 进行端到端测试。

### 运行测试

```bash
cd hello-world
npm test
```

### 测试覆盖

- Bundleless 页面加载测试
- 组件渲染测试
- 用户交互测试

## Git 工作流

### 提交规范

```bash
# 功能添加
git commit -m "Add feature: description"

# Bug 修复
git commit -m "Fix: description"

# 文档更新
git commit -m "Docs: description"

# 样式调整
git commit -m "Style: description"

# 重构
git commit -m "Refactor: description"
```

### 推送到远程

```bash
git push origin main
```

## 常见问题

### Q: 为什么使用 UMD 而不是 ESM？

A: 为了更好的浏览器兼容性和简化开发流程。UMD 模块可以直接通过 `<script>` 标签加载。

### Q: 如何添加新的页面？

A:
1. 在 `hello-world/bundleless/` 下创建新目录
2. 添加 `component.jsx` 和 `index.html`
3. 在 playground 的 `bundlelessPages` 对象中添加页面代码
4. 在下拉选择器中添加选项

### Q: 如何调试代码？

A:
1. 使用浏览器开发者工具
2. 在代码中添加 `console.log()`
3. 使用 React DevTools 扩展

## 性能优化

### 1. CDN 缓存

所有外部依赖都通过 CDN 加载，利用浏览器缓存提升性能。

### 2. 代码分割

每个页面独立加载，避免不必要的代码加载。

### 3. 懒加载

可以使用 React.lazy 和 Suspense 实现组件懒加载。

## 部署

### 静态部署

Playground 是纯静态页面，可以部署到：
- GitHub Pages
- Vercel
- Netlify
- 任何静态文件服务器

### 部署步骤

1. 将 `playground/index.html` 上传到服务器
2. 确保服务器支持 HTTPS（某些 CDN 资源需要）
3. 访问部署的 URL

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请提交 Issue。

---

最后更新: 2026-02-08
