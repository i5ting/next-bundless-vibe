const fs = require('fs');
const path = require('path');

/**
 * 递归查找所有路由
 * @param {string} dir - 要搜索的目录
 * @param {string} basePath - 基础路径
 * @returns {Array} 路由数组
 */
function findRoutes(dir, basePath = '') {
  const routes = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // 忽略以 _ 或 . 开头的目录
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
          continue;
        }

        // 查找 page 文件
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

        // 递归查找子目录
        routes.push(...findRoutes(fullPath, routePath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return routes;
}

/**
 * 获取所有路由（包括根路由）
 * @param {string} appDir - app 目录路径
 * @returns {Array} 所有路由数组
 */
function getAllRoutes(appDir) {
  const routes = [];

  // 查找根路由
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

  // 查找子路由
  routes.push(...findRoutes(appDir));

  return routes;
}

module.exports = {
  findRoutes,
  getAllRoutes
};
