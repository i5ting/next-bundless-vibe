#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 递归查找所有路由
 */
function findRoutes(dir, basePath = '') {
  const routes = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
          continue;
        }

        const pageFile = fs.existsSync(path.join(fullPath, 'page.tsx'))
          ? path.join(fullPath, 'page.tsx')
          : fs.existsSync(path.join(fullPath, 'page.js'))
          ? path.join(fullPath, 'page.js')
          : null;

        const routePath = `${basePath}/${entry.name}`;

        if (pageFile) {
          routes.push({
            path: routePath,
            file: pageFile,
            directory: fullPath
          });
        }

        routes.push(...findRoutes(fullPath, routePath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return routes;
}

/**
 * 转换 Next.js 组件为 ESM 模块代码
 */
function transformToESM(componentCode) {
  // 移除 Next.js 特定的导入
  let esmCode = componentCode
    .replace(/import\s+Image\s+from\s+['"]next\/image['"];?\n?/g, '')
    .replace(/import\s+Link\s+from\s+['"]next\/link['"];?\n?/g, '');

  // 替换 Image 组件为 img 标签
  esmCode = esmCode.replace(/<Image\s+/g, '<img ');

  // 替换 Link 组件为 a 标签
  esmCode = esmCode.replace(/<Link\s+/g, '<a ');
  esmCode = esmCode.replace(/<\/Link>/g, '</a>');

  return esmCode;
}

/**
 * 获取组件名称
 */
function getComponentName(componentCode) {
  const match = componentCode.match(/export\s+default\s+function\s+(\w+)/);
  return match ? match[1] : 'Component';
}

/**
 * 生成基于 esm.sh 和 Babel standalone 的 HTML 页面
 */
function generateESMHTML(componentCode, routeName) {
  const esmCode = transformToESM(componentCode);
  const componentName = getComponentName(componentCode);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${routeName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" data-type="module">
    import React from 'https://esm.sh/react@18.3.1';
    import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';

${esmCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<${componentName} />);
  </script>
</body>
</html>`;
}

/**
 * 创建独立的 ESM 文件
 */
function createESMFile(route, outputDir) {
  const componentCode = fs.readFileSync(route.file, 'utf-8');
  const routeName = route.path === '/' ? 'index' : route.path.replace(/^\//, '').replace(/\//g, '-');
  const outputPath = path.join(outputDir, routeName);

  // 创建输出目录
  fs.mkdirSync(outputPath, { recursive: true });

  return { routeName, outputPath, componentCode };
}

/**
 * 主执行函数
 */
function main() {
  const appDir = path.join(process.cwd(), 'app');
  const outputDir = path.join(process.cwd(), 'bundleless');

  console.log('🚀 开始生成基于 esm.sh 的 bundleless React 代码...\n');

  // 查找所有路由
  const routes = [];

  // 检查根路由
  const rootPageFile = fs.existsSync(path.join(appDir, 'page.tsx'))
    ? path.join(appDir, 'page.tsx')
    : fs.existsSync(path.join(appDir, 'page.js'))
    ? path.join(appDir, 'page.js')
    : null;

  if (rootPageFile) {
    routes.push({
      path: '/',
      file: rootPageFile,
      directory: appDir
    });
  }

  routes.push(...findRoutes(appDir));

  if (routes.length === 0) {
    console.log('❌ 没有找到任何路由');
    return;
  }

  console.log(`✅ 找到 ${routes.length} 个路由\n`);

  // 清空并创建输出目录
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  // 为每个路由生成独立文件
  routes.forEach(route => {
    console.log(`📝 处理路由: ${route.path}`);

    const { routeName, outputPath, componentCode } = createESMFile(route, outputDir);

    // 生成 HTML 文件
    const htmlPage = generateESMHTML(componentCode, routeName);
    fs.writeFileSync(path.join(outputPath, 'index.html'), htmlPage);

    // 保存转换后的 JSX 代码
    const esmCode = transformToESM(componentCode);
    fs.writeFileSync(path.join(outputPath, 'component.jsx'), esmCode);

    console.log(`  ✓ 生成到: ${outputPath}`);
    console.log(`  ✓ 文件: index.html, component.jsx\n`);
  });

  console.log(`\n🎉 完成！所有文件已生成到: ${outputDir}`);
  console.log(`\n💡 提示: 直接在浏览器中打开 index.html 文件即可运行 React 应用`);
}

// 执行主函数
main();
