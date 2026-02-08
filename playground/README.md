# React Bundleless Playground

一个交互式的 React Bundleless 测试环境，可以在浏览器中直接编写和运行 React 代码，无需任何构建工具。

## 功能特性

- 🎨 **实时编辑** - 在左侧编辑器中编写 JSX 代码
- 👁️ **即时预览** - 右侧实时显示运行结果
- 💾 **导出 HTML** - 一键下载为独立的 HTML 文件
- 📚 **内置示例** - 包含计数器、待办事项、表单、数据获取等示例
- ⌨️ **快捷键支持** - Ctrl/Cmd + Enter 快速运行代码
- 🎯 **零依赖** - 直接在浏览器中运行，无需安装任何工具

## 快速开始

### 方式 1: 直接打开

```bash
# 在浏览器中打开
open playground/index.html

# 或者使用 Python 启动本地服务器
cd playground
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

### 方式 2: 使用 Live Server

如果你使用 VS Code，可以安装 Live Server 插件，然后右键点击 `index.html` 选择 "Open with Live Server"。

## 使用说明

### 编写代码

在左侧编辑器中编写 React 代码：

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>计数: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('preview'));
```

### 运行代码

- 点击 "▶️ 运行代码" 按钮
- 或使用快捷键 `Ctrl + Enter` (Windows/Linux) 或 `Cmd + Enter` (Mac)

### 下载 HTML

点击 "💾 下载 HTML" 按钮，将当前代码导出为独立的 HTML 文件，可以直接在浏览器中打开运行。

### 加载示例

点击底部的示例按钮，快速加载预设的示例代码：

- **计数器** - 基础的状态管理示例
- **待办事项** - 列表渲染和状态更新
- **表单** - 表单处理和受控组件
- **数据获取** - 异步数据请求示例

## 技术栈

- **React 18** - 使用 UMD 版本，无需构建
- **Babel Standalone** - 浏览器端 JSX 转换
- **原生 JavaScript** - 无需任何框架或构建工具

## 示例代码

### 计数器

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>计数器: {count}</h2>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

ReactDOM.render(<Counter />, document.getElementById('preview'));
```

### 使用 Hooks

```jsx
function Timer() {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>运行时间: {seconds} 秒</div>;
}

ReactDOM.render(<Timer />, document.getElementById('preview'));
```

## 注意事项

1. **渲染目标** - 必须使用 `document.getElementById('preview')` 作为渲染目标
2. **React API** - 使用 `React.useState`、`React.useEffect` 等全局 API
3. **样式** - 推荐使用内联样式或 style 对象
4. **导入** - 不支持 ES6 import，使用全局的 React 和 ReactDOM

## 与 Next Bundless 的关系

这个 Playground 展示了 bundleless 的核心理念：

- ✅ 无需构建步骤
- ✅ 直接在浏览器中运行
- ✅ 使用 UMD 版本的 React
- ✅ 浏览器端 JSX 转换

这正是 `next-bundless` 工具生成的 HTML 文件的工作方式。

## 扩展功能

你可以轻松扩展这个 Playground：

- 添加更多示例
- 集成其他 React 库（如 React Router）
- 添加代码格式化功能
- 支持保存到本地存储
- 添加代码分享功能

## License

ISC
