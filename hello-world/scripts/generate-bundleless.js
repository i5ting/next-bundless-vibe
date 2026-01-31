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
 * 转换 Next.js 组件为独立的 HTML 文件
 */
function generateStandaloneHTML(componentCode, routePath) {
  // 移除 Next.js 特定的导入
  let cleanCode = componentCode
    .replace(/import\s+.*?from\s+['"]next\/.*?['"];?\n?/g, '')
    .replace(/import\s+.*?from\s+['"]react['"];?\n?/g, '');

  // 提取组件函数
  const componentMatch = cleanCode.match(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{([\s\S]*?)}\s*$/);

  if (!componentMatch) {
    console.error(`Cannot parse component in ${routePath}`);
    return null;
  }

  const jsxContent = componentMatch[1].trim();

  return jsxContent;
}

/**
 * 创建独立的 HTML 文件
 */
function createStandaloneFile(route, outputDir) {
  const componentCode = fs.readFileSync(route.file, 'utf-8');
  const jsxContent = generateStandaloneHTML(componentCode, route.path);

  if (!jsxContent) {
    return false;
  }

  // 转换 JSX className 为 class
  const htmlContent = jsxContent
    .replace(/className=/g, 'class=')
    .replace(/return\s*\(/g, '')
    .replace(/\);?\s*$/g, '')
    .trim();

  const routeName = route.path === '/' ? 'index' : route.path.replace(/^\//, '').replace(/\//g, '-');
  const outputPath = path.join(outputDir, routeName);

  // 创建输出目录
  fs.mkdirSync(outputPath, { recursive: true });

  return { routeName, outputPath, htmlContent };
}

/**
 * 生成完整的 HTML 页面
 */
function generateHTMLPage(htmlContent, routeName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${routeName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

/**
 * 主执行函数
 */
function main() {
  const appDir = path.join(process.cwd(), 'app');
  const outputDir = path.join(process.cwd(), 'project', 'bundleless');

  console.log('🚀 开始生成独立运行的代码...\n');

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

    const result = createStandaloneFile(route, outputDir);

    if (!result) {
      console.log(`  ⚠️  跳过 (无法解析)\n`);
      return;
    }

    const { routeName, outputPath, htmlContent } = result;

    // 生成 HTML 文件
    const htmlPage = generateHTMLPage(htmlContent, routeName);
    fs.writeFileSync(path.join(outputPath, 'index.html'), htmlPage);

    // 复制原始组件代码
    fs.writeFileSync(path.join(outputPath, 'component.tsx'), fs.readFileSync(route.file, 'utf-8'));

    console.log(`  ✓ 生成到: ${outputPath}`);
    console.log(`  ✓ 文件: index.html, component.tsx\n`);
  });

  console.log(`\n🎉 完成！所有文件已生成到: ${outputDir}`);
}

// 执行主函数
main();
