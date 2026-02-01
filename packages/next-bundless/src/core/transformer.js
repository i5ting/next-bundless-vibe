/**
 * 转换 Next.js 组件为 ESM 模块代码
 * @param {string} componentCode - 组件代码
 * @returns {string} 转换后的 ESM 代码
 */
function transformToESM(componentCode) {
  let esmCode = componentCode
    // 移除 Next.js 特定的 import
    .replace(/import\s+Image\s+from\s+['"]next\/image['"];?\n?/g, '')
    .replace(/import\s+Link\s+from\s+['"]next\/link['"];?\n?/g, '')
    .replace(/import\s+type\s+.*?from\s+['"]next['"];?\n?/g, '')
    .replace(/import\s+.*?from\s+['"]next\/font\/google['"];?\n?/g, '')
    .replace(/import\s+['"]\.\/globals\.css['"];?\n?/g, '')
    // 移除 export default，使其成为普通函数声明
    .replace(/export\s+default\s+function\s+/g, 'function ');

  // 替换 Next.js 组件为标准 HTML 标签
  esmCode = esmCode.replace(/<Image\s+/g, '<img ');
  esmCode = esmCode.replace(/<Link\s+/g, '<a ');
  esmCode = esmCode.replace(/<\/Link>/g, '</a>');

  return esmCode;
}

/**
 * 转换全局 CSS
 * @param {string} cssContent - CSS 内容
 * @returns {string} 转换后的 CSS
 */
function transformCSS(cssContent) {
  return cssContent
    .replace(/@import\s+["']tailwindcss["'];?\n?/g, '')
    .replace(/@theme\s+inline\s*\{[^}]*\}/gs, '');
}

/**
 * 获取组件名称
 * @param {string} componentCode - 组件代码
 * @returns {string} 组件名称
 */
function getComponentName(componentCode) {
  const match = componentCode.match(/export\s+default\s+function\s+(\w+)/);
  return match ? match[1] : 'Component';
}

/**
 * 提取 layout 的 body 类名
 * @param {string} layoutCode - layout 代码
 * @returns {string} body 类名
 */
function extractLayoutBodyClass(layoutCode) {
  const match = layoutCode.match(/className=\{`([^`]+)`\}/);
  if (match) {
    return match[1].replace(/\$\{[^}]+\}/g, '').trim();
  }
  return 'antialiased';
}

module.exports = {
  transformToESM,
  transformCSS,
  getComponentName,
  extractLayoutBodyClass
};
