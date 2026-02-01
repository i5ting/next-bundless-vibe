import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CLI Integration Tests', () => {
  const testDir = path.join(__dirname, 'fixtures', 'cli-test');
  const appDir = path.join(testDir, 'app');
  const outputDir = path.join(testDir, 'bundleless');
  const cliPath = path.join(__dirname, '..', 'src', 'cli', 'index.js');

  beforeEach(() => {
    // 创建测试项目结构
    fs.mkdirSync(appDir, { recursive: true });

    // 创建根页面
    fs.writeFileSync(
      path.join(appDir, 'page.tsx'),
      `export default function Home() {
  return <div>Home Page</div>;
}`
    );

    // 创建 layout
    fs.writeFileSync(
      path.join(appDir, 'layout.tsx'),
      `export default function Layout({ children }) {
  return <html><body>{children}</body></html>;
}`
    );

    // 创建子路由
    fs.mkdirSync(path.join(appDir, 'about'), { recursive: true });
    fs.writeFileSync(
      path.join(appDir, 'about', 'page.tsx'),
      `export default function About() {
  return <div>About Page</div>;
}`
    );
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('generate command', () => {
    it('should generate bundleless files with default options', () => {
      const command = `node ${cliPath} generate --root ${testDir} --quiet`;
      execSync(command, { encoding: 'utf-8' });

      // 验证输出目录存在
      expect(fs.existsSync(outputDir)).toBe(true);

      // 验证根路由文件
      expect(fs.existsSync(path.join(outputDir, 'index', 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'index', 'component.jsx'))).toBe(true);

      // 验证子路由文件
      expect(fs.existsSync(path.join(outputDir, 'about', 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'about', 'component.jsx'))).toBe(true);
    });

    it('should generate files with custom output directory', () => {
      const customOutput = path.join(testDir, 'custom-output');
      const command = `node ${cliPath} generate --root ${testDir} --output ${customOutput} --quiet`;
      execSync(command, { encoding: 'utf-8' });

      expect(fs.existsSync(customOutput)).toBe(true);
      expect(fs.existsSync(path.join(customOutput, 'index', 'index.html'))).toBe(true);
    });

    it('should generate valid HTML content', () => {
      const command = `node ${cliPath} generate --root ${testDir} --quiet`;
      execSync(command, { encoding: 'utf-8' });

      const htmlContent = fs.readFileSync(
        path.join(outputDir, 'index', 'index.html'),
        'utf-8'
      );

      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html');
      expect(htmlContent).toContain('Home Page');
    });

    it('should generate valid JSX component', () => {
      const command = `node ${cliPath} generate --root ${testDir} --quiet`;
      execSync(command, { encoding: 'utf-8' });

      const jsxContent = fs.readFileSync(
        path.join(outputDir, 'index', 'component.jsx'),
        'utf-8'
      );

      expect(jsxContent).toContain('export default function');
      expect(jsxContent).toContain('Home Page');
    });
  });
});
