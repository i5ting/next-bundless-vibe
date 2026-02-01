import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { findRoutes, getAllRoutes } from '../src/core/route-finder';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('route-finder', () => {
  const testDir = path.join(__dirname, 'fixtures', 'app');

  beforeEach(() => {
    // 创建测试目录结构
    fs.mkdirSync(path.join(testDir, 'home'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'about'), { recursive: true });
    fs.mkdirSync(path.join(testDir, '_private'), { recursive: true });

    // 创建测试文件
    fs.writeFileSync(path.join(testDir, 'page.tsx'), 'export default function Home() {}');
    fs.writeFileSync(path.join(testDir, 'home', 'page.tsx'), 'export default function Home() {}');
    fs.writeFileSync(path.join(testDir, 'about', 'page.js'), 'export default function About() {}');
    fs.writeFileSync(path.join(testDir, '_private', 'page.tsx'), 'export default function Private() {}');
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('findRoutes', () => {
    it('should find all routes in subdirectories', () => {
      const routes = findRoutes(testDir);

      expect(routes).toHaveLength(2);
      expect(routes.some(r => r.path === '/home')).toBe(true);
      expect(routes.some(r => r.path === '/about')).toBe(true);
    });

    it('should include file and directory info', () => {
      const routes = findRoutes(testDir);
      const homeRoute = routes.find(r => r.path === '/home');

      expect(homeRoute).toBeDefined();
      expect(homeRoute.file).toContain('page.tsx');
      expect(homeRoute.directory).toContain('home');
    });

    it('should ignore directories starting with underscore', () => {
      const routes = findRoutes(testDir);

      expect(routes.some(r => r.path.includes('_private'))).toBe(false);
    });

    it('should return empty array for non-existent directory', () => {
      const routes = findRoutes(path.join(testDir, 'non-existent'));

      expect(routes).toEqual([]);
    });

    it('should ignore directories starting with dot', () => {
      fs.mkdirSync(path.join(testDir, '.hidden'), { recursive: true });
      fs.writeFileSync(path.join(testDir, '.hidden', 'page.tsx'), 'export default function Hidden() {}');

      const routes = findRoutes(testDir);

      expect(routes.some(r => r.path.includes('.hidden'))).toBe(false);
    });

    it('should find nested routes recursively', () => {
      fs.mkdirSync(path.join(testDir, 'blog', 'posts'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'blog', 'posts', 'page.tsx'), 'export default function Posts() {}');

      const routes = findRoutes(testDir);

      expect(routes.some(r => r.path === '/blog/posts')).toBe(true);
    });

    it('should find directory without page file and recurse', () => {
      fs.mkdirSync(path.join(testDir, 'blog', 'posts'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'blog', 'posts', 'page.tsx'), 'export default function Posts() {}');

      const routes = findRoutes(testDir);

      expect(routes.some(r => r.path === '/blog/posts')).toBe(true);
      expect(routes.some(r => r.path === '/blog')).toBe(false);
    });

    it('should handle page.js files in subdirectories', () => {
      fs.mkdirSync(path.join(testDir, 'products'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'products', 'page.js'), 'export default function Products() {}');

      const routes = findRoutes(testDir);

      expect(routes.some(r => r.path === '/products')).toBe(true);
    });
  });

  describe('getAllRoutes', () => {
    it('should find root route and all sub routes', () => {
      const routes = getAllRoutes(testDir);

      expect(routes).toHaveLength(3);
      expect(routes.some(r => r.path === '/')).toBe(true);
      expect(routes.some(r => r.path === '/home')).toBe(true);
      expect(routes.some(r => r.path === '/about')).toBe(true);
    });

    it('should return only sub routes if no root page exists', () => {
      fs.unlinkSync(path.join(testDir, 'page.tsx'));
      const routes = getAllRoutes(testDir);

      expect(routes).toHaveLength(2);
      expect(routes.some(r => r.path === '/')).toBe(false);
    });

    it('should find page.js files', () => {
      fs.unlinkSync(path.join(testDir, 'page.tsx'));
      fs.writeFileSync(path.join(testDir, 'page.js'), 'export default function Home() {}');

      const routes = getAllRoutes(testDir);

      expect(routes.some(r => r.path === '/')).toBe(true);
    });
  });
});
