const fs = require('fs');
const path = require('path');

/**
 * 查找代码中引用的静态资源
 * @param {string} code - 代码内容
 * @returns {Array} 资源路径数组
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
 * @param {Array} assetPaths - 资源路径数组
 * @param {string} outputDir - 输出目录
 * @param {string} projectRoot - 项目根目录
 * @returns {Array} 已复制的资源信息
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
 * @param {string} code - 代码内容
 * @param {Array} copiedAssets - 已复制的资源信息
 * @returns {string} 更新后的代码
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

module.exports = {
  findAssetReferences,
  copyAssets,
  replaceAssetPaths
};
