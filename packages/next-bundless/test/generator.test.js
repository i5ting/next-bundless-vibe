import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BundlelessGenerator, GeneratorConfig } from '../src/core/generator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('generator', () => {
  describe('GeneratorConfig', () => {
    it('should use default values', () => {
      const config = new GeneratorConfig();

      expect(config.projectRoot).toBe(process.cwd());
      expect(config.verbose).toBe(true);
    });

    it('should accept custom options', () => {
      const config = new GeneratorConfig({
        projectRoot: '/custom/path',
        verbose: false
      });

      expect(config.projectRoot).toBe('/custom/path');
      expect(config.verbose).toBe(false);
    });
  });

  describe('BundlelessGenerator', () => {
    const testDir = path.join(__dirname, 'fixtures', 'generator-test');
    const appDir = path.join(testDir, 'app');
    const outputDir = path.join(testDir, 'bundleless');

    beforeEach(() => {
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, 'page.tsx'),
        'export default function Home() { return <div>Home</div>; }'
      );
      fs.writeFileSync(
        path.join(appDir, 'layout.tsx'),
        'export default function Layout({ children }) { return <html><body>{children}</body></html>; }'
      );
    });

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should generate bundleless files', () => {
      const generator = new BundlelessGenerator({
        projectRoot: testDir,
        verbose: false
      });

      generator.generate();

      expect(fs.existsSync(outputDir)).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'index', 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'index', 'component.jsx'))).toBe(true);
    });

    it('should handle no routes found', () => {
      fs.rmSync(appDir, { recursive: true, force: true });
      fs.mkdirSync(appDir, { recursive: true });

      const generator = new BundlelessGenerator({
        projectRoot: testDir,
        verbose: false
      });

      generator.generate();

      const routes = fs.existsSync(outputDir) ? fs.readdirSync(outputDir) : [];
      expect(routes.length).toBe(0);
    });

    it('should log messages when verbose is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const generator = new BundlelessGenerator({
        projectRoot: testDir,
        verbose: true
      });

      generator.generate();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
