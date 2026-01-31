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
 * 查找代码中引用的静态资源
 */
function findAssetReferences(code) {
  const assets = new Set();

  // 匹配 src="/xxx" 或 src='/xxx'
  const srcMatches = code.matchAll(/src=["']([^"']+)["']/g);
  for (const match of srcMatches) {
    if (match[1].startsWith('/') && !match[1].startsWith('//')) {
      assets.add(match[1]);
    }
  }

  // 匹配 href="/xxx" 或 href='/xxx'
  const hrefMatches = code.matchAll(/href=["']([^"']+)["']/g);
  for (const match of hrefMatches) {
    if (match[1].startsWith('/') && !match[1].startsWith('//') && !match[1].startsWith('http')) {
      assets.add(match[1]);
    }
  }

  return Array.from(assets);
}

/**
 * 复制静态资源到输出目录
 */
function copyAssets(assetPaths, outputDir, projectRoot) {
  const copiedAssets = [];

  for (const assetPath of assetPaths) {
    // 移除开头的 /
    const relativePath = assetPath.replace(/^\//, '');

    // 尝试从 public 目录查找
    const publicPath = path.join(projectRoot, 'public', relativePath);
    // 尝试从 app 目录查找
    const appPath = path.join(projectRoot, 'app', relativePath);

    let sourcePath = null;
    if (fs.existsSync(publicPath)) {
      sourcePath = publicPath;
    } else if (fs.existsSync(appPath)) {
      sourcePath = appPath;
    }

    if (sourcePath) {
      const destPath = path.join(outputDir, 'assets', relativePath);
      const destDir = path.dirname(destPath);

      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(sourcePath, destPath);

      copiedAssets.push({
        original: assetPath,
        relative: `./assets/${relativePath}`
      });
    }
  }

  return copiedAssets;
}

/**
 * 替换代码中的资源路径为相对路径
 */
function replaceAssetPaths(code, copiedAssets) {
  let updatedCode = code;

  for (const asset of copiedAssets) {
    // 替换所有出现的绝对路径为相对路径
    const regex = new RegExp(asset.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    updatedCode = updatedCode.replace(regex, asset.relative);
  }

  return updatedCode;
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
 * 转换全局 CSS
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
 * 主执行函数
 */
function main() {
  const projectRoot = process.cwd();
  const appDir = path.join(projectRoot, 'app');
  const outputDir = path.join(projectRoot, 'bundleless');

  console.log('🚀 开始生成带静态资源的 bundleless React 代码...\n');

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

    const componentCode = fs.readFileSync(route.file, 'utf-8');
    const routeName = route.path === '/' ? 'index' : route.path.replace(/^\//, '').replace(/\//g, '-');
    const routeOutputDir = path.join(outputDir, routeName);

    fs.mkdirSync(routeOutputDir, { recursive: true });

    // 查找代码中引用的静态资源
    const assetRefs = findAssetReferences(componentCode);
    if (layoutCode) {
      assetRefs.push(...findAssetReferences(layoutCode));
    }

    // 复制静态资源
    const copiedAssets = copyAssets(assetRefs, routeOutputDir, projectRoot);

    if (copiedAssets.length > 0) {
      console.log(`  📦 复制了 ${copiedAssets.length} 个静态资源`);
    }

    // 替换代码中的资源路径
    let updatedComponentCode = replaceAssetPaths(componentCode, copiedAssets);
    let updatedLayoutCode = layoutCode ? replaceAssetPaths(layoutCode, copiedAssets) : '';

    // 生成 HTML 文件
    const htmlPage = generateHTMLWithLayout(updatedComponentCode, updatedLayoutCode, globalCSS, routeName);
    fs.writeFileSync(path.join(routeOutputDir, 'index.html'), htmlPage);

    // 保存转换后的组件代码
    const esmCode = transformToESM(updatedComponentCode);
    fs.writeFileSync(path.join(routeOutputDir, 'component.jsx'), esmCode);

    console.log(`  ✓ 生成到: ${routeOutputDir}`);
    console.log(`  ✓ 文件: index.html, component.jsx\n`);
  });

  console.log(`\n🎉 完成！所有文件已生成到: ${outputDir}`);
  console.log(`\n💡 提示: 生成的文件保留了 layout 结构、全局样式，并复制了所有静态资源`);
}

// 导出生成函数
module.exports = {
  generate: main
};

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}
