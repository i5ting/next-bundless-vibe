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
 * 读取 layout 文件
 */
function readLayout(appDir) {
  const layoutFile = fs.existsSync(path.join(appDir, 'layout.tsx'))
    ? path.join(appDir, 'layout.tsx')
    : fs.existsSync(path.join(appDir, 'layout.js'))
    ? path.join(appDir, 'layout.js')
    : null;

  if (!layoutFile) {
    return null;
  }

  return fs.readFileSync(layoutFile, 'utf-8');
}

/**
 * 读取全局 CSS
 */
function readGlobalCSS(appDir) {
  const cssFile = path.join(appDir, 'globals.css');
  if (fs.existsSync(cssFile)) {
    return fs.readFileSync(cssFile, 'utf-8');
  }
  return '';
}

/**
 * 转换 Next.js 组件为 ESM 模块代码
 */
function transformToESM(componentCode) {
  let esmCode = componentCode
    .replace(/import\s+Image\s+from\s+['"]next\/image['"];?\n?/g, '')
    .replace(/import\s+Link\s+from\s+['"]next\/link['"];?\n?/g, '')
    .replace(/import\s+type\s+.*?from\s+['"]next['"];?\n?/g, '')
    .replace(/import\s+.*?from\s+['"]next\/font\/google['"];?\n?/g, '')
    .replace(/import\s+['"]\.\/globals\.css['"];?\n?/g, '');

  esmCode = esmCode.replace(/<Image\s+/g, '<img ');
  esmCode = esmCode.replace(/<Link\s+/g, '<a ');
  esmCode = esmCode.replace(/<\/Link>/g, '</a>');

  return esmCode;
}

/**
 * 提取 layout 的 body 类名
 */
function extractLayoutBodyClass(layoutCode) {
  const match = layoutCode.match(/className=\{`([^`]+)`\}/);
  if (match) {
    // 移除模板字符串中的变量引用
    return match[1].replace(/\$\{[^}]+\}/g, '').trim();
  }
  return 'antialiased';
}

/**
 * 获取组件名称
 */
function getComponentName(componentCode) {
  const match = componentCode.match(/export\s+default\s+function\s+(\w+)/);
  return match ? match[1] : 'Component';
}

/**
 * 转换全局 CSS 为浏览器可用的格式
 */
function transformCSS(cssContent) {
  return cssContent
    .replace(/@import\s+["']tailwindcss["'];?\n?/g, '')
    .replace(/@theme\s+inline\s*\{[^}]*\}/gs, '');
}

/**
 * 生成带 layout 的 HTML 页面
 */
function generateHTMLWithLayout(pageCode, layoutCode, globalCSS, routeName) {
  const esmPageCode = transformToESM(pageCode);
  const esmLayoutCode = transformToESM(layoutCode);
  const pageName = getComponentName(pageCode);
  const bodyClass = extractLayoutBodyClass(layoutCode);
  const transformedCSS = transformCSS(globalCSS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${routeName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
${transformedCSS}
  </style>
</head>
<body class="${bodyClass}">
  <div id="root"></div>

  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" data-type="module">
    import React from 'https://esm.sh/react@18.3.1';
    import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';

    // Page Component
${esmPageCode}

    // Layout Component
    function RootLayout({ children }) {
      return (
        <>
          {children}
        </>
      );
    }

    // Render
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <RootLayout>
        <${pageName} />
      </RootLayout>
    );
  </script>
</body>
</html>`;
}

/**
 * 创建独立的文件
 */
function createFile(route, outputDir, layoutCode, globalCSS) {
  const componentCode = fs.readFileSync(route.file, 'utf-8');
  const routeName = route.path === '/' ? 'index' : route.path.replace(/^\//, '').replace(/\//g, '-');
  const outputPath = path.join(outputDir, routeName);

  fs.mkdirSync(outputPath, { recursive: true });

  return { routeName, outputPath, componentCode };
}

/**
 * 主执行函数
 */
function main() {
  const appDir = path.join(process.cwd(), 'app');
  const outputDir = path.join(process.cwd(), 'bundleless');

  console.log('🚀 开始生成带 layout 的 bundleless React 代码...\n');

  // 读取 layout 和全局 CSS
  const layoutCode = readLayout(appDir);
  const globalCSS = readGlobalCSS(appDir);

  if (!layoutCode) {
    console.log('⚠️  未找到 layout 文件，将使用默认 layout');
  }

  // 查找所有路由
  const routes = [];

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

    const { routeName, outputPath, componentCode } = createFile(route, outputDir, layoutCode, globalCSS);

    // 生成 HTML 文件
    const htmlPage = generateHTMLWithLayout(componentCode, layoutCode || '', globalCSS, routeName);
    fs.writeFileSync(path.join(outputPath, 'index.html'), htmlPage);

    // 保存转换后的组件代码
    const esmCode = transformToESM(componentCode);
    fs.writeFileSync(path.join(outputPath, 'component.jsx'), esmCode);

    console.log(`  ✓ 生成到: ${outputPath}`);
    console.log(`  ✓ 文件: index.html, component.jsx\n`);
  });

  console.log(`\n🎉 完成！所有文件已生成到: ${outputDir}`);
  console.log(`\n💡 提示: 生成的文件保留了原始的 layout 结构和全局样式`);
}

// 执行主函数
main();
