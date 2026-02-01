# next-bundless 测试文档

## 测试框架

使用 **Vitest** 作为测试框架，提供快速、现代化的测试体验。

## 测试覆盖

### 1. route-finder.test.js
测试路由查找功能：
- ✅ 查找所有子目录中的路由
- ✅ 忽略以下划线开头的目录
- ✅ 处理不存在的目录
- ✅ 查找根路由和所有子路由
- ✅ 处理没有根页面的情况

### 2. asset-handler.test.js
测试静态资源处理功能：
- ✅ 查找 src 属性中的绝对路径
- ✅ 查找 href 属性中的绝对路径
- ✅ 忽略外部 URL
- ✅ 从 public 目录复制资源
- ✅ 处理不存在的资源
- ✅ 替换绝对路径为相对路径
- ✅ 替换多个出现的路径

### 3. transformer.test.js
测试代码转换功能：
- ✅ 移除 Next.js Image import
- ✅ 移除 Next.js Link import
- ✅ 替换 Image 为 img 标签
- ✅ 替换 Link 为 a 标签
- ✅ 移除 tailwindcss import
- ✅ 移除 @theme inline 块
- ✅ 提取组件名称
- ✅ 提取 layout body 类名

### 4. generator.test.js
测试生成器核心功能：
- ✅ 使用默认配置
- ✅ 接受自定义配置
- ✅ 生成 bundleless 文件

## 运行测试

### 运行所有测试
```bash
pnpm test
```

### Watch 模式
```bash
pnpm test:watch
```

### UI 模式
```bash
pnpm test:ui
```

### 生成覆盖率报告
```bash
pnpm test:coverage
```

## 测试结果

✅ **26 个测试全部通过**
- 4 个测试文件
- 执行时间：~166ms
- 覆盖核心功能模块

## 测试结构

```
test/
├── route-finder.test.js    # 路由查找测试
├── asset-handler.test.js   # 资源处理测试
├── transformer.test.js     # 代码转换测试
├── generator.test.js       # 生成器测试
├── fixtures/               # 测试夹具目录
└── README.md              # 测试文档
```

## 编写新测试

使用 Vitest 的 API 编写测试：

```javascript
import { describe, it, expect } from 'vitest';

describe('my-module', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```
