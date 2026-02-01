const fs = require('fs');
const path = require('path');
const { getAllRoutes } = require('./route-finder');
const { readLayout, readGlobalCSS } = require('../utils/file-reader');
const { findAssetReferences, copyAssets, replaceAssetPaths } = require('./asset-handler');
const { transformToESM } = require('./transformer');
const { generateHTMLWithLayout } = require('./html-generator');

/**
 * 生成器配置
 */
class GeneratorConfig {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.appDir = options.appDir || path.join(this.projectRoot, 'app');
    this.outputDir = options.outputDir || path.join(this.projectRoot, 'bundleless');
    this.verbose = options.verbose !== false;
  }
}

/**
 * Bundleless 生成器
 */
class BundlelessGenerator {
  constructor(config) {
    this.config = config instanceof GeneratorConfig ? config : new GeneratorConfig(config);
  }

  /**
   * 记录日志
   */
  log(message) {
    if (this.config.verbose) {
      console.log(message);
    }
  }

  /**
   * 生成所有路由
   */
  generate() {
    const { appDir, outputDir, projectRoot } = this.config;

    this.log('🚀 开始生成 bundleless React 代码...\n');

    // 读取 layout 和全局 CSS
    const layoutCode = readLayout(appDir);
    const globalCSS = readGlobalCSS(appDir);

    if (!layoutCode) {
      this.log('⚠️  未找到 layout 文件，将使用默认 layout');
    }

    // 查找所有路由
    const routes = getAllRoutes(appDir);

    if (routes.length === 0) {
      this.log('❌ 没有找到任何路由');
      return;
    }

    this.log(`✅ 找到 ${routes.length} 个路由\n`);

    // 清空并创建输出目录
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // 为每个路由生成文件
    routes.forEach(route => {
      this.generateRoute(route, layoutCode, globalCSS, projectRoot, outputDir);
    });

    this.log(`\n🎉 完成！所有文件已生成到: ${outputDir}`);
    this.log(`\n💡 提示: 生成的文件保留了 layout 结构、全局样式，并复制了所有静态资源`);
  }

  /**
   * 生成单个路由
   */
  generateRoute(route, layoutCode, globalCSS, projectRoot, outputDir) {
    this.log(`📝 处理路由: ${route.path}`);

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
      this.log(`  📦 复制了 ${copiedAssets.length} 个静态资源`);
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

    this.log(`  ✓ 生成到: ${routeOutputDir}`);
    this.log(`  ✓ 文件: index.html, component.jsx\n`);
  }
}

module.exports = {
  BundlelessGenerator,
  GeneratorConfig
};
