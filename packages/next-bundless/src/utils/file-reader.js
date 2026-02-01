const fs = require('fs');
const path = require('path');

/**
 * 读取 layout 文件
 * @param {string} appDir - app 目录路径
 * @returns {string|null} layout 代码或 null
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
 * @param {string} appDir - app 目录路径
 * @returns {string} CSS 内容
 */
function readGlobalCSS(appDir) {
  const cssFile = path.join(appDir, 'globals.css');
  if (fs.existsSync(cssFile)) {
    return fs.readFileSync(cssFile, 'utf-8');
  }
  return '';
}

module.exports = {
  readLayout,
  readGlobalCSS
};
