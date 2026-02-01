import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建简单的 HTTP 服务器
let server;
const PORT = 8888;

test.beforeAll(async () => {
  const bundlelessDir = path.join(__dirname, '..', 'bundleless');

  server = http.createServer((req, res) => {
    let filePath = path.join(bundlelessDir, req.url);

    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.jsx': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
      }[ext] || 'text/plain';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  await new Promise(resolve => server.listen(PORT, resolve));
});

test.afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

test.describe('Bundleless Pages', () => {
  test('should load index page successfully', async ({ page }) => {
    // 捕获控制台错误
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error));

    await page.goto(`http://localhost:${PORT}/index/index.html`);

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查页面标题
    await expect(page).toHaveTitle('index');

    // 等待 React 渲染完成 - 检查是否有内容
    await page.waitForTimeout(3000);

    // 检查 #root 是否有内容
    const rootContent = await page.locator('#root').innerHTML();
    console.log('Root content:', rootContent);

    expect(rootContent.length).toBeGreaterThan(0);
  });

  test('should load home page successfully', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error));

    await page.goto(`http://localhost:${PORT}/home/index.html`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle('home');

    await page.waitForTimeout(3000);
    const rootContent = await page.locator('#root').innerHTML();
    expect(rootContent.length).toBeGreaterThan(0);
  });

  test('should load register page successfully', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error));

    await page.goto(`http://localhost:${PORT}/register/index.html`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle('register');

    await page.waitForTimeout(3000);
    const rootContent = await page.locator('#root').innerHTML();
    expect(rootContent.length).toBeGreaterThan(0);
  });
});
